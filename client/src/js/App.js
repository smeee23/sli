import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import React, { Component } from "react"
import { connect } from "react-redux"
import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory} from 'history'

import routes from './routes'
import { detectMobile } from "./actions/mobile"
import { updateActiveAccount } from "./actions/activeAccount"
import { updateTokenMap } from "./actions/tokenMap"
import { updateVerifiedPoolAddrs } from "./actions/verifiedPoolAddrs"
import { updateDepositorValIds } from "./actions/depositorValIds"
import { updateOwnerPoolAddrs } from "./actions/ownerPoolAddrs"
import { updateOwnerPoolInfo } from "./actions/ownerPoolInfo"
import { updateUserDepositPoolAddrs } from "./actions/userDepositPoolAddrs"
import { updateUserDepositPoolInfo } from "./actions/userDepositPoolInfo"
import { updateReserveAddress } from "./actions/reserveAddress"
import {updateSliETHInfo } from "./actions/sliETHInfo"
import { updateAavePoolAddress } from "./actions/aavePoolAddress"
import { updateNetworkId } from "./actions/networkId"
import { updateConnect } from "./actions/connect"
import { updateBurnPitBalances } from "./actions/burnPitBalances";
import { updatePendingTxList } from "./actions/pendingTxList";
import { updateActiveBalances } from "./actions/activeBalances";
import { updateTxResult } from  "./actions/txResult";

//import PoolTracker from "../contracts/PoolTracker.json";
import Reserve from "../contracts/Reserve.json";
import ERC20Instance from "../contracts/IERC20.json";
import PremiumGeneratorAaveV2 from "../contracts/PremiumGeneratorAaveV2.json"

import { getTokenMap, getAaveAddressProvider, deployedNetworks } from "./func/tokenMaps.js";
import {getPoolInfo, checkTransactions, getDepositorAddress, getAllowance, getLiquidityIndexFromAave, getNewDepositorValidatorIds, getAavePoolAddress, getBalances, getSliStats, getDepositorValidatorIds} from './func/contractInteractions.js';
import {getPriceFromCoinGecko} from './func/priceFeeds.js'
import {precise, delay, checkLocationForAppDeploy, filterOutVerifieds} from './func/ancillaryFunctions';

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            80001: "https://polygon-mumbai.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
			137: "https://polygon-mainnet.infura.io/v3/c6e0956c0fb4432aac74aaa7dfb7687e",
          },
        }
    },
	coinbasewallet: {
		package: CoinbaseWalletSDK,
		options: {
		  appName: "SLI",
		  infuraId: "c6e0956c0fb4432aac74aaa7dfb7687e",
		}
	},
};

