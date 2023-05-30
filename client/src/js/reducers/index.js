import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import mobileReducer from './mobile'
import loadingReducer from './loading'
import activeAccountReducer from './activeAccount'
import tokenMapReducer from './tokenMap'
import verifiedPoolAddrsReducer from './verifiedPoolAddrs'
import depositorValIdsReducer from './depositorValIds'
import ownerPoolAddrsReducer from './ownerPoolAddrs'
import ownerPoolInfoReducer from './ownerPoolInfo'
import userDepositPoolAddrsReducer from './userDepositPoolAddrs'
import userDepositPoolInfoReducer from './userDepositPoolInfo'
import reserveAddressReducer from './reserveAddress'
import pendingTxReducer from './pendingTx'
import pendingTxListReducer from './pendingTxList'
import txResultReducer from './txResult'
import deployTxResultReducer from './deployTxResult'
import deployInfoReducer from './deployInfo'
import depositAmountReducer from './depositAmount'
import withdrawAmountReducer from './withdrawAmount'
import sliETHInfoReducer from './sliETHInfo'
import aavePoolAddressReducer from './aavePoolAddress'
import networkIdReducer from './networkId'
import claimReducer from './claim'
import approveReducer from './approve'
import shareReducer from './share'
import connectReducer from './connect'
import newAboutReducer from './newAbout'
import burnPitBalancesReducer from './burnPitBalances'
import activeBalancesReducer from './activeBalances'

const rootReducer = (history) => combineReducers({
	isMobile: mobileReducer,
	loading: loadingReducer,
	activeAccount: activeAccountReducer,
	activeBalances: activeBalancesReducer,
	tokenMap: tokenMapReducer,
	verifiedPoolAddrs: verifiedPoolAddrsReducer,
	depositorValIds: depositorValIdsReducer,
	ownerPoolAddrs: ownerPoolAddrsReducer,
	ownerPoolInfo: ownerPoolInfoReducer,
	userDepositPoolAddrs: userDepositPoolAddrsReducer,
	userDepositPoolInfo: userDepositPoolInfoReducer,
	reserveAddress: reserveAddressReducer,
	pendingTx: pendingTxReducer,
	pendingTxList: pendingTxListReducer,
	txResult: txResultReducer,
	deployTxResult: deployTxResultReducer,
	deployInfo: deployInfoReducer,
	depositAmount: depositAmountReducer,
	withdrawAmount: withdrawAmountReducer,
	sliETHInfo: sliETHInfoReducer,
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
