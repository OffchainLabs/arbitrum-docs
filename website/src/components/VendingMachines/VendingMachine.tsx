import React from "react";
import { ethers } from 'ethers'
import VendingMachineContract from './VendingMachine.sol/VendingMachine.json'

export const VendingMachine = (props: { id: string, type: string }) => {

  class Web3VendingMachineClient {
    // private
    async requestAccount() {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    // private
    async initContract(vendingMachineContractAddress, port) {
      if (typeof window.ethereum !== 'undefined') {
        await this.requestAccount();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(vendingMachineContractAddress, VendingMachineContract.abi, signer)

        return contract;
      }
    }

    async giveCupcakeTo(identity, vendingMachineContractAddress, port) {
      const contract = await this.initContract(vendingMachineContractAddress, port);
      const cupcakeCountBefore = await contract.getCupcakeBalanceFor(identity);
      const transaction = await contract.giveCupcakeTo(identity);
      const cupcakeCountAfter = await contract.getCupcakeBalanceFor(identity);
      const succeeded = cupcakeCountAfter == cupcakeCountBefore + 1;

      return succeeded;
    }

    async getCupcakeBalanceFor(identity, vendingMachineContractAddress, port) {
      const contract = await this.initContract(vendingMachineContractAddress, port);
      const cupcakeBalance = await contract.getCupcakeBalanceFor(identity);
      return cupcakeBalance;
    }
  }

  class Web2VendingMachineClient {
    // Internal memory of the vending machine
    cupcakeBalances = {};
    cupcakeDistributionTimes = {};

    // Vend a cupcake to the caller
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
        console.log(`Enjoy your cupcake, ${identity}!`);
        return true;
      } else {
        console.error("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
        return false;
      }
    }

    async getCupcakeBalanceFor(identity) {
      let balance = this.cupcakeBalances[userId];
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

  const handleCupcakePlease = async () => {
    const identity = vendingMachineClient.getElementById("identity-input").value;

    let gotCupcake = false;
    try {
      gotCupcake = await vendingMachineClient.giveCupcakeTo(name);
    } catch (error) {
      console.error("ERROR: " + JSON.stringify(error));
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
    } else {
      alert("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
    }
  };

  const handleRefreshBalance = async () => {
    const identity = vendingMachineClient.getElementById("identity-input").value;

    let identityToDisplay = identity;
    if (identityToDisplay == null || identityToDisplay == "")
      identityToDisplay = "no name";

    const cupcakeCountEl = vendingMachineClient.getElementById("cupcake-balance");
    const balanceToDisplay = await vendingMachine.getCupcakeBalanceFor(identity);

    cupcakeCountEl.textContent = `${balanceToDisplay} (${identityToDisplay})`
  };

  const isWeb3 = props.type.startsWith("web3");

  return (
    <div className='vending-machine'>
      <h4>Free Cupcakes</h4>
      <span className='subheader'>(web2)</span>
      <input id="identity-input" type="text" placeholder="Enter identity" />
      <input id="contract-address-input" type="text" placeholder="Enter contract address" className={isWeb3 ? '' : 'hidden'} />
      <input id="port-input" type="text" placeholder="Enter port" className={isWeb3 ? '' : 'hidden'} />
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
