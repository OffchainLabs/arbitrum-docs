import React from "react";
import { ethers } from 'ethers'
import VendingMachineContract from './VendingMachine.sol/VendingMachine.json'

export const VendingMachine = (props: { id: string, type: string }) => {

  class Web2VendingMachineClient {
    // UI concerns
    isWeb3 = false;
    identityLabel = "Name";

    // state variables = internal memory of the vending machine
    cupcakeBalances = {};
    cupcakeDistributionTimes = {};

    // the web3 version of the vending machine implements this using ethereum
    async giveCupcakeTo(identity) {
      if (this.cupcakeDistributionTimes[identity] === undefined) {
        this.cupcakeBalances[identity] = 0;
        this.cupcakeDistributionTimes[identity] = 0;
      }

      // Rule 1: The vending machine will distribute a cupcake to anyone who hasn't recently received one.
      const fiveSeconds = 5000;
      const userCanReceiveCupcake = this.cupcakeDistributionTimes[identity] + fiveSeconds <= Date.now();
      if (userCanReceiveCupcake) {
        this.cupcakeBalances[identity]++;
        this.cupcakeDistributionTimes[identity] = Date.now();
        return true;
      } else {
        console.error("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
        return false;
      }
    }

    // the web3 version of the vending machine implements this using ethereum
    async getCupcakeBalanceFor(identity) {
      let balance = this.cupcakeBalances[identity];
      if (balance === undefined)
        balance = 0;
      return balance;
    }
  }

  class Web3VendingMachineClient {
    // UI concerns
    isWeb3 = true;
    identityLabel = "Metamask wallet address";

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
      return cupcakeBalance;
    }

    async requestAccount() {
      if (ethereumAvailable()) {
        // "hey metamask, please ask the user to connect their wallet and select an account"
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
    }

    async getWalletAddress() {
      if (ethereumAvailable()) {
        // "hey metamask, please give me the wallet address corresponding to the account the user has selected"
        const signer = await this.initSigner();
        const walletAddress = await signer.getAddress();
        console.log(`wallet address: ${walletAddress}`);
        return walletAddress;
      }
    }

    async initSigner() {
      if (ethereumAvailable()) {
        // "hey metamask, let's prepare to sign transactions with the account the user has selected"
        await this.requestAccount();
        const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = metamaskProvider.getSigner();
        return signer;
      }
    }

    async initContract(vendingMachineContractAddress) {
      if (ethereumAvailable()) {
        // "hey metamask, let's use the network and account the user has selected to interact with the contract"
        const signer = await this.initSigner();
        const contract = new ethers.Contract(vendingMachineContractAddress, VendingMachineContract.abi, signer)
        return contract;
      }
    }

    ethereumAvailable() {
      return typeof window.ethereum !== 'undefined';
    }
  }

  const vendingMachineClient = props.type == "web2" ? new Web2VendingMachineClient() : new Web3VendingMachineClient();
  vendingMachineClient.domId = props.id;
  vendingMachineClient.getElementById = (id) => document.getElementById(vendingMachineClient.domId).querySelector(`#${id}`);

  const prefillWeb3Identity = async () => {
    // if the user has metamask installed, prefill the identity input with their wallet address
    identityInput.value = identityInput.value || await vendingMachineClient.getWalletAddress();
  }

  const updateSuccessIndicator = (success) => {
    vendingMachineClient.getElementById("error-indicator").classList.toggle("visible", !success);
  }

  const callWeb3VendingMachine = async (func) => {
    const identityInput = vendingMachineClient.getElementById("identity-input");
    const identity = identityInput.value;
    const contractAddressInput = vendingMachineClient.getElementById("contract-address-input");
    const contractAddress = contractAddressInput.value;
    return await func(identity, contractAddress);
  }

  const handleCupcakePlease = async () => {
    try {
      const identityInput = vendingMachineClient.getElementById("identity-input");
      const identity = identityInput.value;

      let gotCupcake;
      if (vendingMachineClient.isWeb3) {
        await prefillWeb3Identity();
        gotCupcake = await callWeb3VendingMachine(vendingMachineClient.giveCupcakeTo);
      } else {
        gotCupcake = await vendingMachineClient.giveCupcakeTo(identity);
      }

      let existingFadeout;
      if (gotCupcake) {
        const cupcake = vendingMachineClient.getElementById("cupcake");
        cupcake.style.opacity = 1;
        cupcake.style.transition = "unset";
        clearTimeout(existingFadeout);

        existingFadeout = setTimeout(() => {
          cupcake.style.transition = "opacity 5.5s";
          cupcake.style.opacity = 0;
        }, 0);

        setTimeout(() => {
          cupcake.style.transition = "opacity 0s";
          cupcake.style.opacity = 0;
        }, 5000);

        await handleRefreshBalance();
      } else if (gotCupcake === false) {
        alert("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
      }
      updateSuccessIndicator(true);
    } catch (err) {
      console.error("ERROR: handleCupcakePlease: " + err);
      updateSuccessIndicator(false);
    }
  };

  const handleRefreshBalance = async () => {
    try {
      const identityInputEl = vendingMachineClient.getElementById("identity-input");
      let identityFromInput = identityInputEl.value;
      let identityToDisplay;
      const cupcakeCountEl = vendingMachineClient.getElementById("cupcake-balance");
      let balanceToDisplay;

      if (vendingMachineClient.isWeb3) {
        await prefillWeb3Identity();
        balanceToDisplay = await callWeb3VendingMachine(vendingMachineClient.getCupcakeBalanceFor);
        identityFromInput = identityInputEl.value;
        identityToDisplay = identityFromInput.truncateAddress();
      } else {
        identityToDisplay = identityFromInput;
        if (identityToDisplay == null || identityToDisplay == "")
          identityToDisplay = "no name";
        balanceToDisplay = await vendingMachineClient.getCupcakeBalanceFor(identityFromInput);
      }

      cupcakeCountEl.textContent = `${balanceToDisplay} (${identityToDisplay})`
      updateSuccessIndicator(true);
    } catch (err) {
      console.error("ERROR: handleRefreshBalance: " + err);
      updateSuccessIndicator(false);
    }
  };

  String.prototype.truncateAddress = function () {
    return this.slice(0, 5) + "..." + this.slice(-3);
  };

  return (
    <div className='vending-machine' id={vendingMachineClient.domId}>
      <h4>Free Cupcakes</h4>
      <span className='subheader'>{props.type}</span>
      <label>{vendingMachineClient.identityLabel}</label>
      <input id="identity-input" type="text" placeholder={"Enter " + vendingMachineClient.identityLabel.toLowerCase()} />
      <label className={vendingMachineClient.isWeb3 ? '' : 'hidden'}>Contract address</label>
      <input id="contract-address-input" type="text" placeholder="Enter contract address" className={vendingMachineClient.isWeb3 ? '' : 'hidden'} />
      <button id="cupcake-please" onClick={handleCupcakePlease}>Cupcake please!</button>
      <a id="refresh-balance" onClick={handleRefreshBalance}>Refresh balance</a>
      <span id="cupcake" style={{ opacity: 0 }}> 🧁</span>
      <p id='balance-wrapper'>
        <span>Cupcake balance:</span>
        <span id="cupcake-balance">0</span>
      </p>
      <span id="success-indicator"></span>
      <span id="error-indicator"></span>
    </div>
  );
};
