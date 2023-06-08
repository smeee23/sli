import getWeb3 from "../../getWeb3NotOnLoad";
import PoolTracker from "../../contracts/PoolTracker.json";
import ERC20Instance from "../../contracts/IERC20.json";
import PremiumGeneratorAaveV2 from "../../contracts/PremiumGeneratorAaveV2.json";
import PoolAddressesProvider from "../../contracts/IPoolAddressesProvider.json";
import Pool from "../../contracts/IPool.json";
import { getIpfsData } from "./ipfs";
import { tempFixForDescriptions } from "./verifiedPoolMap";

import { getValidatorInfo } from "./validatorInfoFeed";
import { convertSolidityTimestamp, addTwoWeeksToTimestamp, addOneDayToTimestamp } from "./ancillaryFunctions";
import Reserve from "../../contracts/Reserve.json";
import Web3 from "web3";

export const getSliStats = async(reserveAddress) => {
	const web3 = await getWeb3();

	const ReserveInstance = new web3.eth.Contract(
		Reserve.abi,
		reserveAddress,
	);

	const sliConversion = web3.utils.fromWei(await ReserveInstance.methods.getSliETHConversion().call(), 'ether').substring(0, 7)
	const sliTotalSupply = web3.utils.fromWei(await ReserveInstance.methods.getSliETHTotalSupply().call(), 'ether').substring(0, 7)
	const protocolBalance = web3.utils.fromWei(await ReserveInstance.methods.getProtocolBalance().call(), 'ether').substring(0, 7)

	return {sliConversion, sliTotalSupply, protocolBalance}
}

export const getBeneficiaryStatus = async(validatorId, reserveAddress) => {
	const web3 = await getWeb3();

	const ReserveInstance = new web3.eth.Contract(
		Reserve.abi,
		reserveAddress,
	);

	/*  NOT_ACTIVE,
        ACTIVE,
        AWAIT_ORACLE_ADD,
        ORACLE_ADD_APPROVE,
        AWAIT_ORACLE_CLAIM,
        CLAIM_WAIT_PERIOD,
        CLOSED,
        CLAIM_PAUSED*/
	let {status, withdrawAddress, loss, claimTimestamp, applyTimestamp} = await ReserveInstance.methods.getBeneficiaryInfo(validatorId).call();
	if(status == 0) status = 'NOT_ACTIVE';
	else if(status == 1) status = 'ACTIVE';
	else if(status == 2) status = 'AWAIT_APPLICATION';
	else if(status == 3) status = 'AWAIT_DEPOSIT';
	else if(status == 4) status = 'AWAIT_CLAIM_RESPONSE';
	else if(status == 5) status = 'CLAIM_WAIT_PERIOD';
	else if(status == 6) status = 'CLOSED';
	else status = 'CLAIM PAUSED';
	return {status, withdrawAddress, loss, claimTimestamp, applyTimestamp};
}

export const getDepositorIdsItem = async(validatorId, forceBeacon, reserveAddress) => {
	const {status, withdrawAddress, loss, claimTimestamp, applyTimestamp} = await getBeneficiaryStatus(validatorId, reserveAddress);
	let info = await getValidatorInfo(validatorId, forceBeacon);
	info["beneStatus"] = status;
	info["withdrawAddress"] = withdrawAddress;
	info["apply"] = applyTimestamp === "0" ? "N/A" : convertSolidityTimestamp(applyTimestamp);
	info["claim"] = claimTimestamp === "0" ? "N/A" : convertSolidityTimestamp(claimTimestamp);
	//info["claimPlusWait"] = claimTimestamp === "0" ? "N/A" : addTwoWeeksToTimestamp(claimTimestamp);
	info["claimPlusWait"] = claimTimestamp === "0" ? "N/A" : addOneDayToTimestamp(claimTimestamp);
	const lossFromAws = await convertWeiToETH(info["loss"].toString());
	info["loss"] = lossFromAws === "0" ? "N/A" : lossFromAws;
	info["validatorId"] = validatorId;

	return info;
}
export const getNewDepositorValidatorIds = async(reserveAddress, newValifatorId, oldDepositorValidatorIds) => {
	const web3 = await getWeb3();

	const ReserveInstance = new web3.eth.Contract(
		Reserve.abi,
		reserveAddress,
	);

	for(let i = 0; i < oldDepositorValidatorIds.length; i++){

		const validatorId = oldDepositorValidatorIds[i].validatorId;
		if(newValifatorId === validatorId){
			const info = await getDepositorIdsItem(validatorId, true, reserveAddress);
			oldDepositorValidatorIds[i] = info;
		}
	}
	return oldDepositorValidatorIds;
}

export const getDepositorValidatorIds = async(reserveAddress, activeAccount) => {
	const web3 = await getWeb3();

	const ReserveInstance = new web3.eth.Contract(
		Reserve.abi,
		reserveAddress,
	);

	let validatorIds = await ReserveInstance.methods.getDepositorValidatorIds(activeAccount).call();

	const set = new Set(validatorIds);
	validatorIds = Array.from(set);

	let validatorInfo = [];
	for(let i = 0; i < validatorIds.length; i++){
		const info = await getDepositorIdsItem(validatorIds[i], false, reserveAddress);
		validatorInfo[i] = info;
	}

	return validatorInfo;
}

