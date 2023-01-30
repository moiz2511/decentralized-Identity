import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from "../styles/Home.module.css";
import Header from "../components/header";
// import Header from "../components/manualHeader";

import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react"
import { contractAddresses, abi } from "../constants"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import Link from 'next/link';
const supportedChains = ["31337", "5"];
export default function Home() {
  // const contractAddress = '0x10991E7c75BD50182F0B3D2dee6827aec662D5ff';
  const contractAddress = '0x96eF673786FAF2bc865bFE406a97Fb54Ecf96Ee8';

  const { isWeb3Enabled, chainId,user } = useMoralis();
  

  // const moralis=new Moralis();
  const [inputValue, setInputValue] = useState('');
  const { runContractFunction: addServiceProvider } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "addServiceProvider",
    params: [inputValue],
  });


  const {
    runContractFunction: admin,
    data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "admin",
    params: {},
  })
  const {
    runContractFunction: getServiceProviders,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "getServiceProviders",
    params: {},
  })
  async function getAdminAndProviderAddresses() {
    // Another way we could make a contract call:
    // const options = { abi, contractAddress: raffleAddress }
    // const fee = await Moralis.executeFunction({
    //     functionName: "getEntranceFee",
    //     ...options,
    // })
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    console.log(account)
    const adminAddress = (await admin()).toString()
    const serviceProvidersAddress=(await getServiceProviders())
    console.log(serviceProvidersAddress)
    // const numPlayersFromCall = (await getPlayersNumber()).toString()
    // const recentWinnerFromCall = await getRecentWinner()
    //cont setEntranceFee(entranceFeeFromCall)
    // setNumberOfPlayers(numPlayersFromCall)
    // setRecentWinner(recentWinnerFromCall)
    console.log(adminAddress)
    var servicePro=0
    if(account==adminAddress.toLowerCase()){
      console.log('inside')
      window.location.href='/admin'
      return;
    }
    else{
      serviceProvidersAddress.forEach(element => {
        console.log(element)
        console.log(account)
        if(element.toLowerCase()==account){
          console.log('matched')
          servicePro=1
          window.location.href='/provider'
          return;
        }

      });
      
    }
    if(servicePro==0){

      window.location.href='/user'
    }

    
   
  }
  async function addProvider() {
    if (!ethers.utils.isAddress(inputValue)) {
      console.log("Invalid address")
      return
    }
    else {
      console.log(ethers.utils.getAddress(inputValue))
    }
    console.log(inputValue);
    const response = await addServiceProvider();
    console.log(response);
  }
  useEffect(() => {
    if (isWeb3Enabled) {
      getAdminAndProviderAddresses()
    }
  }, [isWeb3Enabled])
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {isWeb3Enabled ? (
        <div>
          {supportedChains.includes(parseInt(chainId).toString()) ? (
            <div className="flex flex-row">
            </div>
          ) : (
            <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
          )}
        </div>
      ) : (
        <div className='text-2xl font-semibold text-center mt-[10%]'>Please connect to a Wallet</div>
      )}
    </div>
  )
}
