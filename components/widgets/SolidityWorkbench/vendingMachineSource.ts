/**
 * The contract the quickstart workbench opens with. The `lines` ranges of the lesson steps in
 * `SolidityQuickstartWorkbench.tsx` point into this text, so keep them in step.
 */
export const vendingMachineSoliditySource = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract VendingMachine {
   mapping(address => uint) private _cupcakeBalances;
   mapping(address => uint) private _cupcakeDistributionTimes;

   function giveCupcakeTo(address userAddress) public returns (bool) {
       if (_cupcakeDistributionTimes[userAddress] == 0) {
           _cupcakeBalances[userAddress] = 0;
           _cupcakeDistributionTimes[userAddress] = 0;
       }

       uint fiveSecondsFromLastDistribution = _cupcakeDistributionTimes[userAddress] + 5 seconds;
       bool userCanReceiveCupcake = fiveSecondsFromLastDistribution <= block.timestamp;

       if (userCanReceiveCupcake) {
           _cupcakeBalances[userAddress]++;
           _cupcakeDistributionTimes[userAddress] = block.timestamp;
           return true;
       } else {
           revert("HTTP 429: Too Many Cupcakes (you must wait at least 5 seconds between cupcakes)");
       }
   }

   function getCupcakeBalanceFor(address userAddress) public view returns (uint) {
       return _cupcakeBalances[userAddress];
   }
}
`;
