import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBody, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button, ButtonSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import JCPool from "../../../contracts/JustCausePool.json";

import { updateDepositAmount } from  "../../actions/depositAmount";
import {updateNewAbout} from "../../actions/newAbout";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateVerifiedPoolInfo } from "../../actions/verifiedPoolInfo";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";


import {upload} from '../../func/ipfs';

import { delay, addNewPoolInfoAboutOnly, checkPoolInPoolInfo } from '../../func/ancillaryFunctions';
import {getDirectAboutOnly } from '../../func/contractInteractions';
import { updatePendingTx } from "../../actions/pendingTx";
import { updateTxResult } from  "../../actions/txResult";

class UpdateAboutModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			fileUploadHash:"",
			replace: false,
			about: "",
			updateNFT: false,
			inputError: "",
			processing: false,
		}
	}

  updateMetaUriOnChain = async(poolName, aboutText, picHash, poolAddress) => {
	let result;
	let txInfo;
	try{

		const nftResult = await this.uploadNftMetaData(poolName, aboutText, picHash);
		const metaUri = 'https://ipfs.io/ipfs/'+nftResult.hash;

		const web3 = await getWeb3();
		const activeAccount = this.props.activeAccount;

		const gasPrice = (await web3.eth.getGasPrice()).toString();

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1200000),
			gasPrice: web3.utils.toHex(gasPrice)
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		txInfo = {txHash: '', status: '', success: '', type:"SET DESCRIPTION", poolAddress: poolAddress, poolName: poolName, networkId: this.props.networkId};

		result = await JCPoolInstance.methods.setMetaUri(metaUri).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			if(!err){
				txInfo.txHash = transactionHash;
				txInfo.status = 'pending';
				this.props.updatePendingTx(txInfo);
			}
			else{
				txInfo = "";
			}
		});

		txInfo.status = 'success';

		const newAbout = await getDirectAboutOnly(poolAddress);

		if(newAbout){
			const newOwnerInfo = addNewPoolInfoAboutOnly([...this.props.ownerPoolInfo], newAbout);
			await this.props.updateOwnerPoolInfo(newOwnerInfo);
			localStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));

			if(checkPoolInPoolInfo(poolAddress, this.props.userDepositPoolInfo)){
				const newDepositInfo = addNewPoolInfoAboutOnly([...this.props.userDepositPoolInfo], newAbout);
				await this.props.updateUserDepositPoolInfo(newDepositInfo);
				localStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));
			}

			if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
				const newVerifiedInfo = addNewPoolInfoAboutOnly([...this.props.verifiedPoolInfo], newAbout);
				await this.props.updateVerifiedPoolInfo(newVerifiedInfo);
				localStorage.setItem("verifiedPoolInfo", JSON.stringify(newVerifiedInfo));
			}
		}
	}
	catch (error) {
		console.error(error);
		txInfo = "";
	}

	this.props.updatePendingTx('');
  }

  updateAboutOnChainWithNFT = async(poolName, aboutHash, poolAddress) => {
	let txInfo;
	try{

		const web3 = await getWeb3();
		const activeAccount = this.props.activeAccount;

		const gasPrice = (await web3.eth.getGasPrice()).toString();

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1200000),
			gasPrice: web3.utils.toHex(gasPrice)
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		txInfo = {txHash: [], status: '', success: '', type:"SET DESCRIPTION", poolAddress: poolAddress, poolName: poolName, networkId: this.props.networkId};

		JCPoolInstance.methods.setAbout(aboutHash).send(parameter);

	}
	catch (error) {
		console.error(error);
		txInfo = "";
	}

  }

  updateAboutOnChain = async(poolName, aboutHash, poolAddress) => {
	let result;
	let txInfo;
	try{

		const web3 = await getWeb3();
		const activeAccount = this.props.activeAccount;

		const gasPrice = (await web3.eth.getGasPrice()).toString();

		const parameter = {
			from: activeAccount,
			gas: web3.utils.toHex(1200000),
			gasPrice: web3.utils.toHex(gasPrice)
		};

		let JCPoolInstance = new web3.eth.Contract(
			JCPool.abi,
			poolAddress,
		);

		txInfo = {txHash: '', status: '', success: '', type:"SET DESCRIPTION", poolAddress: poolAddress, poolName: poolName, networkId: this.props.networkId};

		result = await JCPoolInstance.methods.setAbout(aboutHash).send(parameter , (err, transactionHash) => {
			console.log('Transaction Hash :', transactionHash);
			if(!err){
				txInfo.txHash = transactionHash;
				txInfo.status = 'pending';
				this.props.updatePendingTx(txInfo);
			}
			else{
				txInfo = "";
			}
		});

		txInfo.status = 'success';

		const newAbout = await getDirectAboutOnly(poolAddress);

		if(newAbout){
			const newOwnerInfo = addNewPoolInfoAboutOnly([...this.props.ownerPoolInfo], newAbout);
			await this.props.updateOwnerPoolInfo(newOwnerInfo);
			localStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));

			if(checkPoolInPoolInfo(poolAddress, this.props.userDepositPoolInfo)){
				const newDepositInfo = addNewPoolInfoAboutOnly([...this.props.userDepositPoolInfo], newAbout);
				await this.props.updateUserDepositPoolInfo(newDepositInfo);
				localStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));
			}

			if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
				const newVerifiedInfo = addNewPoolInfoAboutOnly([...this.props.verifiedPoolInfo], newAbout);
				await this.props.updateVerifiedPoolInfo(newVerifiedInfo);
				localStorage.setItem("verifiedPoolInfo", JSON.stringify(newVerifiedInfo));
			}
		}

	}
	catch (error) {
		console.error(error);
		txInfo = "";
	}

	this.props.updatePendingTx('');
  }

  displayTxInfo = async(txInfo) => {
	this.props.updatePendingTx('');
	this.props.updateTxResult(txInfo);
	await delay(5000);
	this.props.updateTxResult('');
  }

  checkValues = () => {
	return false;
  }

  setAbout = async(poolName, aboutText, picHash, poolAddress) => {
	  const uploadResult = await upload(aboutText);
	  const aboutHash = uploadResult.hash;
	  this.props.updateNewAbout("");
	  if(this.state.updateNFT){
		await this.updateAboutOnChainWithNFT(poolName, aboutHash, poolAddress);
	  	await this.updateMetaUriOnChain(poolName, aboutText, picHash, poolAddress)
	  }
	  else{
		await this.updateAboutOnChain(poolName, aboutHash, poolAddress);
	  }
  }

  uploadNftMetaData = async(poolName, aboutText, picHash) => {
    let uri = {
        "name": poolName,
        "description": aboutText,
        "image": "https://ipfs.io/ipfs/"+picHash,
    }

    const buf = Buffer.from(JSON.stringify(uri)); // Convert data into buffer
	const uploadResult = await upload(buf);
	return uploadResult;
}

  handleClick = async(obj) => {

	this.setState({processing: true});

	let about = obj.newAbout;
	if(!this.state.replace){
		about = obj.prevAbout + " " + about;
	}
	this.setAbout(obj.poolName, about, obj.picHash, obj.poolAddress);

  }

  updateNFT = () => {
	const updateNFT = !this.state.updateNFT
	this.setState({
		updateNFT
	});
	console.log(this.state.updateNFT);
  }

  getUpdateNft = () => {
	if(this.state.updateNFT){
		return(
			<ButtonSmall text={"Update NFT Description"}
				disabled={this.checkValues()}
				callback={() => this.updateNFT()}
				icon={"check"}
			/>);
	}
	return(
		<ButtonSmall text={"Update NFT Description"}
			disabled={this.checkValues()}
			callback={() => this.updateNFT()}
		/>);

  }

  updateReplace = () => {
	const replace = !this.state.replace
	this.setState({
		replace
	});
	console.log(this.state.replace);
  }

  getReplace = () => {
	if(this.state.replace){
		return(
			<ButtonSmall text={"Replace Description"}
				disabled={this.checkValues()}
				icon={"check"}
				callback={() => this.updateReplace()}
			/>);
	}
	return(
		<ButtonSmall text={"Replace Description"}
				disabled={this.checkValues()}
				callback={() => this.updateReplace()}
		/>);

  }

  getChangeButton = (newAboutInfo) => {
	if(!this.state.processing){
		return(
			<Button text={"Change Description"}
				icon={"plus"}
				callback={() => this.handleClick({poolName: newAboutInfo.poolName, picHash: newAboutInfo.picHash, poolAddress: newAboutInfo.poolAddress, prevAbout: newAboutInfo.about, newAbout: this.refs.about.getValue()})}
			/>);
	}
	return(<Button text={"Processing..."}
				disabled={true}
				icon={"check"}
				callback={() => this.handleClick({poolName: newAboutInfo.poolName, picHash: newAboutInfo.picHash, poolAddress: newAboutInfo.poolAddress, prevAbout: newAboutInfo.about, newAbout: this.refs.about.getValue()})}
			/>);
  }

  getAbout = (about) => {
    console.log("size", about.length);
    /*if(about.length > 1000){
        about = about.slice(0, 999)+"...";
    }*/
	let custStyle = {marginLeft: "5px", fontStyle: "italic", marginTop: "20px", whiteSpace: "pre-wrap"};
	let aboutHolder = [];
	//let regex = /^Update#[0-9]+$/;
	if(about.includes("\\n")){
		const paragraphs = about.split(/\\n/);
		for(let i = 0; i < paragraphs.length; i++){
			aboutHolder.push(<p key={i} style={custStyle} className="mr">{paragraphs[i].replace(/^\s+|\s+$/g, '')}</p>);
		}
	}
	else{
		aboutHolder.push(<p key="0" style={custStyle} className="mr">{about.replace(/^\s+|\s+$/g, '')}</p>);
	}
    return aboutHolder;
  }

  render() {
    const { newAboutInfo } = this.props;
		return (
			<Fragment>
				<ModalHeader>
					<h2 className="mb0">Update Your Cause Description</h2>
				</ModalHeader>
				<ModalBody>
					<div style={{marginTop:"-16px", display: "flex", flexDirection: "column", width:"100%"}}>
						<p style={{marginBottom:"32px"}} className="mr">Updating or replacing your description requires a transaction on Polygon and an update to your Pool's smart contract.</p>
						<h2 style={{fontSize:17}} className="mb0">Current Description:</h2>
						{this.getAbout(newAboutInfo.about)}
						<h2 style={{marginBottom: "8px", fontSize:17, marginTop:"32px"}} className="mr">Give an update or replace with a new description:</h2>
						<TextField ref="about" label="Pool Description" placeholder="Provide an update or replace your description"/>
					</div>
				</ModalBody>
				<ModalCtas>
					<div style={{marginRight:"auto", display:"column"}}>
						<h2 style={{fontSize:17, marginTop:"16px" }} className="mb0">Optional Selections:</h2>
						<div style={{marginRight:"auto", marginTop:"16px", display:"flex"}}>
							<div style={{maxWidth: "400px"}}>
								<p className="mr">Select this option to update the about section of the NFT your contributors recieve. Only future contributor's NFTs will have the updated description. If this option is selected two transactions are required.</p>
							</div>
							{this.getUpdateNft()}
						</div>
						<div style={{marginRight:"auto", display:"flex"}}>
							<div style={{maxWidth: "400px"}}>
								<p className="mr">Select this option to REPLACE the description section instead of adding an update. This will erase the original description.</p>
							</div>
							{this.getReplace()}
						</div>
					</div>
				</ModalCtas>
				<ModalCtas>
					<div style={{marginLeft:"auto", display:"flex", marginTop:"16px"}}>
						{this.getChangeButton(newAboutInfo)}
					</div>
				</ModalCtas>
			</Fragment>
			);
		}
}

const mapStateToProps = state => ({
  	tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
 	depositAmount: state.depositAmount,
	activeAccount: state.activeAccount,
	networkId: state.networkId,
	userDepositPoolInfo: state.userDepositPoolInfo,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolInfo: state.ownerPoolInfo,
})

const mapDispatchToProps = dispatch => ({
  	updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
	updateNewAbout: (about) => dispatch(updateNewAbout(about)),
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
})

export default connect(mapStateToProps, mapDispatchToProps)(UpdateAboutModal)