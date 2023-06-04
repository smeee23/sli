import React, { Component } from "react"
import classNames from "classnames";

import { connect } from "react-redux";

import Icon from "./Icon";
import palette from "../utils/palette";

import { Button, ButtonSmall } from '../components/Button';

import { updateTxResult } from  "../actions/txResult";
import { updateDepositAmount } from  "../actions/depositAmount";
import { updateWithdrawAmount } from  "../actions/withdrawAmount";
import { updateClaim } from "../actions/claim";
import { updateApprove } from "../actions/approve";
import { updateTokenMap } from "../actions/tokenMap"
import { updateDepositorValIds } from "../actions/depositorValIds"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"
import { updateShare } from  "../actions/share";
import { updateNewAbout } from  "../actions/newAbout";
import { updatePendingTx } from "../actions/pendingTx";

import { getBalance, convertGweiToETH, convertWeiToETH, getPremiumDeposit} from '../func/contractInteractions';
import { precise, delay, getHeaderValuesInUSD, getFormatUSD, displayLogo, displayLogoLg, redirectWindowBlockExplorer, redirectWindowUrl, numberWithCommas, copyToClipboard, checkPoolInPoolInfo, addNewPoolInfoAllTokens } from '../func/ancillaryFunctions';
import { verifiedPoolMap } from '../func/verifiedPoolMap';
import { Modal, SmallModal, LargeModal } from "../components/Modal";
import DepositPremiumModal from '../components/modals/DepositPremiumModal'
import WithdrawPremiumModal from '../components/modals/WithdrawPremiumModal'
import ApproveModal from '../components/modals/ApproveModal'
import PendingTxModal from "../components/modals/PendingTxModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import ShareModal from "../components/modals/ShareModal";

class Card extends Component {
	interval = 0;

	constructor(props) {
		super(props);

		this.state = {
			open: false,
			loading: false,
			tokenButtons: [],
			tokenInfo: this.props.acceptedTokenInfo,
			copied: false,
			directResponse: "",
		}
	}

  	componentDidMount = async () => {
		window.scrollTo(0,0);
		try{
			window.scrollTo(0,0);
			if(this.props.deployInfo) await this.props.updateDeployInfo('');
			if(this.props.newAbout) await this.props.updateNewAbout('');
			if(this.props.depositAmount) await this.props.updateDepositAmount('');
			if(this.props.withdrawAmount) await this.props.updateWithdrawAmount('');
			if(this.props.approve) await this.props.updateApprove('');
			if(this.props.share) await this.props.updateShare("");
			if(this.props.claim)  await this.props.updateClaim('');

			this.setState({ tokenInfo: this.props.acceptedTokenInfo })
		}
		catch (error) {
			alert(
				error,
			);
			console.error(error);
		}
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	displayWithdraw = () => {
		return <div title={"withdraw coverage and receieve premium deposit"}><Button logo={displayLogo("ETH")} text={"Withdraw Insurance"} /*disabled={isDisabled}*/ callback={() => {}}/></div>

	}

	openApplyModal = async(validatorId) => {
		await this.props.updatePendingTx("");
		await this.props.updatePendingTx({validatorId: validatorId});
	}

	displayDepositApplyWithdraw = (item) => {
		if(item){
			if(item.beneStatus == "AWAIT_DEPOSIT"){
			return <div title={"deposit premium insurance for slashing coverage"}><Button logo={displayLogo("ETH")} text={"Deposit Premium"} /*disabled={isDisabled}*/ callback={async() => await this.depositETH(item.validatorId)}/></div>
			}
			else if(item.beneStatus == "NOT_ACTIVE"){
				return <div title={"apply for slashing insurance for your validator"}><Button logo={displayLogo("ETH")} text={"Apply For Coverage"} /*disabled={isDisabled}*/ callback={async() => await this.openApplyModal(item.validatorId)}/></div>
				}
			else if(!(item.slashed && item.claim == "N/A")){
				return <div title={"withdraw coverage and receieve premium deposit"}><Button logo={displayLogo("ETH")} text={"Withdraw Insurance"} /*disabled={isDisabled}*/ callback={async() => await this.withdrawDeposit(item.validatorId)}/></div>;
			}
		}
	}
	displayClaim = (item) => {
		if(item){
			if(item.slashed)
				return <div title={"make a claim for a covered validator, who has been slashed"}>
							<Button logo={displayLogo("ETH")} text={"Make Claim"} /*disabled={isDisabled}*/ callback={() => {}}/>
						</div>
				}
	}
	toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}

