import React from "react";
//todo: pull into one component and parameterize the differences
export const Web2VendingMachine = () => {

  class VendingMachine {
    // Internal memory of the vending machine
    cupcakeBalances = {};
    cupcakeDistributionTimes = {};

    // Vend a cupcake to the caller
    giveCupcakeTo(userId) {
      if (this.cupcakeDistributionTimes[userId] === undefined) {
        this.cupcakeBalances[userId] = 0;
        this.cupcakeDistributionTimes[userId] = 0;
      }

      // Rule 1: The vending machine will distribute a cupcake to anyone who hasn't recently received one.
      const fiveSeconds = 5000;
      const userCanReceiveCupcake = this.cupcakeDistributionTimes[userId] + fiveSeconds <= Date.now();
      if (userCanReceiveCupcake) {
        this.cupcakeBalances[userId]++;
        this.cupcakeDistributionTimes[userId] = Date.now();
        console.log(`Enjoy your cupcake, ${userId}!`);
        return true;
      } else {
        console.error("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
        return false;
      }
    }

    getCupcakeBalanceFor(userId) {
      let balance = this.cupcakeBalances[userId];
      if (balance === undefined)
        balance = 0;
      return balance;
    }
  }

  const vendingMachine = new VendingMachine();

  const handleCupcakePlease = () => {
    const name = document.getElementById("name-input").value;
    let gotCupcake = vendingMachine.giveCupcakeTo(name);
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

      handleRefreshBalance();
    } else {
      alert("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
    }
  };

  const handleRefreshBalance = () => {
    const name = document.getElementById("name-input").value;
    let nameToDisplay = name;
    if (name == null || name == "")
      nameToDisplay = "no name";

    const cupcakeCountEl = document.getElementById("cupcake-balance");
    const balanceToDisplay = vendingMachine.getCupcakeBalanceFor(name);

    cupcakeCountEl.textContent = `${balanceToDisplay} (${nameToDisplay})`
  };

  return (
    <div class='vending-machine'>
      <h4>Free Cupcakes</h4>
      <span class='subheader'>(web2)</span>
      <input id="name-input" type="text" placeholder="Enter name" />
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
