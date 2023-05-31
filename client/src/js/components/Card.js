import React, { Component } from "react"
import classNames from "classnames";

import { connect } from "react-redux";

import Icon from "./Icon";
import palette from "../utils/palette";

import { Button, ButtonSmall } from '../components/Button';

import { updatePendingTx } from "../actions/pendingTx";
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

import { getBalance, getContractInfo , getDirectFromPoolInfoAllTokens, convertGweiToETH} from '../func/contractInteractions';
import { precise, delay, getHeaderValuesInUSD, getFormatUSD, displayLogo, displayLogoLg, redirectWindowBlockExplorer, redirectWindowUrl, numberWithCommas, copyToClipboard, checkPoolInPoolInfo, addNewPoolInfoAllTokens } from '../func/ancillaryFunctions';
import { verifiedPoolMap } from '../func/verifiedPoolMap';
import { Modal, SmallModal, LargeModal } from "../components/Modal";
import DepositModal from '../components/modals/DepositModal'
import WithdrawModal from '../components/modals/WithdrawModal'
import ClaimModal from '../components/modals/ClaimModal'
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

	displayDepositApplyWithdraw = (item) => {
		if(item.beneStatus == "AWAIT_DEPOSIT"){
		return <div title={"deposit premium insurance for slashing coverage"}><Button logo={displayLogo("ETH")} text={"Deposit Premium"} /*disabled={isDisabled}*/ callback={() => {}}/></div>
		}
		else if(item.beneStatus == "NOT_ACTIVE"){
			return <div title={"deposit premium insurance for slashing coverage"}><Button logo={displayLogo("ETH")} text={"Deposit Premium"} /*disabled={isDisabled}*/ callback={() => {}}/></div>
			}
		else /*if(!["NOT_ACTIVE", "AWAIT_DEPOSIT"].includes(item.beneStatus))*/{
			return <div title={"withdraw coverage and receieve premium deposit"}><Button logo={displayLogo("ETH")} text={"Withdraw Insurance"} /*disabled={isDisabled}*/ callback={() => {}}/></div>;
		}
	}
	displayClaim = (item) => {
		if(item.beneStatus)
		return <div title={"deposit premium insurance for slashing coverage"}>
		<Button logo={displayLogo("ETH")} text={"Deposit Premium"} /*disabled={isDisabled}*/ callback={() => {}}/>
		</div>
	}
	toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}

	setSelectedToken = (index) => {
		this.setState({
			selectedTokenIndex: index,
		});

	}

	copyToClipboard = (receiver) => {
		copyToClipboard(receiver);

		this.setState({
			copied: true,
		});
	}
	createTokenButtons = (acceptedTokenInfo) => {
		if(!this.state.open) return;
		if (!acceptedTokenInfo) return 'no data';
		let buttonHolder = [];
		for(let i = 0; i < acceptedTokenInfo.length; i++){
			const tokenName = acceptedTokenInfo[i].acceptedTokenString;
			let isDisabled = false;
			if(i === this.state.selectedTokenIndex) isDisabled = true;
			buttonHolder.push(<ButtonSmall text={tokenName} logo={displayLogo(tokenName)} disabled={isDisabled} key={i} callback={() => this.setSelectedToken(i)}/>)
		}
		return buttonHolder;
	}

	notifyLoad = () => {
		//console.log('image Loaded')
	}
	getPoolImage = (picHash, header) => {
		if(!picHash){
			//default JustCause image
			picHash = "bafybeigop55rl4tbkhwt4k4cvd544kz2zfkpdoovrsflqqkal2v4ucixxu"
		}
		if(header){
			return <img alt="" style={{width:'auto', maxWidth:'32px', height:'auto'}} src={'https://ipfs.io/ipfs/'+picHash} onLoad={this.notifyLoad()}/>
		}
		return <img alt="" style={{width:'auto', maxWidth:'300px', height:'auto'}} src={'https://ipfs.io/ipfs/'+picHash} onLoad={this.notifyLoad()}/>
	}

	getIsVerified = (isVerified) => {
		if(isVerified){
			return <h3 style={{fontSize: 13, color: "green"}}>(Verified Pool)</h3>
		}
		else{
			return <h3 style={{fontSize: 13}}>(User Pool)</h3>
		}
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

	getAbout = (about, address, isReceiver, picHash, title) => {
		if(this.state.directResponse){
			about = this.state.directResponse;
			console.log("directResponse", typeof about, typeof this.state.directResponse)
		}
		if(!about){
			console.log("about does not exist", address);
			about = "(There is a delay loading the description from IPFS.)"
		}
			let aboutString = about;
			let aboutHolder = [];
			//let regex = /^Update#[0-9]+$/;
			if(about.includes("\\n")){
				const paragraphs = about.split(/\\n/);
				for(let i = 0; i < paragraphs.length; i++){
					aboutHolder.push(<p key={i} style={{marginTop: "20px", whiteSpace: "pre-wrap"}} className="mr">{paragraphs[i].replace(/^\s+|\s+$/g, '')}</p>);
				}
			}
			else{
				aboutHolder.push(<p key="0" style={{marginTop: "20px", whiteSpace: "pre-wrap"}} className="mr">{about.replace(/^\s+|\s+$/g, '')}</p>);
			}
			if(isReceiver){
				aboutHolder.push(
					<div key={aboutHolder.length} title={"update the description for your cause"} style={{marginBottom: "20px"}}>
						<ButtonSmall text={"Edit Description"} callback={async() => await this.updateAbout(aboutString, address, picHash, title)}/>
					</div>)
			}
			return aboutHolder;
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
						{this.getName(item.name)}
						<div title="validator status" style={{display: "grid", gridTemplateColumns:"150px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Validator Status"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250px"}}>
								<p>{item.status}</p>
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
								<p>{"Applied"}</p>
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
							<p>{item.pubkey.slice(0, 6)+ "..."+item.pubkey.slice(-4)}</p>
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
								<p>{"Claim"}</p>
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
								<p>{item.balance}</p>
							</div>
						</div>
						<div title={"earned 1 day in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Day"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.performance1d}</p>
							</div>
						</div>
						<div title={"earned 7 days in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Week"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.performance7d}</p>
							</div>
						</div>

						<div title={"earned 31 days in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Month"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.performance31d}</p>
							</div>
						</div>

						<div title={"earned 365 days in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Year"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.performance365d}</p>
							</div>
						</div>
						<div title={"overall earned in ETH"} style={{display: "grid", gridTemplateColumns:"70px 1fr", marginTop:"-10px"}}>
							<div style={{gridColumn: 1}}>
								<p>{"Total"}</p>
							</div>
							<div style={{gridColumn: 2, width: "250"}}>
							<p>{item.performancetotal}</p>
							</div>
						</div>
						<div style={{marginRight: "auto"}}>
							{/*this.displayWithdraw()*/}
							{this.displayDepositApplyWithdraw(item)}
						</div>
					</div>
				</div>

			</div>
		return tokenInfo;
	}

	updateAbout = async(aboutString, address, picHash, title) => {
		await this.props.updateNewAbout('');
		console.log("update about clicked", this.props.newAbout);
		try{
			await this.props.updateNewAbout({about: aboutString, poolAddress: address, picHash: picHash, poolName: title});
		}
		catch (error) {
			console.error(error);
		}
	}

	getDepositAmountModal = () => {
		if(this.props.depositAmount){
			let modal = <Modal isOpen={true}><DepositModal depositInfo={this.props.depositAmount}/></Modal>
			return modal;
		}
	}

	deposit = async(poolAddress, tokenAddress) => {
		await this.props.updateDepositAmount('');
		console.log('deposit clicked', this.props.depositAmount);
		try{
			const tokenMap = this.props.tokenMap;
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			const activeAccount = this.props.activeAccount;
			const userBalance = await getBalance(tokenAddress, tokenMap[tokenString].decimals, tokenString, activeAccount);
			const contractInfo = await getContractInfo(poolAddress);
			await this.props.updateDepositAmount({tokenString: tokenString, tokenAddress: tokenAddress, userBalance: userBalance, poolAddress: poolAddress, contractInfo: contractInfo, activeAccount: activeAccount, amount: ''});
			//this.updatePoolInfo(this.props.depositAmount.poolAddress, this.props.depositAmount.activeAccount);
		}
		catch (error) {
			console.error(error);
		}
	}

	getWithdrawAmountModal = () => {
		if(this.props.withdrawAmount){
			let modal = <Modal isOpen={true}><WithdrawModal withdrawInfo={this.props.withdrawAmount}/></Modal>
			return modal;
		}
	}
	withdrawDeposit = async(poolAddress, tokenAddress, rawBalance) => {
		this.props.updateWithdrawAmount('');
		console.log('withdraw clicked');
		try{
			const tokenMap = this.props.tokenMap;
			const tokenString = Object.keys(tokenMap).find(key => tokenMap[key].address === tokenAddress);
			const activeAccount = this.props.activeAccount;
			const contractInfo = await getContractInfo(poolAddress);
			let formatBalance = precise(rawBalance, tokenMap[tokenString].decimals);
			if(rawBalance /10**tokenMap[tokenString].decimals < formatBalance){
				alert('withdraw amount issue');
			}
			await this.props.updateWithdrawAmount({tokenString: tokenString, tokenAddress: tokenAddress, formatBalance: formatBalance, rawBalance: rawBalance, poolAddress: poolAddress, contractInfo: contractInfo, activeAccount: activeAccount, amount: ''});
		}
		catch (error) {
			console.error(error);
		}
	}

	getClaimModal = () => {
		if(this.props.claim){
			let modal = <SmallModal isOpen={true}><ClaimModal claimInfo={this.props.claim}/></SmallModal>
			return modal;
		}
	}

	claim = async(poolAddress, tokenAddress, unclaimedInterest) => {
		await this.props.updateClaim('');
		console.log('claim interest clicked', poolAddress);
		try{
			const activeAccount = this.props.activeAccount;
			const tokenString = Object.keys(this.props.tokenMap).find(key => this.props.tokenMap[key].address === tokenAddress);
			const contractInfo = await getContractInfo(poolAddress);

			await this.props.updateClaim({tokenString: tokenString, tokenAddress: tokenAddress, poolAddress: poolAddress, contractInfo: contractInfo, activeAccount: activeAccount, unclaimedInterest: unclaimedInterest});

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
		this.props.updatePendingTx('');
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
	refresh = async(poolAddress) =>{
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
	}

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
						{"Validator " + validator.validatorindex}
					</p>

					<div className="card__header--right">
									<div className="card__open-button" onClick={this.toggleCardOpen}><Icon name={"plus"} size={32}/></div>
					</div>
				</div>
				{validatorInfo}
				<div className="card__bar"/>
				{this.getDepositAmountModal()}
				{this.getWithdrawAmountModal()}
				{this.getClaimModal()}
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
})

const mapDispatchToProps = dispatch => ({
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
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
})

export default connect(mapStateToProps, mapDispatchToProps)(Card)
