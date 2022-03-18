import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Game, OnlineGame } from './Game.js';
import { ethers } from 'ethers';

// Web pages
const RPCURL = "https://rpc.testnet.fantom.network/";
const NETWORK = 4002;

function App() {
    // const [currentAccount, setCurrentAccount] = useState();
	// const [wallet, setWallet] = useState(window.ethereum);
	// const [provider, newProvider] = useState(new ethers.providers.Web3Provider(wallet, "any"));
	// const ftmProvider = new ethers.providers.JsonRpcProvider("https://rpc.ftm.tools");
	// const readSigner = new ethers.Wallet('0xefa25f6af0f03a651494731e7a3bcfaae02607b50cf9efe0477a9dc77da9aafd', ftmProvider);
	// const [nftContract, newNftContract] = useState(new ethers.Contract(NFTAddress, NFTABI, readSigner));
	// const [gameContract, newGameContract] = useState(new ethers.Contract(NFTAddress, NFTABI, provider.getSigner(0)));
    //
    // const correctChain = async () => {
	// 	try {
	// 		await wallet.request({
	// 			method: 'wallet_switchEthereumChain',
	// 			params: [{ chainId: ('0x' + NETWORK.toString(16)) }], // chainId must be in hexadecimal numbers
	// 		});
	// 	} catch (error) {
	// 		// This error code indicates that the chain has not been added to MetaMask
	// 		// if it is not, then install it into the user MetaMask
	// 		if (error.code === 4902) {
	// 			try {
	// 				await wallet.request({
	// 					method: 'wallet_addEthereumChain',
	// 					params: [
	// 						{
	// 							chainId: ('0x' + NETWORK.toString(16)),
	// 							rpcUrl: RPCURL,
	// 						},
	// 					],
	// 				});
	// 			} catch (addError) {
	// 				console.error(addError);
	// 			}
	// 		}
	// 		console.error(error);
	// 	}
	// }
    //
	// const connectWalletHandler = async () => {
	// 	const _newAccount = await wallet.request({ method: 'eth_requestAccounts' });
	// 	newProvider(new ethers.providers.Web3Provider(wallet, "any"));
	// 	newNFTContract(new ethers.Contract(NFTAddress, NFTABI, provider.getSigner(0)));
	// 	newLockSendContract(new ethers.Contract(lockerAddress, lockerABI, provider.getSigner(0)));
	// 	setCurrentAccount(_newAccount[0]);
	// 	getTokens(_newAccount[0]);
	// }
    //
    //
    //
	// const addListeners = async () => {
	// 	provider.on('network', async (newNetwork, oldNetwork) => {
	// 		correctChain();
	// 	});
    //
	// 	wallet.on('accountsChanged', async (_newAccount, _oldAccount) => {
	// 		setCurrentAccount(_newAccount[0]);
	// 		getTokens(_newAccount[0]);
	// 	});
	// }
    //
	// const approve = async () => {
	// 	const tx = await MetaContract.setApprovalForAll(lockerAddress, true);
	// 	tx.wait().then(() => {
	// 		getTokens();
	// 	});
	// }
    //
	// const getTokens = async (account) => {
	// 	const owned = await NFTContract.isApprovedForAll(account, lockerAddress);
	// 	setApproval(owned);
	// }
    //
	// useEffect(() => {
	// 	newProvider(new ethers.providers.Web3Provider(wallet, "any"));
	// 	addListeners();
	// 	setWallet(window.ethereum);
	// 	getTokens();
	// }, [])
    //
	// const connectWalletButton = () => {
	// 	if (currentAccount) {
	// 		return (
	// 			<button className='cta-button connect'> {currentAccount.substring(0, 6) + "..." + currentAccount.slice(-4)}</button>
	// 		)
	// 	} else {
	// 		return (
	// 			<button className='cta-button responsive connect' onClick={() => { correctChain(); connectWalletHandler() }}>Connect Wallet</button>
	// 		)
	// 	}
	// }
    //
	// const approveButton = () => {
	// 	if (currentAccount) {
	// 		if (approval) {
	// 			return (
	// 				<button className='cta-button connect'>GO MUTATE!</button>
	// 			)
	// 		} else {
	// 			return (
	// 				<button className='cta-button responsive connect' onClick={() => { approve(); }}>Approve Contract</button>
	// 			)
	// 		}
	// 	} else {
	// 		return (
	// 			<button className='cta-button-disabled'>Connect to Approve</button>
	// 		)
	// 	}
	// }

  return (
    <div className="App">
        <OnlineGame />
    </div>
  );
}

export default App;
