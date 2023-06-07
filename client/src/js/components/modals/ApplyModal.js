import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBodyDeploy, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button, ButtonSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import Reserve from "../../../contracts/Reserve.json";

import { updateDepositAmount } from  "../../actions/depositAmount";
import {updateDeployInfo} from "../../actions/deployInfo";
import { updateDeployTxResult } from  "../../actions/deployTxResult";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";
import { updatePendingTxList } from "../../actions/pendingTxList";
import { updatePendingTx } from "../../actions/pendingTx";
import { updateTxResult } from  "../../actions/txResult";

import {upload} from '../../func/ipfs';

import { delay, displayLogo } from '../../func/ancillaryFunctions';

import { addTestnetValidator } from "../../func/validatorInfoFeed";

class ApplyModal extends Component {

	constructor(props) {
		super(props);
	}
	setAmount = async(validatorId) => {
		/*if(!isNaN(amount)){
		  if(Math.sign(amount) === 1){
			if(amount > depositInfo.balance){
			  if(amount === 0){*/
				this.props.updatePendingTx(validatorId);
				await this.apply(validatorId);
			  /*}
			  else this.setState({isValidInput: 'zero', amount});
			}
			else this.setState({isValidInput: 'bal', amount});
		  }
		  else this.setState({isValidInput: 'neg', amount});
		}
		else this.setState({isValidInput: 'nan', amount});*/
	  }
	apply = async(validatorId) => {
    let txInfo;
			let result;
			try{
				const web3 = await getWeb3();
				const activeAccount = this.props.activeAccount;

				this.props.updatePendingTx('');
				const addValMsg = await addTestnetValidator(validatorId, activeAccount);

				if(addValMsg === "OK"){
					const gasPrice = (await web3.eth.getGasPrice()).toString();

					let parameter = {};
					parameter = {
						from: activeAccount,
						gas: web3.utils.toHex(3000000),
						gasPrice: web3.utils.toHex(gasPrice)
					};

					let ReserveInstance = new web3.eth.Contract(
						Reserve.abi,
						this.props.reserveAddress.reserve,
					);

					txInfo = {txHash: '', success: '', type:"APPLY", poolName: "After Tx Await Oracle Response", networkId: this.props.networkId, validatorId: validatorId};

					result = await ReserveInstance.methods.applyForCoverage(validatorId).send(parameter, async(err, transactionHash) => {
						console.log('Transaction Hash :', transactionHash);
						if(!err){
							let info = {txHash: transactionHash, status:"pending", type:"APPLY", poolName: "After Tx Await Oracle Response", networkId: this.props.networkId, validatorId: validatorId};
							let pending = [...this.props.pendingTxList];
							pending.push(info);
							await this.props.updatePendingTxList(pending);
							localStorage.setItem("pendingTxList", JSON.stringify(pending));
							txInfo.txHash = transactionHash;

						}
					});
					txInfo.success = true;
				}
				else{
					const txInfo = {txHash: '', success: false, type:`${addValMsg}: APPLY`, poolName: "After Tx Await Oracle Response", networkId: this.props.networkId, validatorId: validatorId};
					this.displayTxInfo(txInfo);
				}

			}
			catch (error) {
				console.error(error);
			}
	}

	displayTxInfo = async(txInfo) => {
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}
  checkValues = () => {
	return false;
  }

  setValues = async() => {
	  /*let tokenInfo = tokens.state.selected;
	  for(let i = 0; i < tokens.state.selected.length; i++){
		tokenInfo[i] = tokenInfo[i].props.children;
	  }*/

	  const uploadResult = await upload(this.state.about);
	  const aboutHash = uploadResult.hash;
	  await this.deployOnChain(this.state.poolName, this.state.receiver, aboutHash, this.state.about, this.state.acceptedTokens);
  }

  handleClick = async(obj) => {

  }

  displayApplyNotice = () => {
	return(
		<div style={{width: "100%", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p >{"Slashing refers to the penalty imposed on Ethereum validators in proof-of-stake (PoS) for committing malicious or harmful actions, such as double signing. However, accidental slashing can occur due to technical issues or human error. Slashing insurance can help validators protect themselves by mitigating the financial risk associated with such penalties."}</p>
			<p style={{marginTop: "-10px"}}>{"The application process leverages Chainlink Oracles to verify:"}</p>
			<p style={{marginTop: "-10px"}}>{"1) The application and deposit transactions originate from the withdrawal address associated with the validator index."}</p>
			<p style={{marginTop: "-10px"}}>{"2) The validator associated with the index has not already been slashed."}</p>
			<p style={{marginTop: "-10px"}}>{"Once approved the deposit must occur within 48 hours, or the applicant will have to reapply."}</p>
			<p style={{marginTop: "-10px", color:'#2A5ADA'}}>{"*note for Chainlink hackathon, pick a validator index and if it does not already exist you will be automatically added and approved by the oracle"}</p>
		</div>
	)
  }
  getValidatorInput = (validatorId) => {
	if(!validatorId) return <TextField ref="id" label="Validator Index" id="poolName" placeholder="Provide the validator index number"/>
	return <TextField ref="id" label="Validator Index" id="poolName" value={validatorId}/>

  }
  render() {
    const { txDetails } = this.props
	console.log("valID", txDetails.validatorId, this.props)
		return (
			<Fragment>
				<ModalHeader>
				<p style={{fontSize: 30}} className="mb0">Apply for Coverage</p>
				</ModalHeader>
				<ModalCtas>
					<div style={{width: "100%", fontSize: 9, display:"flex", flexDirection: "column"}}>
						{this.displayApplyNotice()}
						<div style={{ display:"flex", flexDirection: "wrap", gap:"8px"}}>
							<div style={{width: "300px"}} className="modal__body__column__two">
								{this.getValidatorInput(txDetails.validatorId)}
							</div>
							<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"32px"}}>
								<Button style={{marginLeft: "auto", marginTop:"auto"}} text="Apply" callback={() => this.setAmount(this.refs.id.getValue())}/>
							</div>
						</div>
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
	ownerPoolInfo: state.ownerPoolInfo,
	pendingTxList: state.pendingTxList,
	reserveAddress: state.reserveAddress,
})

const mapDispatchToProps = dispatch => ({
  	updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
	updateDeployTxResult: (res) => dispatch(updateDeployTxResult(res)),
	updateDeployInfo: (res) => dispatch(updateDeployInfo(res)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
	updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ApplyModal)