	copyToClipboard = (receiver) => {
		copyToClipboard(receiver);

		this.setState({
			copied: true,
		});
	}

	getAPY = (depositAPY) => {
		if(depositAPY){
			if(depositAPY.includes("e-")){
				depositAPY = "0.000"
			}
			return (<p>{" "+ depositAPY+'% APY'}</p>);
		}
	}

	getVerifiedLinks = (isVerified, poolName) => {
		if(!poolName) return;
		if(isVerified && this.props.networkId === 137){
			const name = poolName.replace(/\s+/g, '');
			const keys = Object.keys(verifiedPoolMap)
			if(keys.includes(name)){
			const url = (verifiedPoolMap[name] && verifiedPoolMap[name]).siteUrl;
				return(
					<div title="more about organaization">
						<Button isLogo="link" callback={() => redirectWindowUrl(url)}/>
					</div>
				);
			}
		}

	}

	getCopyButton = (receiver) => {
		if(this.state.copied){
			return (
				<div title="copy receiving address to clipboard"><Button isLogo="copy_white_check" disable="true" callback={() => this.copyToClipboard(receiver)}/></div>
			);
		}
		return (
			<div title="copy receiving address to clipboard"><Button isLogo="copy_white" disable="true" callback={() => this.copyToClipboard(receiver)}/></div>
		);
	}

	resetAnimation = () => {
		const el = document.getElementById("animated");
		el.style.animation = "none";
		let temp = el.offsetHeight;
		el.style.animation = null;
	}

	getName = (name) => {
		if(!name) return;
		return (<div title="validator name" style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
					<div style={{gridColumn: 1}}>
						<p>{"Name"}</p>
					</div>
					<div style={{gridColumn: 2, width: "250px"}}>
						<p>{name}</p>
					</div>
				</div>);
	}

