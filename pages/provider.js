import Head from 'next/head'
import Image from 'next/image'
import { ethers } from "ethers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { contractAddresses, abi } from "../constants"
import Header from "../components/header";
import { useState, useEffect } from 'react';



export default function Home() {
    const [web3, setWeb3] = useState(null);
    const [change,setChange]=useState(false)

    useEffect(() => {
        import('web3').then(web3 => {
            const newWeb3 = new web3.default();
            setWeb3(newWeb3);
        });
    }, []);
    useEffect(() => {
        if (!web3) {
            return;
        }
        // set the provider
        web3.setProvider(window.ethereum)
    }, [web3])
    const { isWeb3Enabled, chainId, user } = useMoralis();
    const { runContractFunction } = useWeb3Contract();
    const contractAddress = '0x97Ba68e03545Bc4460F43e2810DA352eB29fd501';
    const [mySerTokens, setMySerTokens] = useState([])
    const [myAccount, setMyAccount] = useState('')
    const [enSerAtt, setEnSerAtt] = useState([])
    const [deSerAtt, setDeSerAtt] = useState([])
    const [enIdenAtt, setEnIdenAtt] = useState([])
    const [deIdenAtt, setDeIdenAtt] = useState([])
    const [identityVerified,setIdentityVerified]=useState(null)
    const [signatureHash,setSignatureHash]=useState([])
    const [verifedArr,setVerifiedArr]=useState(['','','','',''])

    async function providePublicKey() {
        var account;
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed, use them
            console.log(accounts)
            account = accounts[0]

            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        // await window.ethereum.request({ method: 'eth_requestAccounts' });
        const keyB64 = await window.ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [account],
        });
        console.log(keyB64)
        const publicKey = Buffer.from(keyB64, 'base64');
        console.log(publicKey)
        console.log(publicKey)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "storePublicKey",
            params: {
                _publicKey: publicKey,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccess,
            onError: (error) => console.log(error),
        })
    }
    async function handleAddSuccess(tx) {
        await tx.wait(1)
        console.log("added")
    }
    async function handleAddSuccessNo(tx) {
        // await tx.wait(1)
        console.log("added")
    }
    async function getMyServiceTokens() {
        var account;
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed, use them
            console.log(accounts)
            account = accounts[0]
            setMyAccount(accounts[0])
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getServiceTokens",
            params: {
                serviceProvider: account,
            },
        }

        const myTokens = await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccessNo,
            onError: (error) => console.log(error),
        })
        setMySerTokens(myTokens)
        console.log(myTokens)
    }
    useEffect(() => {
        getMyServiceTokens()
    }, [isWeb3Enabled])
    async function decryptData(account, data) {
        // console.log(structuredData)
        // Reconstructing the original object outputed by encryption
        const structuredData = {
            version: 'x25519-xsalsa20-poly1305',
            ephemPublicKey: data.slice(0, 32).toString('base64'),
            nonce: data.slice(32, 56).toString('base64'),
            ciphertext: data.slice(56).toString('base64'),
        };
        // Convert data to hex string required by MetaMask
        const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`;
        // Send request to MetaMask to decrypt the ciphertext
        // Once again application must have acces to the account
        const decrypt = await window.ethereum.request({
            method: 'eth_decrypt',
            params: [ct, account],
        });
        console.log(decrypt)
        return decrypt
        // Decode the base85 to final bytes
        // return ascii85.decode(decrypt);
    }
    async function getIdentityVerification(token){
        console.log(token.user)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getIdentityToken",
            params: {
                _user: token.user,
            },
        }

        const idenToken = await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccessNo,
            onError: (error) => console.log(error),
        })
        console.log(idenToken)
        if(idenToken[1]==true){
            setIdentityVerified(true)
        }
        else{
            setIdentityVerified(false)
        }
        console.log(idenToken.signature)
        setSignatureHash(idenToken.signature)
    }
    async function tokenClicked(token, index) {
        await getIdentityVerification(token)
        const serviceAttribute1 = Buffer.from(mySerTokens[index].serviceAttribute1.slice(2), 'hex');
        const serviceAttribute2 = Buffer.from(mySerTokens[index].serviceAttribute2.slice(2), 'hex');
        const serviceAttribute3 = Buffer.from(mySerTokens[index].serviceAttribute3.slice(2), 'hex');
        const serviceAttribute4 = Buffer.from(mySerTokens[index].serviceAttribute4.slice(2), 'hex');
        const serviceAttribute5 = Buffer.from(mySerTokens[index].serviceAttribute5.slice(2), 'hex');
        const identityAttributeReference1 = Buffer.from(mySerTokens[index].identityAttributeReference1.slice(2), 'hex');
        const identityAttributeReference2 = Buffer.from(mySerTokens[index].identityAttributeReference2.slice(2), 'hex');
        const identityAttributeReference3 = Buffer.from(mySerTokens[index].identityAttributeReference3.slice(2), 'hex');
        const identityAttributeReference4 = Buffer.from(mySerTokens[index].identityAttributeReference4.slice(2), 'hex');
        const identityAttributeReference5 = Buffer.from(mySerTokens[index].identityAttributeReference5.slice(2), 'hex');

        const encryptedServiceAttArr = []
        const encryptedIdentityAttArr = []

        encryptedServiceAttArr.push(serviceAttribute1.slice(56).toString('base64'))
        encryptedServiceAttArr.push(serviceAttribute2.slice(56).toString('base64'))
        encryptedServiceAttArr.push(serviceAttribute3.slice(56).toString('base64'))
        encryptedServiceAttArr.push(serviceAttribute4.slice(56).toString('base64'))
        encryptedServiceAttArr.push(serviceAttribute5.slice(56).toString('base64'))
        setEnSerAtt(encryptedServiceAttArr)

        encryptedIdentityAttArr.push(identityAttributeReference1.slice(56).toString('base64'))
        encryptedIdentityAttArr.push(identityAttributeReference2.slice(56).toString('base64'))
        encryptedIdentityAttArr.push(identityAttributeReference3.slice(56).toString('base64'))
        encryptedIdentityAttArr.push(identityAttributeReference4.slice(56).toString('base64'))
        encryptedIdentityAttArr.push(identityAttributeReference5.slice(56).toString('base64'))
        setEnIdenAtt(encryptedIdentityAttArr)


        var serD1 = await decryptData(myAccount, serviceAttribute1)
        var serD2 = await decryptData(myAccount, serviceAttribute2)
        var serD3 = await decryptData(myAccount, serviceAttribute3)
        var serD4 = await decryptData(myAccount, serviceAttribute4)
        var serD5 = await decryptData(myAccount, serviceAttribute5)

        var ideD1 = await decryptData(myAccount, identityAttributeReference1)
        var ideD2 = await decryptData(myAccount, identityAttributeReference2)
        var ideD3 = await decryptData(myAccount, identityAttributeReference3)
        var ideD4 = await decryptData(myAccount, identityAttributeReference4)
        var ideD5 = await decryptData(myAccount, identityAttributeReference5)

        console.log(serD1, serD2, serD3, serD4, serD5)
        console.log(ideD1, ideD2, ideD3, ideD4, ideD5)


        const decryptedServiceAttArr = [serD1, serD2, serD3, serD4, serD5]
        setDeSerAtt(decryptedServiceAttArr)
        const decryptedIdentityAttArr = [ideD1, ideD2, ideD3, ideD4, ideD5]
        setDeIdenAtt(decryptedIdentityAttArr)

    }
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
    async function verifyHash(attribute,index){
        await window.ethereum.enable();
        var adminAddress;
        if (isWeb3Enabled) {
            adminAddress = (await admin())
        }
        // const web3 = new Web3(window.ethereum)
        // const recoveredAddress = await window.ethereum.request({
        //     method: 'eth_recover',
        //     params: [attribute, signatureHash[index]]
        // });
        // console.log(recoveredAddress)
        const recoverd = await web3.eth.personal.ecRecover(attribute, signatureHash[index])
        console.log(recoverd)
        console.log(adminAddress)
        if (recoverd==adminAddress.toString().toLowerCase()){
            console.log('verified')
            verifedArr[index]='Signature has been verified! It is indeed Sign by the admin'
            setChange(change==false?true:false)
        }
        else{
            console.log('Not Verified')
            verifedArr[index] = 'Signature has not been verified! Data has been manipulated.'
            setChange(change == false ? true : false)
        }

    }
    return (

        <div>
            <Header />
            <h1 className='text-3xl font-semibold text-center my-10'>
                Provider
            </h1>
            {mySerTokens && mySerTokens.map((token, index) => (
                <div className='flex justify-center items-center' onClick={() => tokenClicked(token, index)}>
                    <h6 className='text-xl font-semibold text-center'>{token.user}</h6>
                </div>
            ))}
            <h3 className='text-lg font-medium text-center'>Encrypted Service Attributes</h3>
            {enSerAtt.length > 0 && enSerAtt.map((attribute) => (
                <h5 className='text-base  font-semibold text-center'>
                    {attribute}
                </h5>
            ))}
            <h3 className='text-lg font-medium text-center'>Decrypted Service Attributes</h3>
            {deSerAtt.length > 0 && deSerAtt.map((attribute) => (
                <h5 className='text-base  font-semibold text-center'>
                    {attribute}
                </h5>
            ))}
            {identityVerified==true?<h4 className='text-green-700'>Identity token is overall verified by the identity Provider you should verify the admin signature manually to the identity attributes provided to you</h4>:identityVerified==false?
                <h4 className='text-red-700'>Identity token is not yet verified by the identity Provider</h4> :null   
            }
            <h3 className='text-xl font-semibold text-center'>Decrypted Identity Attributes</h3>
            {deIdenAtt.length > 0 && deIdenAtt.map((attribute,index) => (
                <>
                    {attribute != 'No Value' &&
                        <>
                            <h5 className='text-base font-semibold text-center'>
                                {attribute}
                            </h5>
                            <p className='text-sm font-medium text-center'>{verifedArr[index]}</p>
                            <button className='mx-5 bg-black text-white border-[2px] rounded-lg border-black px-3 py-2 hover:bg-white hover:text-black hover:font-semibold' onClick={()=>verifyHash(attribute,index)}>
                                Verify Hash
                            </button>
                        </>}
                </>
            ))}
            <div className='flex justify-center mt-3'>

                <button className='mx-5 bg-black text-white border-[2px] rounded-lg border-black px-3 py-2 hover:bg-white hover:text-black hover:font-semibold' onClick={() => providePublicKey()}>Provide Public Key</button>
            </div>
        </div>

    )
}
