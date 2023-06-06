import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button } from '../Button'
import { ButtonExtraSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import Reserve from "../../../contracts/Reserve.json";
import PremiumGeneratorAaveV2 from "../../../contracts/PremiumGeneratorAaveV2.json";

import { updatePendingTxList } from "../../actions/pendingTxList";
import { updateTxResult } from  "../../actions/txResult";
import { updateDepositAmount } from  "../../actions/depositAmount";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateDepositorValIds } from "../../actions/depositorValIds";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";
import { updateClaim } from "../../actions/claim";

import { getAllowance, addPoolToPoolInfo, getContractInfo, getDirectFromPoolInfo,  convertWeiToETH  } from '../../func/contractInteractions';
import { delay, getTokenBaseAmount, displayLogo, addNewPoolInfo, checkPoolInPoolInfo } from '../../func/ancillaryFunctions';

class ClaimModal extends Component {

  	constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
			val: '0.0',
		}
	}

  setAmount = async(claimInfo) => {
            this.props.updateClaim(claimInfo);
            await this.submitClaim(claimInfo.validatorId);
  }

  submitClaim = async(validatorId) => {
			let txInfo;
			let result;
			try{
				const web3 = await getWeb3();
				const activeAccount = this.props.activeAccount;
				this.props.updateClaim('');
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

				txInfo = {txHash: '', success: '', tokenString: "ETH", type:"CLAIM", poolName: "After Tx Await Oracle Response", networkId: this.props.networkId};

				result = await ReserveInstance.methods.makeClaim(validatorId).send(parameter, async(err, transactionHash) => {
					console.log('Transaction Hash :', transactionHash);
					if(!err){
						let info = {txHash: transactionHash, tokenString: "ETH", type:"CLAIM", poolName: "After Tx Await Oracle Response", networkId: this.props.networkId, status:"pending"};
						let pending = [...this.props.pendingTxList];
						pending.push(info);
						await this.props.updatePendingTxList(pending);
						localStorage.setItem("pendingTxList", JSON.stringify(pending));
						txInfo.txHash = transactionHash;

					}
					else{
						txInfo = "";
					}
				});
				txInfo.success = true;

				let pending = [...this.props.pendingTxList];
				pending.forEach((e, i) =>{
					if(e.txHash === txInfo.transactionHash){
						e.status = "complete"
					}
				});
				await this.props.updatePendingTxList(pending);
				localStorage.setItem("pendingTxList", JSON.stringify(pending));

				pending = (pending).filter(e => !(e.txHash === txInfo.transactionHash));
				await this.props.updatePendingTxList(pending);
			}
			catch (error) {
				console.error(error);
				txInfo = "";
			}
	}

  displayClaimNotice = (loss) => {
	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"We have identified a slashing event involving this validator. Although this may not be favorable news, our records indicate that you have enrolled in Ethereum Slashing Insurance (SLI)."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Slashing insurance can help validators protect themselves financially against accidental slashing incidents."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Note: There is a two-week waiting period after your claim is approved in order to rule out malicious slashing activity for the validator in question."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Estimated Slashing Loss: "+loss+ " ETH"}</p>
		</div>
	)

  }

  displayTxInfo = async(txInfo) => {
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

  render() {
        const { claimInfo } = this.props;

		console.log("claim:", claimInfo, this.props)
		return (
      <Fragment>
        <ModalHeader>
          <p style={{fontSize: 30}} className="mb0">Claim Submission</p>
        </ModalHeader>
        <ModalCtas>
			{this.displayClaimNotice(claimInfo.loss)}
			<div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
				<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"32px"}}>
					<Button style={{marginLeft: "auto", marginTop:"auto"}} text={"Submit Claim"} callback={() => this.setAmount(claimInfo)}/>
				</div>
			</div>
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  	tokenMap: state.tokenMap,
	reserveAddress: state.reserveAddress,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
 	depositAmount: state.depositAmount,
	activeAccount: state.activeAccount,
	userDepositPoolInfo: state.userDepositPoolInfo,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolInfo: state.ownerPoolInfo,
	networkId: state.networkId,
	pendingTxList: state.pendingTxList,
	sliETHInfo: state.sliETHInfo,
})

const mapDispatchToProps = dispatch => ({
    updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
	updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateDepositorValIds: (infoArray) => dispatch(updateDepositorValIds(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
    updateClaim: (txInfo) => dispatch(updateClaim(txInfo)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ClaimModal)