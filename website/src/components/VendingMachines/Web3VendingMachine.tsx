

import React from "react";
import { ethers } from 'ethers'
import VendingMachineContract from './VendingMachine.sol/VendingMachine.json'

export const Web3VendingMachine = () => {

  class VendingMachineClient {

    async requestAccount() {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    async giveCupcakeTo(userId) {
      // new
      if (typeof window.ethereum !== 'undefined') {
        await this.requestAccount()

        // this needs to come from the client
        const vendingMachineAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const userAddress = await signer.getAddress() // get user's public wallet address
        const contract = new ethers.Contract(vendingMachineAddress, VendingMachineContract.abi, signer)
        const transaction = await contract.giveCupcakeTo(userAddress);
        console.log("TX RESULT: " + transaction);
        await transaction.wait();
      }

      // old
      //if (this.cupcakeBalances[userId] === undefined) {
      //    this.cupcakeBalances[userId] = 0;
      //    this.cupcakeDistributionTimes[userId] = 0;
      //}
      //
      //// Rule 1: The vending machine will distribute a cupcake to anyone who hasn't recently received one.
      //const fiveSeconds = 5000;
      //const userCanReceiveCupcake = this.cupcakeDistributionTimes[userId] + fiveSeconds <= Date.now();
      //if (userCanReceiveCupcake) {
      //    this.cupcakeBalances[userId]++;
      //    this.cupcakeDistributionTimes[userId] = Date.now();
      //    console.log(`Enjoy your cupcake, ${userId}!`);
      //    return true;
      //} else {
      //    console.error("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
      //    return false;
      //}
    }

    async getCupcakeBalanceFor(userId) {
      // todo
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
        try {
          const data = await contract.greet()
          console.log('data: ', data)
        } catch (err) {
          console.log("Error: ", err)
        }
      }
      // old
      //return this.cupcakeBalances[userId];
    }
  }

  const vendingMachineClient = new VendingMachineClient();

  const handleButtonClick = async () => {
    const name = document.getElementById("name-input").value;
    let gotCupcake = await vendingMachineClient.giveCupcakeTo(name);
    let existingFadeout;
    if (gotCupcake) {
      const cupcake = document.getElementById("cupcake");
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

      const cupcakeCount = document.getElementById("cupcake-balance");
      cupcakeCount.textContent = await vendingMachineClient.getCupcakeBalanceFor(name);
    } else {
      alert("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
    }
  };

  return (
    <div class='vending-machine'>
      <h4>Free Cupcakes</h4>
      <span class='subheader'>(web3)</span>
      <input id="name-input" type="text" placeholder="Enter name" />
      <button id="cupcake-please" onClick={handleButtonClick}>Cupcake please!</button>
      <span id="cupcake" style={{ opacity: 0 }}> 🧁</span>
      <p id='balance-wrapper'>
        <span>Cupcake balance:</span>
        <span id="cupcake-balance">0</span>
      </p>
    </div>
  );
};