export const web3Modal = new Web3Modal({
	cacheProvider: true, // optional
    disableInjectedProvider: false,
	providerOptions, // required
	theme: "dark",
});

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			interval: "",
		}
	}
	componentDidMount = async() => {
		try {
			window.addEventListener('resize', this.props.detectMobile);

				if("inApp" === checkLocationForAppDeploy() || "inSearch" === checkLocationForAppDeploy() ){
					if(web3Modal.cachedProvider || "inSearch" === checkLocationForAppDeploy() ){
						const pendingTxList = localStorage.getItem("pendingTxList");
						if(pendingTxList){
							const truePending = await checkTransactions(JSON.parse(pendingTxList));
							this.props.updatePendingTxList(truePending);
							localStorage.setItem("pendingTxList", JSON.stringify(truePending));
							console.log("pendingTx from storage", truePending);
						}
						const depositorValIds = localStorage.getItem("depositorValIds");
						if(depositorValIds){
							await this.props.updateDepositorValIds(JSON.parse(depositorValIds));
							console.log("depositorValIds from storage", JSON.parse(depositorValIds));
						}

						const tokenMap = localStorage.getItem("tokenMap");
						if(tokenMap){
							await this.props.updateTokenMap(JSON.parse(tokenMap));
							console.log("tokenMap from storage", JSON.parse(tokenMap));
						}

						await this.getAccounts();

						if (this.props.activeAccount){
							await this.setUpConnection();
							await this.setStates();
						}
						this.subscribeToInfura();
					}
				}
		}

		catch (error) {
			// Catch any errors for any of the above operations.
			if(!this.props.networkId){
				alert(
					`Failed to load metamask wallet, no network detected`,
				);
			}
			else{
				alert(
					`Failed to load web3, accounts, or contract. Check console for details. If not connected to site please select the Connect Button`,
			);
			}
			console.error(error);
		}
	}

	setUpConnection = async() => {
		this.setActiveAccountState(this.props.activeAccount);
		this.networkId = await this.web3.eth.net.getId();

		if(!deployedNetworks.includes(this.networkId)){
			alert(
				'Unsupported network detected (chain id: '+this.networkId+'). Please switch to Polygon (chain id: 137) or polygon mumbai testnet (chain id: 80001)'
			);
		}
		this.setNetworkId(this.networkId);
	}

	setStates = async() => {
		this.ReserveAddress = Reserve.networks[this.networkId] && Reserve.networks[this.networkId].address;
		this.ReserveInstance = new this.web3.eth.Contract(
			Reserve.abi,
			this.ReserveAddress,
		);

		this.PremiumGeneratorAddress = PremiumGeneratorAaveV2.networks[this.networkId] && PremiumGeneratorAaveV2.networks[this.networkId].address;
		//const premiumGeneratorAddr = await this.ReserveInstance.methods.premiumGenerator().call();

		this.setReserveAddress({reserve: this.ReserveAddress, premiumGenerator: this.PremiumGeneratorAddress});
		console.log("reserve test", this.props.reserveAddress)
		this.setSliETHInfo(await getSliStats(this.ReserveAddress));
		console.log("sli test", this.props.sliETHInfo, this.props.activeAccount);

		this.setDepositorValIds(await getDepositorValidatorIds(this.ReserveAddress, this.props.activeAccount))
		console.log("depositor valids test", (this.props.depositorValIds));

		this.setActiveBalances(await getBalances(this.ReserveAddress, this.props.activeAccount));
		console.log("balances test", (this.props.activeBalances));
		//await this.setTokenMapState(tokenMap);
		//await this.setBurnPitBalances(tokenMap);
		//await this.setPoolStateAll(this.props.activeAccount);
		const aaveAddressesProvider = getAaveAddressProvider(this.networkId);
		this.setAavePoolAddress(aaveAddressesProvider);

	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.props.detectMobile);
	}

	displayTxInfo = async(txInfo) => {
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

	connectToWeb3 = async() => {
		let provider;
		try {
			provider = await web3Modal.connect();
		}
		catch (error) {
			console.error(error);
		}
		return provider;
	}

	subscribeToInfura = async() => {
		//this.ReserveAddress = Reserve.networks[this.networkId] && Reserve.networks[this.networkId].address;
		/*this.ReserveInstance = new this.web3.eth.Contract(
			Reserve.abi,
			this.ReserveAddress,
		);*/


		let options = {
			filter: {
				value: [],
			},
			fromBlock: 0
		};

		console.log("events", this.ReserveInstance.events);

		/*
		event DenyApplication(uint validatorIndex,address withdrawAddress,uint8 reason);
		event ApproveApplication( uint validatorIndex, address withdrawAddress);
		event WithdrawInsurance(address depositor, uint ethAmount, uint sliETHAmount);
		event DenyClaim(uint validatorIndex,address withdrawAddress,uint8 reason);
		event AcceptClaim(uint validatorIndex,address withdrawAddress);
		event AddBeneficiary(uint validatorIndex, address withdrawAddress);
		event WithdrawBeneficiary(uint validatorIndex, address withdrawAddress);
		event MakeClaim(uint validatorIndex);
		event ProcessClaim(address beneficiary, uint amount, uint8 result);
		*/
		this.ReserveInstance.events.ProvideInsurance(options)
			.on('data', async(event) => {
				console.log("EVENT data", event)
				let pending = [...this.props.pendingTxList];
				pending.forEach((e, i) =>{
					if(e.txHash === event.transactionHash){
						e.status = "complete"
					}
				});
				await this.props.updatePendingTxList(pending);
				localStorage.setItem("pendingTxList", JSON.stringify(pending));

				await delay(2000);
				pending = (pending).filter(e => !(e.txHash === event.transactionHash));
				await this.props.updatePendingTxList(pending);
				localStorage.setItem("pendingTxList", JSON.stringify(pending));
				console.log("event", event.returnValues);
			})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))

		this.ReserveInstance.events.WithdrawInsurance(options)
		.on('data', async(event) => {
			console.log("EVENT data", event)
			let pending = [...this.props.pendingTxList];
			pending.forEach((e, i) =>{
				if(e.txHash === event.transactionHash){
					e.status = "complete"
				}
			});
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));

			await delay(2000);
			pending = (pending).filter(e => !(e.txHash === event.transactionHash));
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));
			console.log("event", event);
		})
		.on('changed', changed => console.log("EVENT changed", changed))
		.on('error', err => console.log("EVENT err", err))
		.on('connected', str => console.log("EVENT str", str))

		this.ReserveInstance.events.AddBeneficiary(options)
		.on('data', async(event) => {
			console.log("EVENT data", event)
			let pending = [...this.props.pendingTxList];
			pending.forEach((e, i) =>{
				if(e.txHash === event.transactionHash){
					e.status = "complete"
				}
			});
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));

			await delay(2000);
			pending = (pending).filter(e => !(e.txHash === event.transactionHash));
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));
			console.log("event", event);
		})
		.on('changed', changed => console.log("EVENT changed", changed))
		.on('error', err => console.log("EVENT err", err))
		.on('connected', str => console.log("EVENT str", str))


		this.ReserveInstance.events.DenyApplication(options)
		.on('data', async(event) => {
			console.log("EVENT data", event)
			if(this.props.activeAccount === event.returnValues.withdrawAddress){
				console.log(this.props.activeAccount, event, "MATCH");
				let txInfo = {txHash: '', success: false, type:"ORACLE APPLICATION ", poolName: "application approved", networkId: this.props.networkId};
				await this.displayTxInfo(txInfo);
			}
			console.log("ApproveApplication event", event);
		})
		.on('changed', changed => console.log("EVENT changed", changed))
		.on('error', err => console.log("EVENT err", err))
		.on('connected', str => console.log("EVENT str", str))


		this.ReserveInstance.events.ApproveApplication(options)
		.on('data', async(event) => {
			console.log("EVENT data", event)
			if(this.props.activeAccount === event.returnValues.withdrawAddress){
				console.log(this.props.activeAccount, event, "MATCH");
				let txInfo = {txHash: '', success: true, type:"ORACLE APPLICATION APPROVAL", poolName: "application approved", networkId: this.props.networkId};
				await this.displayTxInfo(txInfo);
				this.setDepositorValIds(await getDepositorValidatorIds(this.ReserveAddress, this.props.activeAccount));
			}
			console.log("ApproveApplication event", event);
		})
		.on('changed', changed => console.log("EVENT changed", changed))
		.on('error', err => console.log("EVENT err", err))
		.on('connected', str => console.log("EVENT str", str))

		this.ReserveInstance.events.AcceptClaim(options)
		.on('data', async(event) => {
			if(this.props.activeAccount === event.returnValues.withdrawAddress){
				console.log(this.props.activeAccount, event, "MATCH");
				let txInfo = {txHash: '', success: true, type:"ORACLE CLAIM APPROVAL", poolName: "claim submission approved", networkId: this.props.networkId};
				await this.displayTxInfo(txInfo);

				let valIds = await getNewDepositorValidatorIds(
					this.props.reserveAddress.reserve,
					event.returnValues.validatorIndex,
					[...this.props.depositorValIds]
				);
				await this.props.updateDepositorValIds(valIds);
			}
			console.log("ProcessClaim", event);
		})
		.on('changed', changed => console.log("EVENT changed", changed))
		.on('error', err => console.log("EVENT err", err))
		.on('connected', str => console.log("EVENT str", str))

		this.ReserveInstance.events.DenyClaim(options)
		.on('data', async(event) => {
			if(this.props.activeAccount === event.returnValues.withdrawAddress){
				console.log(this.props.activeAccount, event, "MATCH");
				let txInfo = {txHash: '', success: false, type:"ORACLE CLAIM ", poolName: "claim submission approved", networkId: this.props.networkId};
				await this.displayTxInfo(txInfo);
			}
			console.log("ProcessClaim", event);
		})
		.on('changed', changed => console.log("EVENT changed", changed))
		.on('error', err => console.log("EVENT err", err))
		.on('connected', str => console.log("EVENT str", str))

		this.ReserveInstance.events.ProcessClaim(options)
		.on('data', async(event) => {
			/*if(this.props.activeAccount === event.returnValues.withdrawAddress){
				console.log(this.props.activeAccount, event, "MATCH");
				let txInfo = {txHash: '', success: true,tokenString: "ETH", type:"APPLICATION APPROVAL", poolName: "application approved", networkId: this.props.networkId};
				await this.displayTxInfo(txInfo);
			}*/
			console.log("ProcessClaim", event);
		})
		.on('changed', changed => console.log("EVENT changed", changed))
		.on('error', err => console.log("EVENT err", err))
		.on('connected', str => console.log("EVENT str", str))
		/*poolTrackerInstance.events.AddPool(options)
		.on('data', async(event) => {
			console.log("EVENT data", event)
			let pending = [...this.props.pendingTxList];
			pending.forEach((e, i) =>{
				if(e.txHash === event.transactionHash){
					e.status = "complete"
				}
			});
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));

			await delay(3000);
			pending = (pending).filter(e => !(e.txHash === event.transactionHash));
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));
		})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))

		poolTrackerInstance.events.AddDeposit(options)
		.on('data', async(event) => {
			console.log("EVENT data", event)
			let pending = [...this.props.pendingTxList];
			pending.forEach((e, i) =>{
				if(e.txHash === event.transactionHash){
					e.status = "complete"
				}
			});
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));

			await delay(3000);
			pending = (pending).filter(e => !(e.txHash === event.transactionHash));
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));
		})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))

		poolTrackerInstance.events.WithdrawDeposit(options)
		.on('data', async(event) => {
			console.log("EVENT data", event)
			let pending = [...this.props.pendingTxList];
			pending.forEach((e, i) =>{
				if(e.txHash === event.transactionHash){
					e.status = "complete"
				}
			});
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));

			await delay(3000);
			pending = (pending).filter(e => !(e.txHash === event.transactionHash));
			await this.props.updatePendingTxList(pending);
			localStorage.setItem("pendingTxList", JSON.stringify(pending));
		})
			.on('changed', changed => console.log("EVENT changed", changed))
			.on('error', err => console.log("EVENT err", err))
			.on('connected', str => console.log("EVENT str", str))*/

		console.log("pending TX List", this.props.pendingTxList);
	}

	getAccounts = async() => {
		const provider = await this.connectToWeb3();
		this.provider = provider;

		provider.on("accountsChanged", async(accounts) => {
			console.log("accounts change", accounts, provider);
			await web3Modal.clearCachedProvider();
			localStorage.setItem("ownerPoolInfo", "");
			localStorage.setItem("userDepositPoolInfo", "");
			localStorage.setItem("pendingTxList", "");
			window.location.reload(false);
		  });

		// Subscribe to chainId change
		provider.on("chainChanged", (chainId) => {
			console.log(chainId);
			localStorage.setItem("ownerPoolInfo", "");
			localStorage.setItem("userDepositPoolInfo", "");
			localStorage.setItem("verifiedPoolInfo", "");
			localStorage.setItem("pendingTxList", "");
			window.location.reload(false);
		});

		// Subscribe to provider connection
		provider.on("connect", (info) => {
			console.log(info);
			localStorage.setItem("ownerPoolInfo", "");
			localStorage.setItem("userDepositPoolInfo", "");
			localStorage.setItem("pendingTxList", "");
			window.location.reload(false);
		});

		// Subscribe to provider disconnection
		provider.on("disconnect", async(error) => {
			console.log("disconnect", error);
			await web3Modal.clearCachedProvider();
			localStorage.setItem("ownerPoolInfo", "");
			localStorage.setItem("userDepositPoolInfo", "");
			localStorage.setItem("pendingTxList", "");
			window.location.reload(false);
		});

		this.web3 = new Web3(this.provider);

		const accounts = await this.web3.eth.getAccounts();

    	await this.props.updateActiveAccount(accounts[0]);
	}

	getAaveData = async() => {
		let results = await this.AaveProtocolDataProviderInstance.methods.getAllATokens().call();
		return results;
	}

	setAavePoolAddress = async(aavePoolAddressesProviderAddress) => {
		const aavePoolAddress = await getAavePoolAddress(aavePoolAddressesProviderAddress);
		await this.props.updateAavePoolAddress(aavePoolAddress);

	}

	setNetworkId = async(networkId) => {
		await this.props.updateNetworkId(networkId);
	}

	setReserveAddress = async(reserveAddress) => {
		await this.props.updateReserveAddress(reserveAddress);
	}

	setActiveBalances = async(balances) => {
		await this.props.updateActiveBalances(balances);
	}

	setSliETHInfo = async(sliETHInfo) => {
		await this.props.updateSliETHInfo(sliETHInfo);
	}

	setDepositorValIds = async(depositorValIds) => {
		await this.props.updateDepositorValIds(depositorValIds);
	}

	setActiveAccountState = async(activeAccount) => {
		await this.props.updateActiveAccount(activeAccount);
	}
	setTokenMapState = async(tokenMap) => {
		let acceptedTokens = Object.keys(tokenMap);
		const geckoPriceData = await getPriceFromCoinGecko(this.networkId);

		for(let i = 0; i < acceptedTokens.length; i++){
			const key = acceptedTokens[i];
			const address =  tokenMap[key] && tokenMap[key].address;

			const aaveTokenInfo = await getLiquidityIndexFromAave(address, getAaveAddressProvider(this.networkId));
			const erc20Instance = await new this.web3.eth.Contract(ERC20Instance.abi, address);
			const allowance = await getAllowance(erc20Instance, this.poolTrackerAddress, this.props.activeAccount);
			tokenMap[key]['allowance'] = allowance > 0 ? true : false;

			tokenMap[key]['depositAPY'] = this.calculateAPY(aaveTokenInfo.currentLiquidityRate).toPrecision(4);
			tokenMap[key]['liquidityIndex'] = aaveTokenInfo.liquidityIndex;
			const apiKey = tokenMap[key] && tokenMap[key].apiKey;
			if(geckoPriceData){
				tokenMap[key]['priceUSD'] = geckoPriceData[apiKey] && geckoPriceData[apiKey].usd;
			}
			else{
				tokenMap[key]['priceUSD'] = 0;
			}

			const tvl = await this.PoolTrackerInstance.methods.getTVL(address).call();
			tokenMap[key]['tvl'] = precise(tvl, tokenMap[key]['decimals']);

			const totalDonated = await this.PoolTrackerInstance.methods.getTotalDonated(address).call();
			tokenMap[key]['totalDonated'] = precise(totalDonated, tokenMap[key]['decimals']);

		}
		await this.props.updateTokenMap(tokenMap);
		localStorage.setItem("tokenMap", JSON.stringify(tokenMap));
	}

	calculateAPY = (liquidityRate) => {
		const RAY = 10**27;
		const SECONDS_PER_YEAR = 31536000;
		const depositAPR = liquidityRate/RAY;
		//return 1+ (depositAPR / SECONDS_PER_YEAR);
		return (((1 + (depositAPR / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR) - 1)*100;
	}

	getOwnerAddress = async(activeAccount) => {
		const userOwnedPools = await this.PoolTrackerInstance.methods.getReceiverPools(activeAccount).call();
		return userOwnedPools;
	}

	render() {
				let history;
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			history = this.props.history;
		} else {
			history = createHashHistory({ basename: '/just_cause' })
			//history = createBrowserHistory({ basename: '/just_cause' })
		}

		return (
    	<ConnectedRouter history={history}>
        	{ routes }
		</ConnectedRouter>
		)
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
	activeAccount: state.activeAccount,
	activeBalances: state.activeBalances,
	networkId: state.networkId,
	aavePoolAddress: state.aavePoolAddress,
	connect: state.connect,
	tokenMap: state.tokenMap,
	pendingTxList: state.pendingTxList,
	reserveAddress: state.reserveAddress,
	sliETHInfo: state.sliETHInfo,
	depositorValIds: state.depositorValIds,

})

