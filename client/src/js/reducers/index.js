import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import mobileReducer from './mobile'
import loadingReducer from './loading'
import activeAccountReducer from './activeAccount'
import tokenMapReducer from './tokenMap'
import verifiedPoolAddrsReducer from './verifiedPoolAddrs'
import verifiedPoolInfoReducer from './verifiedPoolInfo'
import ownerPoolAddrsReducer from './ownerPoolAddrs'
import ownerPoolInfoReducer from './ownerPoolInfo'
import userDepositPoolAddrsReducer from './userDepositPoolAddrs'
import userDepositPoolInfoReducer from './userDepositPoolInfo'
import poolTrackerAddressReducer from './poolTrackerAddress'
import pendingTxReducer from './pendingTx'
import pendingTxListReducer from './pendingTxList'
import txResultReducer from './txResult'
import deployTxResultReducer from './deployTxResult'
import deployInfoReducer from './deployInfo'
import depositAmountReducer from './depositAmount'
import withdrawAmountReducer from './withdrawAmount'
import searchInfoReducer from './searchInfo'
import aavePoolAddressReducer from './aavePoolAddress'
import networkIdReducer from './networkId'
import claimReducer from './claim'
import approveReducer from './approve'
import shareReducer from './share'
import connectReducer from './connect'
import newAboutReducer from './newAbout'
import burnPitBalancesReducer from './burnPitBalances'

const rootReducer = (history) => combineReducers({
	isMobile: mobileReducer,
	loading: loadingReducer,
	activeAccount: activeAccountReducer,
	tokenMap: tokenMapReducer,
	verifiedPoolAddrs: verifiedPoolAddrsReducer,
	verifiedPoolInfo: verifiedPoolInfoReducer,
	ownerPoolAddrs: ownerPoolAddrsReducer,
	ownerPoolInfo: ownerPoolInfoReducer,
	userDepositPoolAddrs: userDepositPoolAddrsReducer,
	userDepositPoolInfo: userDepositPoolInfoReducer,
	poolTrackerAddress: poolTrackerAddressReducer,
	pendingTx: pendingTxReducer,
	pendingTxList: pendingTxListReducer,
	txResult: txResultReducer,
	deployTxResult: deployTxResultReducer,
	deployInfo: deployInfoReducer,
	depositAmount: depositAmountReducer,
	withdrawAmount: withdrawAmountReducer,
	searchInfo: searchInfoReducer,
	aavePoolAddress: aavePoolAddressReducer,
	networkId: networkIdReducer,
	claim: claimReducer,
	approve: approveReducer,
	share: shareReducer,
	connect: connectReducer,
	newAbout: newAboutReducer,
	burnPitBalances: burnPitBalancesReducer,

	router: connectRouter(history),
})

export default rootReducer
