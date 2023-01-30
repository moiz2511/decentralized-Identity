import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import { useState, useEffect } from 'react';
import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis";
import Header from "../components/header";
import { ethers } from "ethers";


export default function Admin() {
    const { isWeb3Enabled, chainId, user } = useMoralis();

    // const contractAddress = '0xb9AcA62ceAa596855a2185ce1b5bDdC03Db211fb';
    const contractAddress = '0x96eF673786FAF2bc865bFE406a97Fb54Ecf96Ee8';

    
    const [allTokens, setAllTokens] = useState([])
    const [encrptedTokenData, setEncryptedTokenData] = useState([])
    const [decrptedTokenData, setDecryptedTokenData] = useState([])
    const [selectedToken, setSelectedToken] = useState('')
    const [signatureHash, setSignatureHash] = useState([])



    const [inputValue, setInputValue] = useState('');
    const { runContractFunction } = useWeb3Contract();
    async function askToGiveAccess() {
        console.log("asking....")
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts', params: ['0x75881b77B600b71C35f7C6E3943F63C56DeE321c'] });
            // Accounts now exposed, use them
            console.log(accounts)
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        //    await window.ethereum.request({ method: 'eth_requestAccounts' })
    }
    async function addProvider() {
        if (!ethers.utils.isAddress(inputValue)) {
            console.log("Invalid address")
            return
        }

        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "addServiceProvider",
            params: {
                serviceProvider: inputValue,
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
    useEffect(() => {
        if (isWeb3Enabled) {
            askToGiveAccess()
        }
    }, [isWeb3Enabled])
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
    async function decrypt() {
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
        var enc = {
            ciphertext
                :
                "7nhapOmWTV/FSoZ0j/2BSHTQm9fo3Xjn+3o=",
            ephemPublicKey
                :
                "2A7v7ohg2azu0YOVIVVoU97MXi8O2auI8D+8Pc721gw=",
            nonce
                :
                "bpSfXCgsfqnoar5dxdnTlak2kWtfkk2h",
            version
                :
                "x25519-xsalsa20-poly1305"
        }
        const buf = Buffer.concat([
            Buffer.from(enc.ephemPublicKey, 'base64'),
            Buffer.from(enc.nonce, 'base64'),
            Buffer.from(enc.ciphertext, 'base64'),
        ]);
        decryptData(account, buf)
    }
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
    async function getTokens() {

        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getUnsignedRejectedIdentityTokens",
            params: {},
        }

        var tokens = await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccessNo,
            onError: (error) => console.log(error),
        })
        // const SecondListOptions = {
        //     abi: abi,
        //     contractAddress: contractAddress,
        //     functionName: "getIdentityToken",
        //     params: {
        //         _user:tokens[0]
        //     },
        // }

        // const tokenData = await runContractFunction({
        //     params: SecondListOptions,
        //     onSuccess: handleAddSuccessNo,
        //     onError: (error) => console.log(error),
        // })
        console.log(tokens)
        var index = tokens.indexOf('0x0000000000000000000000000000000000000000')
        console.log(index)
        // tokens.splice(index)
        var setToToken = []
        for (var i = 0; i < index; i++) {
            setToToken.push(tokens[i])
        }
        setAllTokens(setToToken)
        console.log(tokens)
        // console.log(tokenData.attribute4)
        // // var data5 = Buffer.from(tokenData.attribute5.toString(), 'base64');
        // const data5 = Buffer.from(tokenData.attribute5.slice(2), 'hex');
        // console.log(data5)
        // const structuredData = {
        //     version: 'x25519-xsalsa20-poly1305',
        //     ephemPublicKey: data5.slice(0, 32).toString('base64'),
        //     nonce: data5.slice(32, 56).toString('base64'),
        //     ciphertext: data5.slice(56).toString('base64'),
        // };
        // console.log(structuredData)
        // decryptData(account, structuredData)
    }
    async function getTokenData(token) {
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
        const SecondListOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getIdentityToken",
            params: {
                _user: token
            },
        }
        setSelectedToken(token)
        const tokenData = await runContractFunction({
            params: SecondListOptions,
            onSuccess: handleAddSuccessNo,
            onError: (error) => console.log(error),
        })
        console.log(tokenData)
        var encryptedDataToBe = []

        const att1 = Buffer.from(tokenData.attribute1.slice(2), 'hex');
        const att2 = Buffer.from(tokenData.attribute2.slice(2), 'hex');
        const att3 = Buffer.from(tokenData.attribute3.slice(2), 'hex');
        const att4 = Buffer.from(tokenData.attribute4.slice(2), 'hex');
        const att5 = Buffer.from(tokenData.attribute5.slice(2), 'hex');
        encryptedDataToBe.push(att1.slice(56).toString('base64'))
        encryptedDataToBe.push(att2.slice(56).toString('base64'))
        encryptedDataToBe.push(att3.slice(56).toString('base64'))
        encryptedDataToBe.push(att4.slice(56).toString('base64'))
        encryptedDataToBe.push(att5.slice(56).toString('base64'))
        setEncryptedTokenData(encryptedDataToBe)
        var att1Val = await decryptData(account, att1)
        var att2Val = await decryptData(account, att2)
        var att3Val = await decryptData(account, att3)
        var att4Val = await decryptData(account, att4)
        var att5Val = await decryptData(account, att5)
        console.log(att1Val, att2Val, att3Val, att4Val, att5Val)
        var decryptedDataToBe = []
        decryptedDataToBe.push(att1Val)
        decryptedDataToBe.push(att2Val)
        decryptedDataToBe.push(att3Val)
        decryptedDataToBe.push(att4Val)
        decryptedDataToBe.push(att5Val)
        setDecryptedTokenData(decryptedDataToBe)


        // const structuredData = {
        //     version: 'x25519-xsalsa20-poly1305',
        //     ephemPublicKey: data5.slice(0, 32).toString('base64'),
        //     nonce: data5.slice(32, 56).toString('base64'),
        //     ciphertext: data5.slice(56).toString('base64'),
        // };
        // console.log(structuredData)
        // decryptData(account, structuredData)
    }
    async function sign() {
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
        var signingHash1;
        var signedHahArr = []
        if (isWeb3Enabled) {
            try {
                const attr1SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[0], account] })
                const attr2SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[1], account] })
                const attr3SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[2], account] })
                const attr4SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[3], account] })
                const attr5SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[4], account] })
                signedHahArr.push(attr1SigninatureHash)
                signedHahArr.push(attr2SigninatureHash)
                signedHahArr.push(attr3SigninatureHash)
                signedHahArr.push(attr4SigninatureHash)
                signedHahArr.push(attr5SigninatureHash)
                setSignatureHash(signedHahArr)
            } catch (error) {
                console.log('error')
            }

        }

        else {
            console.log('not enabled')
        }
    }
    async function saveSignature() {
        console.log(signatureHash)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "signIdentityToken",
            params: {
                user: selectedToken,
                attribute1Hash: signatureHash[0],
                attribute2Hash: signatureHash[1],
                attribute3Hash: signatureHash[2],
                attribute4Hash: signatureHash[3],
                attribute5Hash: signatureHash[4],
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccess,
            onError: (error) => console.log(error),
        })
    }


    const [tab, settab] = useState('encryption');

    return (

        <div>
            <Header />

            <h1 className='text-3xl font-semibold text-center mt-2'>
                Admin
            </h1>

            <div className='bg-zinc-200 flex  px-4 items-center rounded-lg '>
                <button className={tab === 'encryption' ? ' text-black px-2 ml-10 font-semibold text-xl' : 'border-b-2 hover:border-black ml-10   py-2 px-3 '} onClick={() => settab('encryption')}>Token</button>
                <button className={tab === 'provider' ? ' text-black px-2  font-semibold text-xl' : ' border-b-2 hover:border-black py-2 px-3   '} onClick={() => settab('provider')}  >Add Provider</button>


            </div>




            {tab === "encryption" ?
                <div>

                    <div className='flex justify-center mt-5'>
                        <button className='mx-5 bg-black text-white border-[2px] rounded-lg border-black px-3 py-2 hover:bg-white hover:text-black hover:font-semibold' onClick={() => providePublicKey()}>Provide Public Key</button>

                        <button className='mx-5 bg-black text-white border-[2px] rounded-lg border-black px-3 py-2 hover:bg-white hover:text-black hover:font-semibold' onClick={() => getTokens()}>Get Tokens</button>
                    </div>
                    {allTokens.map((token) => (



<div className='flex justify-center '>

                            <div className='flex justify-start mt-5 w-fit h-40 overflow-y-scroll  flex-col'>

                            <div onClick={() => getTokenData(token)}  >
                                <h4 className='cursor-pointer text-base font-semibold mb-2 text-white bg-black px-6 py-2 border-[1px] border-black rounded-lg hover:text-black hover:bg-white'>
                                    {token}
                                </h4>
                            </div>
                        </div>
</div>


                    ))}
                    <div className='flex flex-col items-center  mt-5 text-lg'>
                        <h2 className='text-lg font-semibold'>
                            Encrypted Token Data
                        </h2>
                        <div className=' mt-4'>

                            <h6 className='text-sm font-semibold mt-2'>
                                {encrptedTokenData[0] && encrptedTokenData[0]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {encrptedTokenData[1] && encrptedTokenData[1]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {encrptedTokenData[2] && encrptedTokenData[2]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {encrptedTokenData[3] && encrptedTokenData[3]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {encrptedTokenData[4] && encrptedTokenData[4]}
                            </h6>
                        </div>
                    </div>
                    <div className='flex flex-col items-center  mt-5 text-lg'>
                        <h2 className='text-lg font-semibold'>
                            Decrypted Token Data
                        </h2>
                        <div className=' mt-4'>

                            <h6 className='text-sm font-semibold mt-2'>
                                {decrptedTokenData[0] && decrptedTokenData[0]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {decrptedTokenData[1] && decrptedTokenData[1]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {decrptedTokenData[2] && decrptedTokenData[2]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {decrptedTokenData[3] && decrptedTokenData[3]}
                            </h6>
                            <h6 className='text-sm font-semibold mt-2'>
                                {decrptedTokenData[4] && decrptedTokenData[4]}
                            </h6>
                        </div>
                    </div>


                    <div className='flex justify-center my-5'>
                        <button className='mx-5  bg-black text-white border-[2px] rounded-lg border-black px-3 py-2 hover:bg-white hover:text-black hover:font-semibold' onClick={() => sign()}>Verify & Sign</button>
                    </div>

                    <div className='flex justify-center flex-col my-5' >
                        <h2 className='text-lg font-semibold text-center my-5'>Signature hash</h2>
                        {signatureHash.map((hash) => {

                            return (

                                <>
                                    <div>

                                        <h6 className='text-center ' >
                                            {hash}
                                        </h6>
                                        <br />
                                    </div>
                                </>
                            )
                        }
                        )}
                    </div>

                    <div className='flex justify-center mt-5'>
                        <button className='mx-5 bg-black text-white border-[2px] rounded-lg border-black px-3 py-2 hover:bg-white hover:text-black hover:font-semibold' onClick={() => saveSignature()}>Save Signatures</button>
                        {/* <button className='mx-5' onClick={() => getTokens()}>Reject</button> */}
                    </div>

                </div>
                :
                ""
            }


            {tab === "provider" ?
                <div>
                    <div className=' flex items-center justify-center   my-5 gap-x-4'>
                        <label for="id" className=' label-text text-lg font-semibold'>Address:</label>

                        <input className='border-black border-2 rounded-lg w-[60vh]   h-10 px-2' type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Provider Address' />


                    </div>
                    <div className='flex justify-center mt-5'>
                        <button className='mx-5 bg-black text-white border-[2px] rounded-lg border-black px-3 py-2 hover:bg-white hover:text-black hover:font-semibold' onClick={() => addProvider()}>Add Provider</button>
                    </div>

                </div>
                :
                ""
            }








        </div>

    )
}
