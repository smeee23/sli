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
import { updateWithdrawAmount } from  "../../actions/withdrawAmount";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateDepositorValIds } from "../../actions/depositorValIds";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";

import { getAllowance, addPoolToPoolInfo, getContractInfo, getNewDepositorValidatorIds,  convertWeiToETH  } from '../../func/contractInteractions';
import { delay, getTokenBaseAmount, displayLogo, addNewPoolInfo, checkPoolInPoolInfo } from '../../func/ancillaryFunctions';

class WithdrawPremiumModal extends Component {

  	constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
			val: '0.0',
		}
	}

  setAmount = async(withdrawInfo) => {
    /*if(!isNaN(amount)){
      if(Math.sign(amount) === 1){
        if(amount > withdrawInfo.balance){
          if(amount === 0){*/
            this.props.updateWithdrawAmount(withdrawInfo);
            await this.depositToChain(withdrawInfo.premiumDeposit, withdrawInfo.validatorId);
          /*}
          else this.setState({isValidInput: 'zero', amount});
        }
        else this.setState({isValidInput: 'bal', amount});
      }
      else this.setState({isValidInput: 'neg', amount});
    }
    else this.setState({isValidInput: 'nan', amount});*/
  }

  depositToChain = async(premiumDeposit, validatorId) => {
			let txInfo;
			let result;
			try{
				const web3 = await getWeb3();
				const tokenString = this.props.withdrawAmount.tokenString;
				const activeAccount = this.props.activeAccount;
				premiumDeposit = web3.utils.toWei(premiumDeposit, "ether");
				this.props.updateWithdrawAmount('');
				//const amountInBase_test = getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
				const gasPrice = (await web3.eth.getGasPrice()).toString();

				let parameter = {};
				parameter = {
					from: activeAccount,
					gas: web3.utils.toHex(3000000),
					gasPrice: web3.utils.toHex(gasPrice),
				};

				let PremiumGeneratorAaveV2Instance = new web3.eth.Contract(
					PremiumGeneratorAaveV2.abi,
					this.props.reserveAddress.premiumGenerator,
				);

				const premiumDepositInETH = await convertWeiToETH(premiumDeposit);
				txInfo = {txHash: '', success: '', amount: premiumDepositInETH, tokenString: tokenString, type:"PREMIUM_WITHDRAW", poolName: "Premium Deposit", networkId: this.props.networkId};

				result = await PremiumGeneratorAaveV2Instance.methods.withdraw(validatorId).send(parameter, async(err, transactionHash) => {
					console.log('Transaction Hash :', transactionHash);
					if(!err){
						let info = {txHash: transactionHash, amount: premiumDepositInETH, tokenString: tokenString, type:"PREMIUM_WITHDRAW", poolName: "Premium Deposit", networkId: this.props.networkId, status:"pending"};
						let pending = [...this.props.pendingTxList];
						pending.push(info);
						await this.props.updatePendingTxList(pending);
						localStorage.setItem("pendingTxList", JSON.stringify(pending));
						txInfo.txHash = transactionHash;

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
			}

			if(txInfo){
				this.displayTxInfo(txInfo);

				let pending = [...this.props.pendingTxList];
				pending.forEach((e, i) =>{
					if(e.txHash === txInfo.transactionHash){
						e.status = "complete"
					}
				});

				await this.props.updatePendingTxList(pending);
				localStorage.setItem("pendingTxList", JSON.stringify(pending));

				await delay(2000);
				pending = (pending).filter(e => !(e.txHash === txInfo.transactionHash));
				await this.props.updatePendingTxList(pending);
				localStorage.setItem("pendingTxList", JSON.stringify(pending));
			}
	}

  displayDepositNotice = (premiumDeposit) => {
	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Ethereum Validators can face slashing penalties for certain actions, such as double signing. Accidental slashing can occur due to technical issues or human error."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Slashing insurance can help validators protect themselves financially against such accidental slashing incidents."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Premiums are supplied to Aave lending pools to generate interest for slashing claims. The deposit is redeemable in full at any time, and coverage discontinued."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} >{"Premium Depsot: "+premiumDeposit}</p>
			<p style={{marginLeft:"2%", marginRight:"0%", color:'#2A5ADA'}}>{"*note for Mumbai testnet, due to liquidity issues on testnet with the native token (MATIC) withdrawals through Aave can fail intermittently"}</p>
      </div>
	)

  }

  displayTxInfo = async(txInfo) => {
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

	getTextField = (userBalance) => {
		let tf = <TextField ref="myField" label="amount to deposit:" value={this.state.val} />;
		return tf;
	}

	setInputValue = (userBalance) => {
		this.setState({ val : userBalance});
	}

  getErrorMsg = () => {
    if(this.state.isValidInput === 'nan') return this.state.amount + " is not a number";
    else if(this.state.isValidInput === 'neg') return this.state.amount + " is a negative number";
    else if(this.state.isValidInput === 'bal') return this.state.amount + " exceeds your balance";
    else if(this.state.isValidInput === 'zero') return " amount cannot be zero";
  }


  render() {
        const { withdrawInfo } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <p style={{fontSize: 30}} className="mb0">Withdraw Premium to Discontinue Coverage</p>
        </ModalHeader>
        <ModalCtas>
			{this.displayDepositNotice(withdrawInfo.premiumDeposit)}
			<div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
				<div style={{display:"flex", fontSize: 9, flexDirection: "wrap", gap: "10px", alignItems:"right", justifyContent:"center"}}>
					<p>{displayLogo(withdrawInfo.tokenString)}{ withdrawInfo.userBalance} {withdrawInfo.tokenString}</p>
				</div>
				<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"32px"}}>
					<Button style={{marginLeft: "auto", marginTop:"auto"}} text={"Withdraw "+withdrawInfo.premiumDeposit+" ETH"} callback={() => this.setAmount(withdrawInfo)}/>
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
 	withdrawAmount: state.withdrawAmount,
	activeAccount: state.activeAccount,
	userDepositPoolInfo: state.userDepositPoolInfo,
	verifiedPoolInfo: state.verifiedPoolInfo,
	ownerPoolInfo: state.ownerPoolInfo,
	networkId: state.networkId,
	pendingTxList: state.pendingTxList,
	sliETHInfo: state.sliETHInfo,
	depositorValIds: state.depositorValIds,
})

const mapDispatchToProps = dispatch => ({
    updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
	updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateDepositorValIds: (infoArray) => dispatch(updateDepositorValIds(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),

})

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawPremiumModal)