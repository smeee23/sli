import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button } from '../Button'
import { ButtonExtraSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import Reserve from "../../../contracts/Reserve.json";
import ERC20Instance from "../../../contracts/IERC20.json";

import { updatePendingTxList } from "../../actions/pendingTxList";
import { updateTxResult } from  "../../actions/txResult";
import { updateDepositAmount } from  "../../actions/depositAmount";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateDepositorValIds } from "../../actions/depositorValIds";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";
import { updateSliETHInfo } from "../../actions/sliETHInfo";

import { getAllowance, addPoolToPoolInfo, getContractInfo, getDirectFromPoolInfo,  convertWeiToETH , getSliStats, getBalances} from '../../func/contractInteractions';
import { delay, getTokenBaseAmount, displayLogo, addNewPoolInfo, checkPoolInPoolInfo } from '../../func/ancillaryFunctions';

class DepositModal extends Component {

  	constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
			val: '0.0',
		}
	}

  setAmount = async(amount, depositInfo) => {
    /*if(!isNaN(amount)){
      if(Math.sign(amount) === 1){
        if(amount > depositInfo.balance){
          if(amount === 0){*/
            depositInfo.amount = amount;
            this.props.updateDepositAmount(depositInfo);
            await this.depositToChain();
          /*}
          else this.setState({isValidInput: 'zero', amount});
        }
        else this.setState({isValidInput: 'bal', amount});
      }
      else this.setState({isValidInput: 'neg', amount});
    }
    else this.setState({isValidInput: 'nan', amount});*/
  }

  depositToChain = async() => {
			let txInfo;
			let result;
			try{
				const web3 = await getWeb3();
				const tokenString = this.props.depositAmount.tokenString;
				const activeAccount = this.props.activeAccount;

				const amount = this.props.depositAmount.amount;
				this.props.updateDepositAmount('');

				//const amountInBase_test = getAmountBase(amount, this.props.tokenMap[tokenString].decimals);//web3.utils.toWei(amount, 'ether');
				const amountInBase = web3.utils.toWei(String(amount), "ether");
				const gasPrice = (await web3.eth.getGasPrice()).toString();

				let parameter = {};
				parameter = {
					from: activeAccount,
					gas: web3.utils.toHex(3000000),
					gasPrice: web3.utils.toHex(gasPrice),
					value: amountInBase
				};

				let ReserveInstance = new web3.eth.Contract(
					Reserve.abi,
					this.props.reserveAddress.reserve,
				);

				txInfo = {txHash: '', success: '', amount: amount, tokenString: tokenString, type:"DEPOSIT", poolName: "Bond ETH for sliETH", networkId: this.props.networkId};

				result = await ReserveInstance.methods.provideInsurance().send(parameter, async(err, transactionHash) => {
					console.log('Transaction Hash :', transactionHash);
					if(!err){
						let info = {txHash: transactionHash, amount: amount, tokenString: tokenString, type:"DEPOSIT", poolName: "Bond ETH for sliETH", networkId: this.props.networkId, status:"pending"};
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

				const oldBalance = this.props.activeBalances.sliETHBalance;

				this.setSliETHInfo(await getSliStats(this.props.reserveAddress.reserve));

				const newBalance = (await getBalances(this.props.reserveAddress.reserve, this.props.activeAccount)).sliETHBalance;

				const diff = web3.utils.toBN(newBalance).sub(web3.utils.toBN(oldBalance)).toString();
				txInfo["balanceGain"] = await convertWeiToETH(diff);
				txInfo["gainToken"] = "sliETH";
			}
			catch (error) {
				console.error(error);
				txInfo = "";
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

	displayDepositNotice = () => {
		return(
			<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
				<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Deposits receive sliETH based on the conversion rate. Each sliETH token represents a user's share of the total ETH deposited in the Claims Fund. These sliETH tokens are transferable and can be held or traded like any other ERC-20 token."}</p>
				<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"As the Claims Fund generates interest from validator premiums and bonded ETH, these rewards are distributed proportionally to sliETH holders."}</p>
				<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{"Users can withdraw their sliETH tokens and convert them back into ETH at any time. The conversion rate depends on the current value of ETH held in the Claims Fund and the total supply of sliETH tokens."}</p>
				<p style={{marginLeft:"2%", marginRight:"0%"}} >Conversion: 1 sliETH = {this.props.sliETHInfo["sliConversion"]} ETH</p>
			</div>
		)

	}

	setSliETHInfo = async(sliETHInfo) => {
		await this.props.updateSliETHInfo(sliETHInfo);
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
		return (
      <Fragment>
        <ModalHeader>
          <p style={{fontSize: 30}} className="mb0">Bond ETH</p>
        </ModalHeader>
        <ModalCtas>
			{this.displayDepositNotice()}
			<div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
				<div style={{display:"flex", fontSize: 9, flexDirection: "wrap", gap: "10px", alignItems:"right", justifyContent:"center"}}>
					<p>{displayLogo(depositInfo.tokenString)}{ depositInfo.userBalance} {depositInfo.tokenString}</p>
					<ButtonExtraSmall text="MAX" callback={() => this.refs.myField.replaceValue(depositInfo.userBalance)}/>

				</div>
				<div style={{marginLeft: "auto", marginTop:"auto"}}>
					<TextField ref="myField" label="amount to deposit:" onChange={this.handle} value={this.state.val} />
				</div>
			</div>
			<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"32px"}}>
          		<Button style={{marginLeft: "auto", marginTop:"auto"}} text="Deposit ETH" callback={() => this.setAmount(this.refs.myField.getValue(), depositInfo)}/>
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
	activeBalances: state.activeBalances,
})

const mapDispatchToProps = dispatch => ({
    updateDepositAmount: (amount) => dispatch(updateDepositAmount(amount)),
	updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateDepositorValIds: (infoArray) => dispatch(updateDepositorValIds(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
	updateSliETHInfo: (o) => dispatch(updateSliETHInfo(o)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DepositModal)