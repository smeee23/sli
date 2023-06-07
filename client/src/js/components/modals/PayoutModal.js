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

import { getAllowance, addPoolToPoolInfo, getContractInfo, getDirectFromPoolInfo,  convertWeiToETH, getNewDepositorValidatorIds } from '../../func/contractInteractions';
import { delay, getTokenBaseAmount, displayLogo, addNewPoolInfo, checkPoolInPoolInfo } from '../../func/ancillaryFunctions';

class PayoutModal extends Component {

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
            await this.payout(claimInfo.validatorId);
  }

  payout = async(validatorId) => {
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

				txInfo = {txHash: '', success: '', tokenString: "ETH", type:"CLAIM PAYOUT", poolName: "Payment of Slashing Insurance Claim", networkId: this.props.networkId};

				result = await ReserveInstance.methods.payClaim(validatorId).send(parameter, async(err, transactionHash) => {
					console.log('Transaction Hash :', transactionHash);
					if(!err){
						let info = {txHash: transactionHash, tokenString: "ETH", type:"CLAIM PAYOUT", poolName: "Payment of Slashing Insurance Claim", networkId: this.props.networkId, status:"pending"};
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

				let valIds = await getNewDepositorValidatorIds(
					this.props.reserveAddress.reserve,
					validatorId,
					[...this.props.depositorValIds]
				);
				await this.props.updateDepositorValIds(valIds);
			}
			catch (error) {
				console.error(error);
				txInfo = "";
			}

            if(txInfo){
				this.displayTxInfo(txInfo);
			}
	}

  displayClaimNotice = (loss, premiumDeposit) => {
	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"While it is unfortunate that your validator was slashed, fortunately, your validator is covered under SLI."}</p>
            <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Your Payment will consist of the following amounts:"}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Slashing Loss: "+loss+ " ETH"}</p>
            <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Premium Deposit: "+premiumDeposit+ " ETH"}</p>
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
          <p style={{fontSize: 30}} className="mb0">Receive Claim Payout</p>
        </ModalHeader>
        <ModalCtas>
			{this.displayClaimNotice(claimInfo.loss, claimInfo.premiumDeposit)}
			<div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
				<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"32px"}}>
					<Button style={{marginLeft: "auto", marginTop:"auto"}} text={"Receive Payout"} callback={() => this.setAmount(claimInfo)}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(PayoutModal)