	getSlashed = (slashed) => {
		if(slashed){
			 return <p style={{color: "red"}}>{"Yes"}</p>
		}
		return <p style={{color: "green"}}>{"No"}</p>
	}
	createValidatorInfo = () => {
		//if (!acceptedTokenInfo) return '';
		if (!this.props.depositorValIds[this.props.idx]) return '';

		let item = this.props.depositorValIds[this.props.idx];
		item.decimals = 18;

		//const priceUSD = this.props.tokenMap[item.acceptedTokenString] && this.props.tokenMap[item.acceptedTokenString].priceUSD;
		const tokenInfo =
			<div className="card__body" key={"ETH"}>
				<div style={{display: "grid", width: "330px", flex: "0 0 330", borderRight: "double"}}>
					<div id="animated" className="card__body__column__nine">
						<div title="validator info" style={{display: "grid", gridTemplateColumns:"150px 1fr"}}>
							<div style={{gridColumn: 1}}>
								<p style={{fontSize: 14}}>{"Validator Info"}</p>
							</div>
						</div>
						{this.getName(item.beaconInfo.name)}
						<div title="validator status" style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Validator Status"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p>{item.beaconInfo.status}</p>
							</div>
						</div>
						<div title="policy status" style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Policy Status"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p>{item.beneStatus}</p>
							</div>
						</div>
						<div title="date and time of coverage application" style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Date Apply"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p>{item.apply}</p>
							</div>
						</div>
						<div title={"public key"} style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Public Key"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.beaconInfo.pubkey.slice(0, 6)+ "..."+item.pubkey.slice(-4)}</p>
							</div>
						</div>
						<div title={"withdraw Address"} style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Withdraw Address"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.withdrawAddress.slice(0, 6)+ "..."+item.withdrawAddress.slice(-4)}</p>
							</div>
						</div>

						<div title="validator info" style={{display: "grid", gridTemplateColumns:"150px 1fr"}}>
							<div style={{gridColumn: 1}}>
								<p style={{fontSize: 14}}>{"Claims Info"}</p>
							</div>
						</div>
						<div title={"has validator been slashed yes/no"} style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Slashed"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							{this.getSlashed(item.slashed)}
							</div>
						</div>
						<div title={"ETH lost due to slashing"} style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Loss"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
								{item.loss}
							</div>
						</div>
						<div title={"date and time of claim"} style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Date Claim"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
								{item.claim}
							</div>
						</div>
					</div>
				</div>

				<div style={{display: "grid", width: "210px", flex: "0 0 210"}}>
					<div id="animated" className="card__body__column__nine">
						<div title="validator info" style={{display: "grid", gridTemplateColumns:"70px 1fr"}}>
							<div style={{gridColumn: 1}}>
								<p style={{fontSize: 14}}>{"Returns"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p style={{fontSize: 14}}>{"ETH"}</p>
							</div>
						</div>
						<div title="validator balance" style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Balance"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p>{item.beaconInfo.balance}</p>
							</div>
						</div>
						<div title={"earned 1 day in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Day"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.beaconInfo.performance1d}</p>
							</div>
						</div>
						<div title={"earned 7 days in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Week"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.beaconInfo.performance7d}</p>
							</div>
						</div>

						<div title={"earned 31 days in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Month"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.beaconInfo.performance31d}</p>
							</div>
						</div>

						<div title={"earned 365 days in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Year"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.beaconInfo.performance365d}</p>
							</div>
						</div>
						<div title={"overall earned in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Total"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.beaconInfo.performancetotal}</p>
							</div>
						</div>
						<div style={{marginRight: "auto"}}>
							{/*this.displayWithdraw()*/}
							{this.displayDepositApplyWithdraw(item)}
							{this.displayClaim(item)}
						</div>
					</div>
				</div>

			</div>
		return tokenInfo;
	}

	getDepositAmountModal = () => {
		if(this.props.depositAmount){
			let modal = <Modal isOpen={true}><DepositPremiumModal depositInfo={this.props.depositAmount}/></Modal>
			return modal;
		}
	}

	depositETH = async(validatorId) => {
		await this.props.updateDepositAmount('');
		console.log('deposit clicked', this.props.depositAmount);
		try{
			const activeAccount = this.props.activeAccount;
            console.log(this.props.activeBalances)
			const userBalance = await convertWeiToETH(this.props.activeBalances.ethBalance);
			const premiumDeposit =  await getPremiumDeposit(this.props.reserveAddress.premiumGenerator);
			await this.props.updateDepositAmount({tokenString: "ETH", userBalance: userBalance, activeAccount: activeAccount, validatorId: validatorId, premiumDeposit: premiumDeposit});
			//this.updatePoolInfo(this.props.depositAmount.poolAddress, this.props.depositAmount.activeAccount);
		}
		catch (error) {
			console.error(error);
		}
	}

	getWithdrawAmountModal = () => {
		if(this.props.withdrawAmount){
			let modal = <Modal isOpen={true}><WithdrawPremiumModal withdrawInfo={this.props.withdrawAmount}/></Modal>
			return modal;
		}
	}
	withdrawDeposit = async(validatorId) => {
		this.props.updateWithdrawAmount('');
		console.log('withdraw clicked');
		try{
			const activeAccount = this.props.activeAccount;
			const userBalance = await convertWeiToETH(this.props.activeBalances.ethBalance);
			const premiumDeposit =  await getPremiumDeposit(this.props.reserveAddress.premiumGenerator);
			await this.props.updateWithdrawAmount({tokenString: "ETH", userBalance: userBalance, activeAccount: activeAccount, validatorId: validatorId, premiumDeposit: premiumDeposit});
		}
		catch (error) {
			console.error(error);
		}
	}

	getClaimModal = () => {
		if(this.props.claim){
			//let modal = <SmallModal isOpen={true}><ClaimModal claimInfo={this.props.claim}/></SmallModal>
			return ""// modal;
		}
	}

	claim = async(poolAddress, tokenAddress, unclaimedInterest) => {
		await this.props.updateClaim('');
		console.log('claim interest clicked', poolAddress);
		try{
			const activeAccount = this.props.activeAccount;
			const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);

			await this.props.updateClaim({tokenString: tokenString, tokenAddress: tokenAddress, poolAddress: poolAddress, activeAccount: activeAccount, unclaimedInterest: unclaimedInterest});

		}
		catch (error) {
			console.error(error);
		}
	}

