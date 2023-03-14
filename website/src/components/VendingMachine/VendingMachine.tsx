import React from "react";
import { ethers } from 'ethers'
import VendingMachineContract from './VendingMachine.sol/VendingMachine.json'

export const VendingMachine = (props: { id: string, type: string }) => {

  class Web3VendingMachineClient {

    // stash hasRequestedAccount to prevent multiple requests
    hasRequestedAccount = false;

    // ensures that the context of this is always defined
    constructor() {
      this.giveCupcakeTo = this.giveCupcakeTo.bind(this);
      this.getCupcakeBalanceFor = this.getCupcakeBalanceFor.bind(this);
      this.requestAccount = this.requestAccount.bind(this);
      this.getWalletAddress = this.getWalletAddress.bind(this);
      this.initContract = this.initContract.bind(this);
    }

    async giveCupcakeTo(identity, vendingMachineContractAddress, port) {
      const contract = await this.initContract(vendingMachineContractAddress, port);
      const cupcakeCountBefore = Number(await contract.getCupcakeBalanceFor(identity));
      const transaction = await contract.giveCupcakeTo(identity);
      const receipt = await transaction.wait();
      const cupcakeCountAfter = Number(await contract.getCupcakeBalanceFor(identity));
      const succeeded = cupcakeCountAfter == cupcakeCountBefore + 1;
      return succeeded;
    }

    async getCupcakeBalanceFor(identity, vendingMachineContractAddress, port) {
      console.log("getCupcakeBalanceFor: " + identity);
      // log this
      console.log("this: ", this);

      const contract = await this.initContract(vendingMachineContractAddress, port);
      const cupcakeBalance = await contract.getCupcakeBalanceFor(identity);
      return cupcakeBalance;
    }

    async requestAccount() {
      if (!this.hasRequestedAccount && typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            this.hasRequestedAccount = true;
          }
        } catch (err) {
          console.error("ERROR: requestAccount: " + err);
        }
      }
    }

    async getWalletAddress() {
      if (typeof window.ethereum !== 'undefined') {
        await this.requestAccount();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const walletAddress = await signer.getAddress();

        return walletAddress;
      }
    }

    async initContract(vendingMachineContractAddress, port) {
      if (typeof window.ethereum !== 'undefined') {
        await this.requestAccount();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(vendingMachineContractAddress, VendingMachineContract.abi, signer)

        return contract;
      }
    }
  }

  class Web2VendingMachineClient {
    cupcakeBalances = {};
    cupcakeDistributionTimes = {};

    async giveCupcakeTo(identity) {
      if (this.cupcakeDistributionTimes[identity] === undefined) {
        this.cupcakeBalances[identity] = 0;
        this.cupcakeDistributionTimes[identity] = 0;
      }

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

    async getCupcakeBalanceFor(identity) {
      let balance = this.cupcakeBalances[identity];
      if (balance === undefined)
        balance = 0;
      return balance;
    }
  }

  let vendingMachineClient;
  switch (props.type) {
    case "web2":
      vendingMachineClient = new Web2VendingMachineClient();
      break;
    case "web3-localhost":
      vendingMachineClient = new Web3VendingMachineClient();
      break;
    case "web3-arb-goerli":
      vendingMachineClient = new Web3VendingMachineClient();
      break;
    default:
      throw new Error(`Error: unknown vending machine type ${props.type}`);
  }

  vendingMachineClient.domId = props.id;
  vendingMachineClient.getElementById = (id) => document.getElementById(vendingMachineClient.domId).querySelector(`#${id}`);
  const isWeb3 = props.type.startsWith("web3");

  const prefillWeb3Identity = async () => {
    const identityInput = vendingMachineClient.getElementById("identity-input");
    if (identityInput.value == "" || identityInput.value == null) {
      identityInput.value = await vendingMachineClient.getWalletAddress();
    }
  }

  const callWeb3VendingMachine = async (func) => {
    const identityInput = vendingMachineClient.getElementById("identity-input");
    const identity = identityInput.value;
    const contractAddressInput = vendingMachineClient.getElementById("contract-address-input");
    contractAddressInput.value = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // temp
    const contractAddress = contractAddressInput.value;
    const portInput = vendingMachineClient.getElementById("port-input");
    const port = portInput.value;
    console.log("calling " + func.name + " with identity " + identity + " and contract address " + contractAddress + " and port " + port);
    return await func(identity, contractAddress, port);
  }

  const handleCupcakePlease = async () => {

    const identityInput = vendingMachineClient.getElementById("identity-input");
    const identity = identityInput.value;

    let gotCupcake;
    if (isWeb3) {
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
  };

  const handleRefreshBalance = async () => {
    const identityInputEl = vendingMachineClient.getElementById("identity-input");
    let identityToDisplay;
    const cupcakeCountEl = vendingMachineClient.getElementById("cupcake-balance");
    let balanceToDisplay;

    if (isWeb3) {
      console.log("prefilling web3 identity");
      await prefillWeb3Identity();
      console.log("calling getCupcakeBalanceFor");
      balanceToDisplay = await callWeb3VendingMachine(vendingMachineClient.getCupcakeBalanceFor);
      console.log("got balance: " + balanceToDisplay);
      identityToDisplay = identityInputEl.value.truncateAddress();
    } else {
      identityToDisplay = identityInputEl.value;
      if (identityToDisplay == null || identityToDisplay == "")
        identityToDisplay = "no name";
      balanceToDisplay = await vendingMachineClient.getCupcakeBalanceFor(identity);
    }

    cupcakeCountEl.textContent = `${balanceToDisplay} (${identityToDisplay})`
  };

  String.prototype.truncateAddress = function () {
    return this.slice(0, 5) + "..." + this.slice(-3);
  };

  return (
    <div className='vending-machine' id={vendingMachineClient.domId}>
      <h4>Free Cupcakes</h4>
      <span className='subheader'>{props.type}</span>
      <label>Identity</label>
      <input id="identity-input" type="text" placeholder="Enter identity" />
      <label className={isWeb3 ? '' : 'hidden'}>Contract address</label>
      <input id="contract-address-input" type="text" placeholder="Enter contract address" className={isWeb3 ? '' : 'hidden'} />
      <label className={isWeb3 ? '' : 'hidden'}>Port</label>
      <input id="port-input" type="text" placeholder="Enter port" className={isWeb3 ? '' : 'hidden'} defaultValue="8545" />
      <button id="cupcake-please" onClick={handleCupcakePlease}>Cupcake please!</button>
      <a id="refresh-balance" onClick={handleRefreshBalance}>Refresh balance</a>
      <span id="cupcake" style={{ opacity: 0 }}> 🧁</span>
      <p id='balance-wrapper'>
        <span>Cupcake balance:</span>
        <span id="cupcake-balance">0</span>
      </p>
    </div>
  );
};
