

import React from "react";
import { ethers } from 'ethers'
import VendingMachineContract from './VendingMachine.sol/VendingMachine.json'

export const Web3VendingMachine = () => {

  class VendingMachineClient {

    async requestAccount() {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    async giveCupcakeTo(userId) {
      // todo: fix naming, params, etc
      if (typeof window.ethereum !== 'undefined') {
        await this.requestAccount()

        // todo: this needs to come from the client
        const vendingMachineAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('provider')
        const signer = provider.getSigner()
        console.log('signer')
        const userAddress = await signer.getAddress() // get user's public wallet address
        console.log('userAddress: ' + userAddress);
        const contract = new ethers.Contract(vendingMachineAddress, VendingMachineContract.abi, signer)
        console.log('contract')
        const cupcakeCountBefore = await contract.getCupcakeBalanceFor(userAddress);
        console.log('before: ' + cupcakeCountBefore);
        const transaction = await contract.giveCupcakeTo(userAddress);
        const cupcakeCountAfter = await contract.getCupcakeBalanceFor(userAddress);
        console.log('after: ' + cupcakeCountAfter);
        const succeeded = cupcakeCountAfter == cupcakeCountBefore + 1;
        console.log('succeeded? ' + succeeded);
        return succeeded;
      }
    }

    async getCupcakeBalanceFor(userId) {
      // todo
    }
  }

  const vendingMachineClient = new VendingMachineClient();

  const handleButtonClick = async () => {
    const name = document.getElementById("name-input").value;
    let gotCupcake = false;
    try {
      gotCupcake = await vendingMachineClient.giveCupcakeTo(name);
    } catch (error) {
      console.error("ERROR: " + JSON.stringify(error));
    }

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
      <input id="name-input" type="text" placeholder="Enter contract address" />
      <button id="cupcake-please" onClick={handleButtonClick}>Cupcake please!</button>
      <span id="cupcake" style={{ opacity: 0 }}> 🧁</span>
      <p id='balance-wrapper'>
        <span>Cupcake balance:</span>
        <span id="cupcake-balance">0</span>
      </p>
    </div>
  );
};
