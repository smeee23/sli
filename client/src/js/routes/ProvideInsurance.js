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
		console.log('withdraw clicked');
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
		console.log('deposit clicked', this.props.depositAmount);
		try{
			const activeAccount = this.props.activeAccount;
            console.log(this.props.activeBalances)
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

    getSliStats = async() => {
        console.log(await getSliStats());
    }
    render() {
            return (
                    <Fragment>
                        <section className="page-section horizontal-padding" style={{paddingBottom: "8px", alignItems: "center", justifyContent: "center"}}>
                                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                    <h1 style={{alignItems:"center", justifyContent:"center", marginRight:"0%"}}>Bond ETH</h1>
                                    <h2 style={{alignItems:"center", justifyContent:"center", marginRight:"0%", marginTop: "-40px", fontSize: 30}}>Deposit ETH to Claim Fund</h2>
                                    <div style={{display: "flex", flexDirection: "wrap", gap: "5px"}}>
                                    <div title={"exchange sliETH back to ETH"}><Button logo={displayLogo("ETH_WHITE")} text={"Withdraw sliETH"} /*disabled={isDisabled}*/ callback={async() => await this.withdrawDeposit()}/></div>
                                        <div title={"exchange ETH for sliETH and earn"}><Button logo={displayLogo("ETH")} text={"Deposit ETH"} /*disabled={isDisabled}*/ callback={async() => await this.depositETH()}/></div>
                                    </div>
                                    <p style={{alignItems:"center", justifyContent:"center", marginRight:"0%",fontSize: 12, marginTop: "8px", marginBottom: "0px"}}>Conversion: 1 sliETH = {this.props.sliETHInfo["sliConversion"]} ETH</p>
                                    <p style={{alignItems:"center", justifyContent:"center", marginRight:"0%",fontSize: 12, marginBottom: "0px"}}>Total Supply: {this.props.sliETHInfo["sliTotalSupply"]} sliETH</p>
                                    <p style={{alignItems:"center", justifyContent:"center", marginRight:"0%",fontSize: 12}}>Reserve Value: {this.props.sliETHInfo["protocolBalance"]} ETH</p>
                                </div>
                        </section>
                        <section className="page-section horizontal-padding">
                            <div style={{margin:'auto'}} className="grid">
                                <div className="grid__item--col-6 grid__item--col-12-medium">
                                    <p className="mr">JustCause allows you to leverage the power of decentralized finance (Defi) to fund causes that are important to you. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal injustice, and much more! Create and fund pools with your friends and JustCause smart contracts donate funds while preserving your initial deposit.</p>
                                </div>
                                <div className="grid__item--col-6 grid__item--col-12-medium">
                                    <p className="mr">Users participate as Contributors or Pool Creators. Pool Creators generate JustCause Pools which represent a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into lending protocols. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds they simply withdraw their original deposit and the interest accrued is left behind for the cause.</p>
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
})

const mapDispatchToProps = dispatch => ({
	updateShare: (share) => dispatch(updateShare(share)),
    updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
    updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProvideInsurance)
