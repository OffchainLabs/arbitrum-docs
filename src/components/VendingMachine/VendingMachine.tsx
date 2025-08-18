'use client';

import React, { useState } from 'react';

export interface VendingMachineProps {
  className?: string;
}

export function VendingMachine({ className = "" }: VendingMachineProps) {
  const [cupcakes, setCupcakes] = useState(10);
  const [balance, setBalance] = useState(0);

  const buyCupcake = () => {
    if (cupcakes > 0 && balance >= 1) {
      setCupcakes(cupcakes - 1);
      setBalance(balance - 1);
      alert("🧁 Cupcake dispensed! Enjoy!");
    } else if (cupcakes === 0) {
      alert("Sorry, no cupcakes left!");
    } else {
      alert("Insufficient balance. Please add more ETH!");
    }
  };

  const addBalance = () => {
    setBalance(balance + 1);
  };

  return (
    <div className={`border-2 border-gray-300 rounded-lg p-6 bg-gradient-to-b from-blue-50 to-blue-100 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-blue-800">🧁 Vending Machine 🧁</h3>
        <div className="text-sm text-gray-600 mt-2">
          A simple smart contract demonstration
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Cupcakes Available:</span>
          <span className="text-lg font-bold text-green-600">{cupcakes}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-semibold">Your Balance:</span>
          <span className="text-lg font-bold text-blue-600">{balance} ETH</span>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={addBalance}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Add 1 ETH to Balance
          </button>
          
          <button 
            onClick={buyCupcake}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Buy Cupcake (1 ETH)
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-4 text-center">
        This is a demo component representing a smart contract vending machine
      </div>
    </div>
  );
}

export default VendingMachine;