	getApproveModal = () => {
		if(this.props.approve){
			let modal = <SmallModal isOpen={true}><ApproveModal approveInfo={this.props.approve}/></SmallModal>
			return modal;
		}
	}

	approve = async(tokenAddress, tokenString, poolAddress) => {
		console.log("approve clicked");
		this.props.updateApprove('');
		try{
			const activeAccount = this.props.activeAccount;

			await this.props.updateApprove({tokenString: tokenString, tokenAddress: tokenAddress, poolAddress: poolAddress, activeAccount: activeAccount});
		}
		catch (error) {
			console.error(error);
		}
	}

	isReceiver = (receiver) => {
		if(receiver === this.props.activeAccount){
			return true;
		}
		return false;
	}
	getShareModal = () => {
		if(this.props.share){
			let modal = <SmallModal isOpen={true}><ShareModal info={this.props.share}/></SmallModal>
			return modal;
		}
	}

	share = async(poolAddress, name) => {
		await this.props.updateShare('');
		this.props.updateShare({poolAddress: poolAddress, name: name});
	}
	displayTxInfo = async(txInfo,) => {
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

	getPendingTxModal = async() => {
		if(this.props.pendingTx){
			await this.poolScraper();
			let modal = <Modal isOpen={true}><PendingTxModal txDetails={this.props.pendingTx}/></Modal>;
			return modal;
		}
	}
	getDeployTxModal = () => {
		if(this.props.deployTxResult){
			let modal = <Modal isOpen={true}><DeployTxModal txDetails={this.props.deployTxResult}/></Modal>;
			return modal;
		}
	}

	getHeaderValues = () => {
		return getHeaderValuesInUSD(this.state.tokenInfo, this.props.tokenMap);
	}
	/*refresh = async(poolAddress) =>{
		this.setState({loading: true});

		let newInfoAllTokens = await getDirectFromPoolInfoAllTokens(this.props.address, this.props.tokenMap, this.props.activeAccount);
		console.log("update all tokens", newInfoAllTokens);

		if(checkPoolInPoolInfo(poolAddress, this.props.userDepositPoolInfo)){
			const newDepositInfo = addNewPoolInfoAllTokens([...this.props.userDepositPoolInfo], newInfoAllTokens);
			await this.props.updateUserDepositPoolInfo(newDepositInfo);
			localStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));
		}

		if(checkPoolInPoolInfo(poolAddress, this.props.ownerPoolInfo)){
			const newOwnerInfo = addNewPoolInfoAllTokens([...this.props.ownerPoolInfo], newInfoAllTokens);
			await this.props.updateOwnerPoolInfo(newOwnerInfo);
			localStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));
		}

		if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
			const newVerifiedInfo = addNewPoolInfoAllTokens([...this.props.verifiedPoolInfo], newInfoAllTokens);
			await this.props.updateDepositorValIds(newVerifiedInfo);
			localStorage.setItem("verifiedPoolInfo", JSON.stringify(newVerifiedInfo));
		}

		let tempInfo = this.props.acceptedTokenInfo;
		for(let i = 0; i < this.props.acceptedTokenInfo.length; i++){
			const tokenInfo = newInfoAllTokens.newTokenInfo && newInfoAllTokens.newTokenInfo[this.props.acceptedTokenInfo[i].address];
			tempInfo[i].unclaimedInterest = tokenInfo.unclaimedInterest;
			tempInfo[i].claimedInterest = tokenInfo.claimedInterest;
			tempInfo[i].userBalance = tokenInfo.userBalance;
			tempInfo[i].totalBalance = tokenInfo.totalBalance;
		}

		this.resetAnimation();
		this.setState({ tokenInfo: tempInfo, loading: false });
	}*/

	getRefreshButton = (poolAddress) => {
		if(!this.state.open) return;
		const logo = this.state.loading ? "refresh_pending" : "refresh";
		return(
			<div title="refresh pool balances" style={{marginRight:"-16px"}}>
				<Button isLogo={logo} callback={async() => await this.refresh(poolAddress)} />
			</div>

		);
	}

	render() {
		const { idx } = this.props;
		const poolIcons = [
			{ "name": "poolShape1", "color": palette("brand-red")},
			{ "name": "poolShape2", "color": palette("brand-yellow")},
			{ "name": "poolShape3", "color": palette("brand-blue")},
			{ "name": "poolShape4", "color": palette("brand-pink")},
			{ "name": "poolShape5", "color": palette("brand-green")},
		]
		const validator = this.props.depositorValIds[idx];
		const randomPoolIcon = poolIcons[idx % poolIcons.length];

		const classnames = classNames({
			"card": true,
			"card--open": this.state.open,
		})

		//const {userBalance, interestEarned, totalBalance} = getHeaderValuesInUSD(acceptedTokenInfo, this.props.tokenMap);
		//const {userBalance, interestEarned, totalBalance} = this.getHeaderValues();
		//const tokenButtons = this.createTokenButtons(acceptedTokenInfo);
		const validatorInfo = this.createValidatorInfo();

		return (
			<div className={classnames}>
				<div className="card__header">
				<Icon name={randomPoolIcon.name} size={32} color={randomPoolIcon.color} strokeWidth={3}/>
					<p className="mb0" style={{fontSize: 20}}>
						{"Validator " + validator.validatorId}
					</p>

					<div className="card__header--right">
									<div className="card__open-button" onClick={this.toggleCardOpen}><Icon name={"plus"} size={32}/></div>
					</div>
				</div>
				{validatorInfo}
				<div className="card__bar"/>
				{this.getDepositAmountModal()}
				{this.getWithdrawAmountModal()}
				{this.getApproveModal()}
				{this.getShareModal()}
      		</div>
		);
	}
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	userDepositPoolAddrs: state.userDepositPoolAddrs,
	userDepositPoolInfo: state.userDepositPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	depositAmount: state.depositAmount,
	withdrawAmount: state.withdrawAmount,
	claim: state.claim,
	approve: state.approve,
	share: state.share,
	networkId: state.networkId,
	newAbout: state.newAbout,
	depositorValIds: state.depositorValIds,
	activeBalances: state.activeBalances,
	reserveAddress: state.reserveAddress,
})

const mapDispatchToProps = dispatch => ({
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateDepositAmount: (amnt) => dispatch(updateDepositAmount(amnt)),
	updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
	updateTokenMap: (tokenMap) => dispatch(updateTokenMap(tokenMap)),
	updateDepositorValIds: (infoArray) => dispatch(updateDepositorValIds(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateClaim: (txInfo) => dispatch(updateClaim(txInfo)),
	updateApprove: (txInfo) => dispatch(updateApprove(txInfo)),
	updateShare: (share) => dispatch(updateShare(share)),
	updateNewAbout: (about) => dispatch(updateNewAbout(about)),
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
