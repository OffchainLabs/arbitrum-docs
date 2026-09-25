'use client';

import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { type Address, createPublicClient, createWalletClient, custom, isAddress } from 'viem';
// viem ships the `Window.ethereum` augmentation as its own module. Importing it beats re-declaring
// the global here, where a second copy elsewhere in the app would conflict. Type-only, so nothing
// reaches the bundle.
import type {} from 'viem/window';

import { cn } from '@/lib/cn';

import { vendingMachineAbi } from './abi';

/**
 * The three widgets the quickstart renders, in page order. A closed union rather than `string`
 * because `web2` and `web3` are opposite halves of the page's argument: a value that is neither
 * must not quietly pick one of them.
 */
export type VendingMachineMode = 'web2' | 'web3-localhost' | 'web3-arb-sepolia';

const WEB3_MODES = new Set<string>(['web3-localhost', 'web3-arb-sepolia']);

/** Milliseconds a web2 identity must wait between cupcakes. Mirrors the quickstart's "Rule 1". */
const RATE_LIMIT_MS = 5000;
const RATE_LIMIT_MESSAGE =
  'HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)';
/** How long the cupcake emoji stays on screen, and how long its fade runs. */
const CUPCAKE_VISIBLE_MS = 5500;
/**
 * Upper bound on the receipt wait. Without one, a wedged local devnet (the setup this page walks the
 * reader through) leaves both buttons disabled on "Working…" with no way out but a reload. viem's
 * timeout error carries a `shortMessage`, so it surfaces as the component's normal error text.
 */
const RECEIPT_TIMEOUT_MS = 90_000;

