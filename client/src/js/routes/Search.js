import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Card from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from "../components/Modal";
import PendingTxModal from "../components/modals/PendingTxModal";
import TxResultModal from "../components/modals/TxResultModal";
import DeployTxModal from "../components/modals/DeployTxModal";
import SearchModal from "../components/modals/SearchModal";

import { updateVerifiedPoolInfo } from "../actions/verifiedPoolInfo"
import { updateOwnerPoolInfo } from "../actions/ownerPoolInfo"
import { updateUserDepositPoolInfo } from "../actions/userDepositPoolInfo"
import {updateSearchInfo } from "../actions/searchInfo";

import { updatePoolInfo, getExternalPoolInfo } from '../func/contractInteractions';

class Search extends Component {

	constructor(props) {
		super(props);

		this.state = {
			openModal: false,
			linkAddress: '',
		}
	}

	componentDidMount = async () => {
		window.scrollTo(0,0);
	}

	componentDidUpdate = () => {
		console.log('component did update');
	}

	getTxResultModal = () => {
		if(this.props.txResult){
			let modal = <Modal isOpen={true}><TxResultModal txDetails={this.props.txResult}/></Modal>;

			if(this.props.txResult.success){
				let poolLists = updatePoolInfo(this.props.txResult.poolAddress);
				if(poolLists[0]) this.props.updateVerifiedPoolInfo(poolLists[0]);
				if(poolLists[1]) this.props.updateOwnerPoolInfo(poolLists[1]);
				if(poolLists[2]) this.props.updateUserDepositPoolInfo(poolLists[2]);
			}

			return modal;
		}
	}
	getPendingTxModal = () => {
		if(this.props.pendingTx){
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

	getExternalLink = async() => {
		//if(this.props.poolTrackerAddress && this.props.activeAccount && this.props.tokenMap && this.state.linkAddress){
		const info = await getExternalPoolInfo(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap, this.state.linkAddress);
		const results = this.createCardInfo(info);
		return results;
		//}
	}
	getSearchResults = () => {
			if(this.props.searchInfo && this.props.activeAccount !== "Connect"){
				//if(this.state.openModel === true) this.closeModal();
				const searchResults = this.createCardInfo(this.props.searchInfo)
				//this.props.updateSearchInfo('');
				return searchResults;
			}
			else if(this.props.activeAccount !== "Connect"){
				let modal = <Modal isOpen={true}><SearchModal linkAddress={this.state.linkAddress}/></Modal>;
				return modal;
			}
	}

	openModal = () => {
		if(this.props.searchInfo){
			this.setState({openModal: false});
			this.props.updateSearchInfo('');
		}
		else{
			window.location.reload(false);
		}
	}

	getSearchModal = () => {
		if((!this.props.searchInfo || this.state.openModal) && this.props.activeAccount !== "Connect"){
			let modal = <Modal isOpen={true}><SearchModal linkAddress={this.state.linkAddress}/></Modal>;
			return modal;
		}
	}
	createCardInfo = (poolInfo) => {
		if(poolInfo === "") return
		let cardHolder = [];
		for(let i = 0; i < poolInfo.length; i++){
			const item = poolInfo[i];
			cardHolder.push(
				<Card
					key={item.address}
					title={item.name}
					idx={i}
					receiver={item.receiver}
					address={item.address}
					acceptedTokenInfo={item.acceptedTokenInfo}
					about={item.about}
					picHash={item.picHash}
					isVerified={item.isVerified}
				/>
			);
		}
		return cardHolder;
	}

	render() {
		const linkAddress  = this.props.match.params.address;
		if(!this.state.linkAddress){
			if(linkAddress){
				this.setState({linkAddress});
			}
			else if(window.location.href.includes('?address=') && !this.state.linkAddress){
				let addr = window.location.href;
				addr = addr.substring(addr.length - 42);
				this.setState({linkAddress: addr});
			}
		}

		return (
			<Fragment>
				<article>
				<section className="page-section page-section--center horizontal-padding bw0">
					<Button text="Find Pool" icon="search" callback={() => this.openModal()}/>
				</section>
					<section className="page-section horizontal-padding bw0">
						{this.getPendingTxModal()}
						{this.getTxResultModal()}
						{this.getDeployTxModal()}
						{this.getSearchModal()}
						{this.getSearchResults()}
					</section>
				</article>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	activeAccount: state.activeAccount,
	tokenMap: state.tokenMap,
	ownerPoolAddrs: state.ownerPoolAddrs,
	ownerPoolInfo: state.ownerPoolInfo,
	poolTrackerAddress: state.poolTrackerAddress,
	pendingTx: state.pendingTx,
	txResult: state.txResult,
	deployTxResult: state.deployTxResult,
	searchInfo: state.searchInfo,
})

const mapDispatchToProps = dispatch => ({
	pdateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateSearchInfo: (info) => dispatch(updateSearchInfo(info)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Search)