const mapDispatchToProps = dispatch => ({
	detectMobile: () => dispatch(detectMobile()),
	updateActiveAccount: (s) => dispatch(updateActiveAccount(s)),
	updateActiveBalances: (s) => dispatch(updateActiveBalances(s)),
	updateTokenMap: (tokenMap) => dispatch(updateTokenMap(tokenMap)),
	updateVerifiedPoolAddrs: (addrsArray) => dispatch(updateVerifiedPoolAddrs(addrsArray)),
	updateDepositorValIds: (infoArray) => dispatch(updateDepositorValIds(infoArray)),
	updateOwnerPoolAddrs: (addrsArray) => dispatch(updateOwnerPoolAddrs(addrsArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateUserDepositPoolAddrs: (addrsArray) => dispatch(updateUserDepositPoolAddrs(addrsArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateReserveAddress: (s) => dispatch(updateReserveAddress(s)),
	updateSliETHInfo: (o) => dispatch(updateSliETHInfo(o)),
	updateNetworkId: (int) => dispatch(updateNetworkId(int)),
	updateAavePoolAddress: (s) => dispatch(updateAavePoolAddress(s)),
	updateConnect: (bool) => dispatch(updateConnect(bool)),
	updateBurnPitBalances: (bal) => dispatch(updateBurnPitBalances(bal)),
	updatePendingTxList: (list) => dispatch(updatePendingTxList(list)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
})


export default connect(mapStateToProps, mapDispatchToProps)(App)