import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card';
import { Modal, LargeModal } from "../components/Modal";
import { Button, ButtonSmall } from '../components/Button';
import ApplyModal from "../components/modals/ApplyModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import PendingTxList from "../components/PendingTxList";

import { updateDepositorValIds } from "../actions/depositorValIds"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"
import { updateDeployTxResult } from  "../actions/deployTxResult";
import { updateDeployInfo} from "../actions/deployInfo";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";
import { updateClaim } from "../actions/claim";
import { updateApprove } from "../actions/approve";
import { updateShare } from  "../actions/share";
import { updateNewAbout } from  "../actions/newAbout";
import { updatePendingTx } from "../actions/pendingTx";

import LogoCard from "../components/logos/LogoCard";
import { precise, numberWithCommas, getHeaderValuesInUSD } from '../func/ancillaryFunctions';
import { convertGweiToETH } from '../func/contractInteractions';

import web3Modal from "../App";

class Insurance extends Component {

	constructor(props) {
		super(props);

		this.state = {
			openTabIndex: 0,
			openVerifiedIndex: 0,
			hideLowBalance: false,
			loadingBurnPitBal: false,
		}
	}
	componentDidMount = async () => {
		try{
			window.scrollTo(0,0);

			let currentTab = Number(localStorage.getItem('openTabIndex'));
			if(currentTab){
				this.setState({
					openTabIndex: currentTab
				});
			}

			let currentVerifiedTab = Number(localStorage.getItem('openVerifiedIndex'));
			if(currentVerifiedTab){
				this.setState({
					openVerifiedIndex: currentVerifiedTab
				});
			}

			if(this.props.deployInfo) await this.props.updateDeployInfo('');
			if(this.props.newAbout) await this.props.updateNewAbout('');
			if(this.props.depositAmount) await this.props.updateDepositAmount('');
			if(this.props.withdrawAmount) await this.props.updateWithdrawAmount('');
			if(this.props.approve) await this.props.updateApprove('');
			if(this.props.share) await this.props.updateShare("");
			if(this.props.claim)  await this.props.updateClaim('');
		}
		catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				error,
			);
			console.error(error);
		}
	}

	componentDidUpdate = () => {
		console.log('component did update');
	}

	getTxResultModal = () => {
		if(this.props.txResult){
			let modal = <Modal isOpen={true}><TxResultModal txDetails={this.props.txResult}/></Modal>;
			return modal;
		}
	}
	getApplyModal = () => {
		if(this.props.pendingTx){
			let modal = <Modal isOpen={true}><ApplyModal txDetails={this.props.pendingTx}/></Modal>;
			return modal;
		}
	}
	getDeployTxModal = () => {
		if(this.props.deployTxResult){
			let modal = <Modal isOpen={true}><DeployTxModal txDetails={this.props.deployTxResult}/></Modal>;
			return modal;
		}
	}
	deploy = async() => {
		await this.props.updateDeployInfo('');
		const activeAccount = this.props.activeAccount;
		this.props.updateDeployInfo({activeAccount: activeAccount});
	}

	displayDeployInfo = async(txInfo) => {
		this.props.updateDeployTxResult('');
		this.props.updateDeployTxResult(txInfo);
		await this.delay(5000);
		this.props.updateDeployTxResult('');
	}
	delay = (delayInms) => {
		return new Promise(resolve => {
		  setTimeout(() => {
			resolve(2);
		  }, delayInms);
		});
	}

	setSelectedToken = async(index) => {

		if(this.props.deployInfo) await this.props.updateDeployInfo('');
		if(this.props.newAbout) await this.props.updateNewAbout('');
		if(this.props.depositAmount) await this.props.updateDepositAmount('');
		if(this.props.withdrawAmount) await this.props.updateWithdrawAmount('');

		if(this.props.approve) await this.props.updateApprove('');
		if(this.props.share) await this.props.updateShare("");
		if(this.props.claim)  await this.props.updateClaim('');
		this.setState({
			openTabIndex: index,
		});
		localStorage.setItem('openTabIndex', index);
	}

	setSelectedVerifiedTab = async(index) => {
		this.setState({
			openVerifiedIndex: index,
		});
		localStorage.setItem('openVerifiedIndex', index);
	}

	createOptionButtons = () => {
		let buttonHolder = [];
		const buttonStrings = ['Verified Causes', 'Your Causes', 'Contributions'];
		const infoStrings = ['team verified pools', 'view and update your causes', 'your donations'];
		for(let i = 0; i < buttonStrings.length; i++){
			const name = buttonStrings[i];
			let isDisabled = false;
			if(i === this.state.openTabIndex){
				isDisabled = true;
			}
			buttonHolder.push(<div title={infoStrings[i]} key={i}><Button text={name} disabled={isDisabled} callback={() => this.setSelectedToken(i)}/></div>)
		}
		buttonHolder.push(<div style={{marginLeft: "30px"}} key={4} title="create your own cause"><Button text="Apply for Coverage" callback={() => {}}/></div>);
		return buttonHolder;
	}


	setHideLowBalances = () => {
		let orig = this.state.hideLowBalance;

		this.setState({
			hideLowBalance: (!orig)
		});
	}
	getApplicationLink = () => {
		if(this.state.openTabIndex === 0){
			return (
				<div style={{paddingBottom:"20px"}}/>
			);
		}
		else if (this.state.openTabIndex === 1){
			return (
				<div style={{paddingBottom:"62.5px"}}/>
			);
		}
		else if (this.state.openTabIndex === 2){
			return (
				<div title={this.state.hideLowBalance ? "show all pools contributed to" : "hide inactive pools"} style={{paddingBottom:"20px", maxWidth: "1000px", borderRadius: "8px", marginLeft: "auto", marginRight: "auto"}}>
					<ButtonSmall text={this.state.hideLowBalance ? "Show All" : "Hide Zero/Low Balances"} callback={() => this.setHideLowBalances()}/>
				</div>
			);
		}
	}

	redirectWindowGoogleApplication = () => {
		window.open("https://docs.google.com/forms/d/e/1FAIpQLSfvejwW-3zNhy4H3hvcIDZ2WGUH422Zj1_yVouRH4tTN8kQFg/viewform?usp=sf_link", "_blank")
	}

	openApplyModal = async() => {
		await this.props.updatePendingTx("");
		await this.props.updatePendingTx("open");
	}

	createCardInfo = () => {
		if(this.props.activeAccount === "Connect" && !web3Modal.cachedProvider){
			return(
			<div className="card__cardholder_slide" style={{display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginRight:"auto", paddingTop: "100px"}}>
				<div style={{display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>

					<a style={{ textDecoration: "none"}} title="New to Polygon? Follow link to learn more" href="https://polygon.technology/" target="_blank" rel="noopener noreferrer">
						<h2 style={{marginBottom: "5px", fontSize:50, marginLeft: "20px", marginRight: "auto"}} >Connect to Polygon Mumbai Testnet to View Validators</h2>
					</a>
				</div>
			</div>
			);
		}

		if(!this.props.depositorValIds){
			return (<div className="card__loader_wait" style={{display:"flex", flexDirection: "wrap", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginRight:"auto", paddingTop: "100px"}}>
				<h2>Loading Pools...</h2>
				</div>);
		}

		let cardHolder = [];
		for(let i = 0; i < (this.props.depositorValIds).length; i++){
			const item = this.props.depositorValIds[i];
			//const {userBalance} = getHeaderValuesInUSD(item.acceptedTokenInfo, this.props.tokenMap);

			cardHolder.push(
				<Card
					key={i}
					idx={i}
				/>
			);
		}
		return (
			<div className="card__cardholder_slide">
				{cardHolder}
			</div>
		);
	}

	render() {
		const cardHolder = this.createCardInfo();

		console.log("pendingTx", this.props.pendingTxList);

		return (
			<Fragment>
				<article>
					<section  className="page-section page-section--center horizontal-padding bw0" style={{paddingBottom:"20px"}}>
						<h2 style={{fontSize: 60, marginBottom: "5px"}} >Ethereum Slashing Insurance</h2>
						<div title="apply for slashing protection for your validator"><Button text="Apply for Coverage" callback={async() => await this.openApplyModal()}/></div>
					</section>
					<section className="page-section_no_vert_padding horizontal-padding bw0">
						{this.getApplyModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
						{cardHolder}
					</section>
					<section className="page-section page-section--center horizontal-padding bw0" style={{paddingTop:"0px"}} >

					</section>
				</article>
				<PendingTxList/>
			</Fragment>

		);
	}
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolInfo: state.ownerPoolInfo,
	ownerPoolAddrs: state.ownerPoolAddrs,
	userDepositPoolInfo: state.userDepositPoolInfo,
	userDepositPoolAddrs: state.userDepositPoolAddrs,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
	depositAmount: state.depositAmount,
	deployInfo: state.deployInfo,
	pendingTxList: state.pendingTxList,
	depositorValIds: state.depositorValIds,
})

const mapDispatchToProps = dispatch => ({
	updateDepositorValIds: (infoArray) => dispatch(updateDepositorValIds(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
	updateDeployInfo: (res) => dispatch(updateDeployInfo(res)),
	updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
	updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
	updateClaim: (txInfo) => dispatch(updateClaim(txInfo)),
	updateApprove: (txInfo) => dispatch(updateApprove(txInfo)),
	updateShare: (share) => dispatch(updateShare(share)),
	updateNewAbout: (about) => dispatch(updateNewAbout(about)),
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Insurance)
