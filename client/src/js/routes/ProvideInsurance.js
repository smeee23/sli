import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Shapes from '../components/Shapes';

import LogoCard from "../components/logos/LogoCard";
import { Button } from '../components/Button';
import ShareModal from "../components/modals/ShareModal";
import {SmallModal } from "../components/Modal";
import { updateShare } from  "../actions/share";
import { Modal } from "../components/Modal";
import DepositModal  from "../components/modals/DepositModal";
import WithdrawModal  from "../components/modals/WithdrawModal";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";
import PendingTxList from "../components/PendingTxList";
import SliSwap from "../components/SliSwap";
import { displayLogo } from '../func/ancillaryFunctions';
import { getSliStats, convertWeiToETH} from "../func/contractInteractions";
import TxResultModal from "../components/modals/TxResultModal";
import PendingTxModal from "../components/modals/PendingTxModal";

class ProvideInsurance extends Component {
	componentDidMount() {
		window.scrollTo(0,0);
	}

    getDepositAmountModal = () => {
		if(this.props.depositAmount){
			let modal = <Modal isOpen={true}><DepositModal depositInfo={this.props.depositAmount}/></Modal>
			return modal;
		}
	}

    getWithdrawAmountModal = () => {
		if(this.props.withdrawAmount){
			let modal = <Modal isOpen={true}><WithdrawModal withdrawInfo={this.props.withdrawAmount}/></Modal>
			return modal;
		}
	}

    withdrawDeposit = async() => {
		this.props.updateWithdrawAmount('');
		try{
			const activeAccount = this.props.activeAccount;
            const userBalance = await convertWeiToETH(this.props.activeBalances.sliETHBalance);
			await this.props.updateWithdrawAmount({tokenString: "sliETH",  userBalance: userBalance, activeAccount: activeAccount, amount: ''});
		}
		catch (error) {
			console.error(error);
		}
	}

    depositETH = async() => {
		await this.props.updateDepositAmount('');
		try{
			const activeAccount = this.props.activeAccount;
			const userBalance = await convertWeiToETH(this.props.activeBalances.ethBalance);
			//const contractInfo = await getContractInfo(poolAddress);
			await this.props.updateDepositAmount({tokenString: "ETH", userBalance: userBalance, activeAccount: activeAccount, amount: ''});
			//this.updatePoolInfo(this.props.depositAmount.poolAddress, this.props.depositAmount.activeAccount);
		}
		catch (error) {
			console.error(error);
		}
	}

    getTxResultModal = () => {
		if(this.props.txResult){
			let modal = <Modal isOpen={true}><TxResultModal txDetails={this.props.txResult}/></Modal>;
			return modal;
		}
	}

    getPendingTxModal = () => {
		if(this.props.pendingTx){
			let modal = <Modal isOpen={true}><PendingTxModal txDetails={this.props.pendingTx}/></Modal>;
			//return modal;
		}
	}

	getSliETHStats = () => {
		if(this.props.networkId){
			return(
				<div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
					<p style={{alignItems:"center", justifyContent:"center", marginRight:"0%",fontSize: 12, marginTop: "8px", marginBottom: "0px"}}>Conversion: 1 sliETH = {this.props.sliETHInfo["sliConversion"]} ETH</p>
					<p style={{alignItems:"center", justifyContent:"center", marginRight:"0%",fontSize: 12, marginBottom: "0px"}}>Total Supply: {this.props.sliETHInfo["sliTotalSupply"]} sliETH</p>
					<p style={{alignItems:"center", justifyContent:"center", marginRight:"0%",fontSize: 12}}>Reserve Value: {this.props.sliETHInfo["protocolBalance"]} ETH</p>
				</div>
			);
		}
	}
    render() {
            return (
                    <Fragment>
                        <section className="page-section horizontal-padding" style={{paddingBottom: "8px", alignItems: "center", justifyContent: "center", height: "380px"}}>
                                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                    <h2 style={{fontSize: 60, alignItems:"center", justifyContent:"center", marginRight:"0%"}}>Bond ETH</h2>
                                    <h2 style={{alignItems:"center", justifyContent:"center", marginRight:"0%", marginTop: "-40px", fontSize: 30}}>Deposit ETH to Claim Fund</h2>
                                    <div style={{display: "flex", flexDirection: "wrap", gap: "5px"}}>
                                    <div title={"exchange sliETH back to ETH"}><Button logo={displayLogo("ETH_WHITE")} text={"Withdraw sliETH"} /*disabled={isDisabled}*/ callback={async() => await this.withdrawDeposit()}/></div>
                                        <div title={"exchange ETH for sliETH and earn"}><Button logo={displayLogo("ETH")} text={"Deposit ETH"} /*disabled={isDisabled}*/ callback={async() => await this.depositETH()}/></div>
                                    </div>
									{this.getSliETHStats()}
                                </div>
                        </section>
                        <section className="page-section horizontal-padding">
                            <div style={{margin:'auto'}} className="grid">
                                <div className="grid__item--col-6 grid__item--col-12-medium">
                                    <p className="mr">sliETH represents a share of the SLI claims fund. Deposits in the insurance contract, combined with premium deposits, generate interest in Aave. This interest serves two main purposes. First, it covers slashing insurance claims, which are infrequent (around 250 occurrences since December 2020) and average penalties of 1-2 ETH each (can be higher depending on network conditions).</p>
                                </div>
                                <div className="grid__item--col-6 grid__item--col-12-medium">
                                    <p className="mr">Second, any surplus interest earned beyond the insurance claim requirements is accrued to sliETH holders. This surplus interest acts as a reward, increasing the value of sliETH tokens and benefiting those who hold them. The surplus interest serves as a mechanism for sliETH holders to participate in the positive performance of the underlying protocol.</p>
                                </div>
                            </div>
                        </section>
                        {this.getPendingTxModal()}
                        {this.getDepositAmountModal()}
                        {this.getWithdrawAmountModal()}
                        {this.getTxResultModal()}
                        <PendingTxList/>
                    </Fragment>

            );
	}
}

const mapStateToProps = state => ({
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	sliETHInfo: state.sliETHInfo,
    depositAmount: state.depositAmount,
    withdrawAmount: state.withdrawAmount,
    activeBalances: state.activeBalances,
    pendingTxList: state.pendingTxList,
    pendingTx: state.pendingTx,
	txResult: state.txResult,
	networkId: state.networkId,
})

const mapDispatchToProps = dispatch => ({
	updateShare: (share) => dispatch(updateShare(share)),
    updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
    updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProvideInsurance)