function truncateAddress(text: string) {
  if (!text) return 'no name';
  if (text.length < 10) return text;
  return `${text.slice(0, 5)}...${text.slice(-3)}`;
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'shortMessage' in error) {
    const short = (error as { shortMessage?: unknown }).shortMessage;
    if (typeof short === 'string') return short;
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * The quickstart's "free cupcakes" demo, ported from the Docusaurus `VendingMachine` component.
 *
 * The page renders it three times: once as `web2` (state lives in this browser tab) and twice as
 * web3 (state lives in a `VendingMachine.sol` the reader deploys themselves, on a local chain and
 * then on Arbitrum Sepolia). That contrast is the entire point of the page, so both modes and the
 * reader-supplied contract address are preserved exactly as upstream had them.
 *
 * Upstream used ethers v6; this uses viem over the injected EIP-1193 provider, which keeps reads
 * and writes on whatever network the reader picked in their wallet. No chain or contract address is
 * hardcoded, because readers deploy their own instance from Remix.
 */
export function VendingMachine({ id, type = 'web2' }: { id?: string; type?: VendingMachineMode }) {
  // Membership test rather than `type !== 'web2'`: MDX call sites are not type-checked, and a
  // misspelling should fall back to the harmless web2 widget instead of asking a reader on a web2
  // page for a contract address and a wallet signature.
  const isWeb3 = WEB3_MODES.has(type);
  const identityLabel = isWeb3 ? 'Metamask wallet address' : 'Name';

  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const [identity, setIdentity] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [cupcakeBalance, setCupcakeBalance] = useState(0);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [cupcakeShown, setCupcakeShown] = useState(false);
  const [cupcakeFading, setCupcakeFading] = useState(false);
  // Undefined until mounted: `window.ethereum` cannot be read during render without breaking
  // hydration, so the wallet notice appears after the first client pass.
  const [hasWallet, setHasWallet] = useState<boolean | undefined>(undefined);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Web2 "back end": a plain object in this tab's memory, the counterpart to the contract storage
  // the web3 modes use. A ref rather than state so a re-render never resets the balances.
  const web2Store = useRef<{
    balances: Record<string, number>;
    lastCupcakeAt: Record<string, number>;
  }>({ balances: {}, lastCupcakeAt: {} });
  const fadeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setHasWallet(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined');
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(
    () => () => {
      for (const timer of fadeTimers.current) clearTimeout(timer);
    },
    [],
  );

  const showCupcake = useCallback(() => {
    for (const timer of fadeTimers.current) clearTimeout(timer);
    fadeTimers.current = [];
    setCupcakeShown(true);
    setCupcakeFading(false);
    // Under `prefers-reduced-motion` the cupcake simply stays put for its full time and then goes,
    // rather than crossfading. Suppressing the transition alone would make it vanish immediately,
    // which loses the reward the button is there to give.
    if (!reducedMotion) {
      fadeTimers.current.push(setTimeout(() => setCupcakeFading(true), 0));
    }
    fadeTimers.current.push(setTimeout(() => setCupcakeShown(false), CUPCAKE_VISIBLE_MS));
  }, [reducedMotion]);

  /**
   * Reads go through a public client and writes through a wallet client, both over the injected
   * provider. Throwing here (rather than returning undefined) keeps the "no wallet" case a message
   * in the UI instead of a silent no-op.
   */
  const requireProvider = useCallback(() => {
    const provider = typeof window === 'undefined' ? undefined : window.ethereum;
    if (!provider) throw new Error('No Ethereum wallet detected in this browser.');
    return provider;
  }, []);

  const requireWeb3Inputs = useCallback(() => {
    if (!isAddress(identity)) throw new Error('Enter a valid wallet address.');
    if (!isAddress(contractAddress)) throw new Error('Enter a valid contract address.');
    return { account: identity as Address, contract: contractAddress as Address };
  }, [identity, contractAddress]);

  const readBalance = useCallback(async () => {
    if (!isWeb3) return web2Store.current.balances[identity || 'no name'] ?? 0;

    const { account, contract } = requireWeb3Inputs();
    const publicClient = createPublicClient({
      transport: custom(requireProvider()),
      pollingInterval: 1_000,
    });
    const balance = await publicClient.readContract({
      address: contract,
      abi: vendingMachineAbi,
      functionName: 'getCupcakeBalanceFor',
      args: [account],
    });
    return Number(balance);
  }, [identity, isWeb3, requireProvider, requireWeb3Inputs]);

  const handleRefreshBalance = useCallback(async () => {
    setBusy(true);
    try {
      setCupcakeBalance(await readBalance());
      setFailed(false);
      setStatus('');
    } catch (error) {
      setFailed(true);
      setStatus(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [readBalance]);

  const handleCupcakePlease = useCallback(async () => {
    setBusy(true);
    try {
      let gotCupcake: boolean;
      // What to say when no cupcake came out. The two modes fail for different reasons, so they do
      // not share a message: `VendingMachine.sol` enforces the same five-second rule by reverting
      // with RATE_LIMIT_MESSAGE, and that revert arrives as a thrown error, not as this branch.
      let failureMessage = RATE_LIMIT_MESSAGE;

      if (isWeb3) {
        const { account, contract } = requireWeb3Inputs();
        const provider = requireProvider();
        const publicClient = createPublicClient({
          transport: custom(provider),
          pollingInterval: 1_000,
        });
        const walletClient = createWalletClient({ transport: custom(provider) });
        // Prompts the wallet to connect if it has not been connected yet.
        const [signer] = await walletClient.requestAddresses();
        if (!signer) throw new Error('No account selected in the wallet.');

        const before = Number(
          await publicClient.readContract({
            address: contract,
            abi: vendingMachineAbi,
            functionName: 'getCupcakeBalanceFor',
            args: [account],
          }),
        );
        const hash = await walletClient.writeContract({
          account: signer,
          // The reader picks the network in their wallet (local devnet, then Arbitrum Sepolia), so
          // there is no chain to assert against here.
          chain: null,
          address: contract,
          abi: vendingMachineAbi,
          functionName: 'giveCupcakeTo',
          args: [account],
        });
        await publicClient.waitForTransactionReceipt({ hash, timeout: RECEIPT_TIMEOUT_MS });
        const after = Number(
          await publicClient.readContract({
            address: contract,
            abi: vendingMachineAbi,
            functionName: 'getCupcakeBalanceFor',
            args: [account],
          }),
        );
        gotCupcake = after === before + 1;
        if (!gotCupcake) {
          failureMessage =
            'The transaction was mined but the cupcake balance did not change. Check that the ' +
            'contract address belongs to the network selected in your wallet.';
        }
        setCupcakeBalance(after);
      } else {
        const key = identity || 'no name';
        const store = web2Store.current;
        store.balances[key] ??= 0;
        store.lastCupcakeAt[key] ??= 0;
        // Rule 1: the vending machine gives a cupcake to anyone who has not recently had one.
        gotCupcake = store.lastCupcakeAt[key] + RATE_LIMIT_MS <= Date.now();
        if (gotCupcake) {
          store.balances[key] += 1;
          store.lastCupcakeAt[key] = Date.now();
        }
        setCupcakeBalance(store.balances[key]);
      }

      if (gotCupcake) {
        showCupcake();
        setFailed(false);
        setStatus('');
      } else {
        setFailed(true);
        setStatus(failureMessage);
      }
    } catch (error) {
      setFailed(true);
      setStatus(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [identity, isWeb3, requireProvider, requireWeb3Inputs, showCupcake]);

  const inputClass =
    'w-full rounded border border-fd-border bg-fd-background px-2 py-2 font-mono text-[11px] text-fd-foreground placeholder:text-fd-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';
  const labelClass =
    'mt-2 w-full text-left font-mono text-[11px] font-bold uppercase text-fd-muted-foreground';

  return (
    <div className="relative my-8 flex w-full max-w-[280px] flex-col items-center rounded-lg border border-fd-border bg-fd-card p-5 text-center">
      <h4 className="m-0 font-mono text-base uppercase text-fd-foreground">Free Cupcakes</h4>
      <span className="mb-4 font-mono text-[11px] font-bold uppercase text-fd-muted-foreground">
        {type}
      </span>

      <label className={labelClass} htmlFor={`${fieldId}-identity`}>
        {identityLabel}
      </label>
      <input
        id={`${fieldId}-identity`}
        type="text"
        className={inputClass}
        placeholder={`Enter ${identityLabel.toLowerCase()}`}
        value={identity}
        onChange={(event) => setIdentity(event.target.value)}
      />

      {isWeb3 ? (
        <>
          <label className={labelClass} htmlFor={`${fieldId}-contract`}>
            Contract address
          </label>
          <input
            id={`${fieldId}-contract`}
            type="text"
            className={inputClass}
            placeholder="Enter contract address"
            value={contractAddress}
            onChange={(event) => setContractAddress(event.target.value)}
          />
        </>
      ) : null}

      <button
        type="button"
        className={cn(buttonVariants({ color: 'primary' }), 'mt-5 mb-2 w-full')}
        onClick={handleCupcakePlease}
        disabled={busy}
      >
        {busy ? 'Working…' : 'Cupcake please!'}
      </button>
      <button
        type="button"
        className="mb-2 text-[11px] underline underline-offset-2 hover:opacity-90 disabled:opacity-50"
        onClick={handleRefreshBalance}
        disabled={busy}
      >
        Refresh balance
      </button>

      <span
        aria-hidden="true"
        className="block text-3xl"
        style={{
          opacity: cupcakeShown && !cupcakeFading ? 1 : 0,
          transition: cupcakeFading ? `opacity ${CUPCAKE_VISIBLE_MS}ms linear` : 'none',
        }}
      >
        🧁
      </span>

      <p className="m-0 py-2 font-mono text-[11px] text-fd-foreground">
        <span className="pr-1 font-semibold">Cupcake balance:</span>
        <span>
          {cupcakeBalance} {`(${truncateAddress(identity)})`}
        </span>
      </p>

      {isWeb3 && hasWallet === false ? (
        <p className="m-0 text-[11px] text-fd-muted-foreground">
          No Ethereum wallet detected. Install Metamask (or another EIP-1193 wallet) to use this
          demo.
        </p>
      ) : null}

      {/* Mounted unconditionally: assistive technology commonly misses a live region that appears
          at the same moment as its first message, so only the text inside it changes. */}
      <p
        role="status"
        aria-live="polite"
        className={cn(
          'm-0 text-[11px]',
          status && 'mt-1',
          failed ? 'font-semibold text-fd-danger' : 'text-fd-muted-foreground',
        )}
      >
        {status}
      </p>

      <span
        aria-hidden="true"
        className={cn(
          'absolute right-4 bottom-4 size-2.5 rounded-full',
          failed ? 'bg-fd-danger' : 'bg-fd-success',
        )}
      />
    </div>
  );
}
