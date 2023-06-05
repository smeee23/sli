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

import { getAllowance, addPoolToPoolInfo, getContractInfo, getDirectFromPoolInfo,  convertWeiToETH  } from '../../func/contractInteractions';
import { delay, getTokenBaseAmount, displayLogo, addNewPoolInfo, checkPoolInPoolInfo } from '../../func/ancillaryFunctions';

class DepositPremiumModal extends Component {

  	constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
			val: '0.0',
		}
	}

  setAmount = async(depositInfo) => {
    /*if(!isNaN(amount)){
      if(Math.sign(amount) === 1){
        if(amount > depositInfo.balance){
          if(amount === 0){*/
            this.props.updateDepositAmount(depositInfo);
            await this.depositToChain(depositInfo.premiumDeposit, depositInfo.validatorId);
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
				const tokenString = this.props.depositAmount.tokenString;
				const activeAccount = this.props.activeAccount;
				premiumDeposit = web3.utils.toWei(premiumDeposit, "ether");
				this.props.updateDepositAmount('');
				//const amountInBase_test = getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
				const gasPrice = (await web3.eth.getGasPrice()).toString();

				let parameter = {};
				parameter = {
					from: activeAccount,
					gas: web3.utils.toHex(3000000),
					gasPrice: web3.utils.toHex(gasPrice),
					value: premiumDeposit
				};

				let PremiumGeneratorAaveV2Instance = new web3.eth.Contract(
					PremiumGeneratorAaveV2.abi,
					this.props.reserveAddress.premiumGenerator,
				);

				txInfo = {txHash: '', success: '', amount: premiumDeposit, tokenString: tokenString, type:"PREMIUM_DEPOSIT", poolName: "Premium Deposit", networkId: this.props.networkId};

				result = await PremiumGeneratorAaveV2Instance.methods.deposit(validatorId).send(parameter, async(err, transactionHash) => {
					console.log('Transaction Hash :', transactionHash);
					if(!err){
						let info = {txHash: transactionHash, amount: premiumDeposit, tokenString: tokenString, type:"PREMIUM_DEPOSIT", poolName: "Premium Deposit", networkId: this.props.networkId, status:"pending"};
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

				/*let newInfo;
				let newDepositInfo;
				if(checkPoolInPoolInfo(poolAddress, this.props.userDepositPoolInfo)){
					newInfo = await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress);
					newDepositInfo = addNewPoolInfo([...this.props.userDepositPoolInfo], newInfo);
				}
				else{
					console.log("POOL NOT FOUND IN DEPOSITS, ADDING POOL");
					newDepositInfo = await addPoolToPoolInfo(poolAddress, this.props.activeAccount, this.props.reserveAddress.reserve, this.props.tokenMap, this.props.userDepositPoolInfo);
				}
				await this.props.updateUserDepositPoolInfo(newDepositInfo);
				localStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));

				if(checkPoolInPoolInfo(poolAddress, this.props.ownerPoolInfo)){
					newInfo = newInfo ? newInfo : await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress);
					const newOwnerInfo = addNewPoolInfo([...this.props.ownerPoolInfo], newInfo);
					await this.props.updateOwnerPoolInfo(newOwnerInfo);
					localStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));
				}

				if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
					newInfo = newInfo ? newInfo : await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress);
					const newVerifiedInfo = addNewPoolInfo([...this.props.verifiedPoolInfo], newInfo);
					await this.props.updateDepositorValIds(newVerifiedInfo);
					localStorage.setItem("verifiedPoolInfo", JSON.stringify(newVerifiedInfo));
				}*/
			}
			catch (error) {
				console.error(error);
				txInfo = "";
			}

			if(txInfo){
				this.displayTxInfo(txInfo);
			}
	}

  displayDepositNotice = (premiumDeposit) => {
	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Ethereum Validators can face slashing penalties for certain actions, such as double signing. Accidental slashing can occur due to technical issues or human error."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Slashing insurance can help validators protect themselves financially against such accidental slashing incidents."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Premiums are supplied to Aave lending pools to generate interest for slashing claims. The deposit is redeemable in full at any time, and coverage discontinued."}</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}}>{"Premium Depsot: "+premiumDeposit+" ETH"}</p>
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
        const { depositInfo } = this.props;

		console.log("depositInfo:", depositInfo)
		return (
      <Fragment>
        <ModalHeader>
          <p style={{fontSize: 30}} className="mb0">Deposit Premium for Coverage</p>
        </ModalHeader>
        <ModalCtas>
			{this.displayDepositNotice(depositInfo.premiumDeposit)}
			<div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
				<div style={{display:"flex", fontSize: 9, flexDirection: "wrap", gap: "10px", alignItems:"right", justifyContent:"center"}}>
					<p>{displayLogo(depositInfo.tokenString)}{ depositInfo.userBalance} {depositInfo.tokenString}</p>
				</div>
				<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"32px"}}>
					<Button style={{marginLeft: "auto", marginTop:"auto"}} text={"Deposit "+depositInfo.premiumDeposit+" ETH"} callback={() => this.setAmount(depositInfo)}/>
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

})

export default connect(mapStateToProps, mapDispatchToProps)(DepositPremiumModal)