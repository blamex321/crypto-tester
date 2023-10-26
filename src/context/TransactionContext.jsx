import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractsAbi, contractsAddress } from "../utils/constants";
import { parse } from "postcss";

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const TransactionContract = new ethers.Contract(
    contractsAddress,
    contractsAbi,
    signer
  );

  return TransactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions,setTransactions] = useState([]); 
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const handleChange = (e, name) => {
    setFormData({ ...formData, [name]: e.target.value });
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) alert("Get MetaMask!");
      const transactionContract = getEthereumContract();
      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );
      console.log(structuredTransactions);
      setTransactions(structuredTransactions); 
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) alert("Get MetaMask!");
      const account = await ethereum.request({ method: "eth_accounts" });
      console.log(account);
      if (account.length > 0) {
        const accountAddress = account[0];
        setCurrentAccount(accountAddress);
        getAllTransactions();
        //get all trasactions
      } else {
        console.log("No account found");
      }
    } catch (err) {
      console.log(err);
      throw new Error("Error connecting to wallet");
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const trasactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(trasactionCount.toNumber());
      localStorage.setItem("transactionCount", trasactionCount.toNumber());
    } catch (err) {
      console.log(err);
      throw new Error("Error connecting to wallet");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) alert("Get MetaMask!");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
      throw new Error("Error connecting to wallet");
    }
  };

  const sendTransaction = async (amount, receiver) => {
    try {
      if (!ethereum) alert("Get MetaMask!");
      //get the data from the form
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });
      const transactionHash = await transactionContract.addToBlockChain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setLoading(true);
      console.log(`loading ${transactionHash.hash}`);
      await transactionHash.wait();

      setLoading(false);
      console.log(`success ${transactionHash.hash}`);
      const trasactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(trasactionCount.toNumber());
      window.reload();
    } catch (error) {
      console.log(error);
      throw new Error("Error connecting to wallet");
    }
  };
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        loading,
      }}
    > 
      {children}
    </TransactionContext.Provider>
  );
};

export const TransactionContext = React.createContext();