export const getPremiumDeposit = async(premiumGeneratorAddr) => {
	const web3 = await getWeb3();

    let PremiumGeneratorAaveV2Instance = new web3.eth.Contract(
        PremiumGeneratorAaveV2.abi,
        premiumGeneratorAddr,
    );
    return (await convertWeiToETH(await PremiumGeneratorAaveV2Instance.methods.premiumDeposit().call()));
  }

export const getBalances = async(reserveAddress, activeAccount) => {
	const web3 = await getWeb3();

	const ReserveInstance = new web3.eth.Contract(
		Reserve.abi,
		reserveAddress,
	);

	const sliETHBalance = await ReserveInstance.methods.getSlashingInsuranceETHBalance(activeAccount).call();
	const ethBalance = await web3.eth.getBalance(activeAccount);
	return {sliETHBalance, ethBalance}
}

export const convertWeiToETH = async(value) => {
	const web3 = await getWeb3();
	return web3.utils.fromWei(value, 'ether').substring(0, 7)
  }

export const convertGweiToETH = async(value) => {
	const web3 = await getWeb3();
	let valueInWei = web3.utils.toWei(value.toString(), 'gwei');
	return web3.utils.fromWei(valueInWei, 'ether').substring(0, 7);
}
export const getAavePoolAddress = async(poolAddressesProviderAddress) => {
	const web3 = await getWeb3();
	const PoolAddressesProviderInstance = new web3.eth.Contract(
		PoolAddressesProvider.abi,
		poolAddressesProviderAddress,
	);

	const poolAddr = await PoolAddressesProviderInstance.methods.getPool().call();
	return poolAddr;
}

	export const getLiquidityIndexFromAave = async(tokenAddress, poolAddressesProviderAddress) => {
		const web3 = await getWeb3();
		const PoolAddressesProviderInstance = new web3.eth.Contract(
			PoolAddressesProvider.abi,
			poolAddressesProviderAddress,
		);

		let poolAddr = await PoolAddressesProviderInstance.methods.getPool().call();

		const PoolInstance = new web3.eth.Contract(
			Pool.abi,
			poolAddr,
		);
		let aaveTokenInfo = await PoolInstance.methods.getReserveData(tokenAddress).call();
		return aaveTokenInfo;
	}

	export const getAllowance = async(erc20Instance, address, activeAccount) => {
		const allowance = await erc20Instance.methods.allowance(activeAccount, address).call();
		return allowance;
	}

	const getWalletBalance = async(tokenAddress, activeAccount) => {
		const web3 = await getWeb3();
		const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
		const balance = await erc20Instance.methods.balanceOf(activeAccount).call();
		return balance;
	}

	export const getAmountBase = (amount, decimals) => {
		return (amount*10**decimals).toString();
	}

	export const getBalance = async(tokenAddress, decimals, tokenString, activeAccount) => {
		if(tokenString === 'ETH' || tokenString === 'MATIC'){
			const web3 = await getWeb3()
			let balance = await web3.eth.getBalance(activeAccount);
			balance = await web3.utils.fromWei(balance, "ether");
			return Number.parseFloat(balance).toPrecision(6);
		}
		else{
			let balance = await getWalletBalance(tokenAddress, activeAccount);
			balance = balance / 10**decimals;
			return Number.parseFloat(balance).toPrecision(6);
		}
	}


	export const checkTransactions = async(pendingList) => {
		const web3 = await getWeb3();
		let truePendings = [];
		pendingList.forEach(async(x) => {
			const receipt = await web3.eth.getTransactionReceipt(x.txHash);
			if(!receipt){
				truePendings.push(x);
			}
		});
		return truePendings;
	}

	export const checkValidAddress = async(address) => {
		const web3 = await getWeb3();
		const result = web3.utils.isAddress(address);
		if(!result) return "The receiver address is not a valid address, please recheck"

	}

	export const getVerifiedPools = async(networkId) => {
		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[networkId] && PoolTracker.networks[networkId].address,
		);

		const verifiedPools = await PoolTrackerInstance.methods.getVerifiedPools().call();
		return verifiedPools;
	}

	export const getUserOwned = async(activeAccount, networkId) => {
		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[networkId] && PoolTracker.networks[networkId].address,
		);

		const ownerPools = await PoolTrackerInstance.methods.getUserOwned(activeAccount).call();
		return ownerPools;
	}

	export const getUserDeposits = async(activeAccount, networkId) => {
		const web3 = await getWeb3();
		const PoolTrackerInstance = new web3.eth.Contract(
			PoolTracker.abi,
			PoolTracker.networks[networkId] && PoolTracker.networks[networkId].address,
		);

		let userDepositPools = await PoolTrackerInstance.methods.getUserDeposits(activeAccount).call();
		return [...new Set(userDepositPools)];
	}
