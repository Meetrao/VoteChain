import React, { useState } from "react";
import { ethers } from "ethers";
import { CounterABI } from "./contracts/CouterABI.js";
import { COUNTER_ADDRESS } from "./constants.js";

const CounterComponent = () => {
  const [count, setCount] = useState(null);
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const counterContract = new ethers.Contract(COUNTER_ADDRESS, CounterABI, signer);

      setContract(counterContract);
      console.log("Wallet connected");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const increment = async () => {
    if (!contract) return alert("Connect wallet first!");
    const tx = await contract.increment();
    await tx.wait();
    alert("Incremented!");
  };

  const decrement = async () => {
    if (!contract) return alert("Connect wallet first!");
    const tx = await contract.decrement();
    await tx.wait();
    alert("Decremented!");
  };

  const getNumber = async () => {
    if (!contract) return alert("Connect wallet first!");
    const currentCount = await contract.getCount();
    setCount(Number(currentCount));
  };

  return (
    <div>
      <h1>Counter: {count !== null ? count : "Not fetched"}</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={getNumber}>Get Count</button>
    </div>
  );
};

export default CounterComponent;
