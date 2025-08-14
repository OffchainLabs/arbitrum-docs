import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import VendingMachineContract from './VendingMachine.sol/VendingMachine.json';

function truncateAddress(text: string) {
  if (text == null || text === '') {
    return 'no name';
  }
  if (text.length < 10) {
    return text;
  }
  return text.slice(0, 5) + '...' + text.slice(-3);
}

export const VendingMachine = (props: { id: string; type: string }) => {
  const [identity, setIdentity] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>();
  const [cupcakeBalance, setCupcakeBalance] = useState<number>(0);
  const cupcakeRef = useRef(null);
  const errorIndicatorRef = useRef(null);

  class Web2VendingMachineClient {
    // UI concerns
    isWeb3 = false;
    identityLabel = 'Name';

    // state variables = internal memory of the vending machine
    cupcakeBalances = {};
    cupcakeDistributionTimes = {};

    // the web3 version of the vending machine implements this using ethereum
    async giveCupcakeTo(identity: string) {
      if (this.cupcakeDistributionTimes[identity] === undefined) {
        this.cupcakeBalances[identity] = 0;
        this.cupcakeDistributionTimes[identity] = 0;
      }

      // Rule 1: The vending machine will distribute a cupcake to anyone who hasn't recently received one.
      const fiveSeconds = 5000;
      const userCanReceiveCupcake =
        this.cupcakeDistributionTimes[identity] + fiveSeconds <= Date.now();
      if (userCanReceiveCupcake) {
        this.cupcakeBalances[identity]++;
        this.cupcakeDistributionTimes[identity] = Date.now();
        return true;
      } else {
        console.error(
          'HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)',
        );
        return false;
      }
    }

    // the web3 version of the vending machine implements this using ethereum
    async getCupcakeBalanceFor(identity: string) {
      let balance = this.cupcakeBalances[identity];
      if (balance === undefined) balance = 0;
      return balance;
    }
  }

  class Web3VendingMachineClient {
    // UI concerns
    isWeb3 = true;
    identityLabel = 'Metamask wallet address';

    // notice the absence of state variables; the web3 version of the vending machine stores its state in a blockchain data structure hosted by Ethereum's decentralized network of nodes

    // ensures that the context of `this` is always defined
    constructor() {
      this.giveCupcakeTo = this.giveCupcakeTo.bind(this);
      this.getCupcakeBalanceFor = this.getCupcakeBalanceFor.bind(this);
      this.requestAccount = this.requestAccount.bind(this);
      this.getWalletAddress = this.getWalletAddress.bind(this);
      this.initContract = this.initContract.bind(this);
    }

    // the web2 version of the vending machine implements this without using ethereum
    async giveCupcakeTo(identity, vendingMachineContractAddress) {
      const contract = await this.initContract(vendingMachineContractAddress);
      const cupcakeCountBefore = Number(await contract.getCupcakeBalanceFor(identity));
      const transaction = await contract.giveCupcakeTo(identity);
      const receipt = await transaction.wait();
      const cupcakeCountAfter = Number(await contract.getCupcakeBalanceFor(identity));
      const succeeded = cupcakeCountAfter == cupcakeCountBefore + 1;
      return succeeded;
    }

    // the web2 version of the vending machine implements this without using ethereum
    async getCupcakeBalanceFor(identity, vendingMachineContractAddress) {
      // console log everything in one line
      console.log(`getting cupcake balance for ${identity} on ${vendingMachineContractAddress}`);
      const contract = await this.initContract(vendingMachineContractAddress);
      const cupcakeBalance = await contract.getCupcakeBalanceFor(identity);
      return BigNumber.from(cupcakeBalance).toNumber();
    }

    async requestAccount() {
      if (this.ethereumAvailable()) {
        // "hey metamask, please ask the user to connect their wallet and select an account"
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
    }

    async getWalletAddress() {
      if (this.ethereumAvailable()) {
        // "hey metamask, please give me the wallet address corresponding to the account the user has selected"
        const signer = await this.initSigner();
        const walletAddress = await signer.getAddress();
        console.log(`wallet address: ${walletAddress}`);
        return walletAddress;
      }
    }

    async initSigner() {
      if (this.ethereumAvailable()) {
        // "hey metamask, let's prepare to sign transactions with the account the user has selected"
        await this.requestAccount();
        const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = metamaskProvider.getSigner();
        return signer;
      }
    }

    async initContract(vendingMachineContractAddress) {
      if (this.ethereumAvailable()) {
        // "hey metamask, let's use the network and account the user has selected to interact with the contract"
        const signer = await this.initSigner();
        const contract = new ethers.Contract(
          vendingMachineContractAddress,
          VendingMachineContract.abi,
          signer,
        );
        return contract;
      }
    }

    ethereumAvailable() {
      return typeof window.ethereum !== 'undefined';
    }
  }

  const vendingMachineClient =
    props.type == 'web2' ? new Web2VendingMachineClient() : new Web3VendingMachineClient();

  const updateSuccessIndicator = (success: boolean) => {
    errorIndicatorRef.current.classList.toggle('visible', !success);
  };

  const callWeb3VendingMachine = useCallback(
    async (func) => {
      return await func(identity, contractAddress);
    },
    [identity, contractAddress],
  );

  const handleCupcakePlease = useCallback(async () => {
    try {
      let gotCupcake;
      if (vendingMachineClient.isWeb3) {
        gotCupcake = await callWeb3VendingMachine(vendingMachineClient.giveCupcakeTo);
      } else {
        gotCupcake = await (vendingMachineClient as Web2VendingMachineClient).giveCupcakeTo(
          identity || 'no name',
        );
      }

      let existingFadeout;
      if (gotCupcake) {
        cupcakeRef.current.style.opacity = 1;
        cupcakeRef.current.style.transition = 'unset';
        clearTimeout(existingFadeout);

        existingFadeout = setTimeout(() => {
          cupcakeRef.current.style.transition = 'opacity 5.5s';
          cupcakeRef.current.style.opacity = 0;
        }, 0);

        setTimeout(() => {
          cupcakeRef.current.style.transition = 'opacity 0s';
          cupcakeRef.current.style.opacity = 0;
        }, 5000);

        await handleRefreshBalance();
      } else if (gotCupcake === false) {
        alert('HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)');
      }
      updateSuccessIndicator(true);
    } catch (err) {
      console.error('ERROR: handleCupcakePlease: ' + err);
      updateSuccessIndicator(false);
    }
  }, [identity, callWeb3VendingMachine]);

  const handleRefreshBalance = useCallback(async () => {
    try {
      if (vendingMachineClient.isWeb3) {
        setCupcakeBalance(await callWeb3VendingMachine(vendingMachineClient.getCupcakeBalanceFor));
      } else {
        setCupcakeBalance(
          await (vendingMachineClient as Web2VendingMachineClient).getCupcakeBalanceFor(
            identity || 'no name',
          ),
        );
      }
      updateSuccessIndicator(true);
    } catch (err) {
      console.error('ERROR: handleRefreshBalance: ' + err);
      updateSuccessIndicator(false);
    }
  }, [identity, callWeb3VendingMachine]);

  return (
    <div className="vending-machine">
      <h4>Free Cupcakes</h4>
      <span className="subheader">{props.type}</span>
      <label>{vendingMachineClient.identityLabel}</label>
      <input
        type="text"
        placeholder={'Enter ' + vendingMachineClient.identityLabel.toLowerCase()}
        value={identity}
        onChange={(event) => setIdentity(event.target.value)}
      />
      <label className={vendingMachineClient.isWeb3 ? '' : 'hidden'}>Contract address</label>
      <input
        type="text"
        placeholder="Enter contract address"
        value={contractAddress}
        onChange={(event) => setContractAddress(event.target.value)}
        className={vendingMachineClient.isWeb3 ? '' : 'hidden'}
      />
      <button className="cupcake-please" onClick={handleCupcakePlease}>
        Cupcake please!
      </button>
      <a className="refresh-balance" onClick={handleRefreshBalance}>
        Refresh balance
      </a>
      <span ref={cupcakeRef} className="cupcake" style={{ opacity: 0 }}>
        🧁
      </span>
      <p className="balance-wrapper">
        <span>Cupcake balance:</span>
        <span>
          {cupcakeBalance} {`(${truncateAddress(identity)})`}
        </span>
      </p>
      <span className="success-indicator" />
      <span className="error-indicator" ref={errorIndicatorRef} />
    </div>
  );
};
