import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button, ButtonExtraSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";

import { updatePendingTx } from "../../actions/pendingTx";
import { updatePendingTxList } from "../../actions/pendingTxList";
import { updateTxResult } from  "../../actions/txResult";
import { updateWithdrawAmount } from  "../../actions/withdrawAmount";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateVerifiedPoolInfo } from "../../actions/verifiedPoolInfo";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";

import {getDirectFromPoolInfo, getContractInfo} from '../../func/contractInteractions';
import {delay, getTokenBaseAmount, displayLogo, addNewPoolInfo, checkPoolInPoolInfo } from '../../func/ancillaryFunctions';

class WithdrawModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
            amount: 0,
            val: '0.0',
		}
	}

  setAmount = async(amount, withdrawInfo) => {
    /*if(!isNaN(amount)){
      if(Math.sign(amount) === 1){
        if(amount > withdrawInfo.balance){
          if(amount === 0){*/
            withdrawInfo.amount = amount;
            this.props.updateWithdrawAmount(withdrawInfo);
            await this.withdrawToChain();
          /*}
          else this.setState({isValidInput: 'zero', amount});
        }
        else this.setState({isValidInput: 'bal', amount});
      }
      else this.setState({isValidInput: 'neg', amount});
    }
    else this.setState({isValidInput: 'nan', amount});*/
  }

  withdrawToChain = async() => {
        let txInfo;
        let result;
        try{
            const web3 = await getWeb3();
            const tokenAddress = this.props.withdrawAmount.tokenAddress;
            const poolAddress = this.props.withdrawAmount.poolAddress;
            const tokenString = this.props.withdrawAmount.tokenString;
            const isETH = (tokenString === 'ETH' || tokenString === 'MATIC');
            const activeAccount = this.props.activeAccount;

            const amount = this.props.withdrawAmount.amount;
            this.props.updateWithdrawAmount('');
            const amountInBase = getTokenBaseAmount(amount, this.props.tokenMap[tokenString].decimals);
            const gasPrice = (await web3.eth.getGasPrice()).toString();

            const parameter = {
                from: activeAccount,
                gas: web3.utils.toHex(1500000),
                gasPrice: web3.utils.toHex(gasPrice)
            };

            let PoolTrackerInstance = new web3.eth.Contract(
                PoolTracker.abi,
                this.props.poolTrackerAddress,
            );
            const poolName = await getContractInfo(poolAddress);
            txInfo = {txHash: '', success: false, amount: amount, tokenString: tokenString, type:"WITHDRAW", poolAddress: poolAddress, poolName: poolName[6], networkId: this.props.networkId};
            result = await PoolTrackerInstance.methods.withdrawDeposit(amountInBase, tokenAddress, poolAddress, isETH).send(parameter , async(err, transactionHash) => {
                console.log('Transaction Hash :', transactionHash);
                if(!err){
                  let info = {txHash: transactionHash, amount: amount, tokenString: tokenString, type:"WITHDRAW", poolAddress: poolAddress, poolName: poolName[6], networkId: this.props.networkId, status:"pending"};
						      let pending = [...this.props.pendingTxList];
                  if(!pending) pending = [];
                  pending.push(info);
						      await this.props.updatePendingTxList(pending);
                  localStorage.setItem("pendingTxList", JSON.stringify(pending));
                  await this.props.updatePendingTx(info);
                  txInfo.txHash = transactionHash;
                }
                else{
                  txInfo = "";
                }
            });
            txInfo.success = true;

            const newInfo = await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress);
            const newDepositInfo = addNewPoolInfo([...this.props.userDepositPoolInfo], newInfo);
            await this.props.updateUserDepositPoolInfo(newDepositInfo);
            localStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));

            if(checkPoolInPoolInfo(poolAddress, this.props.ownerPoolInfo)){
              const newOwnerInfo = addNewPoolInfo([...this.props.ownerPoolInfo], newInfo);
              await this.props.updateOwnerPoolInfo(newOwnerInfo);
              localStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));
            }

            if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
              const newVerifiedInfo = addNewPoolInfo([...this.props.verifiedPoolInfo], newInfo);
              await this.props.updateVerifiedPoolInfo(newVerifiedInfo);
              localStorage.setItem("verifiedPoolInfo", JSON.stringify(newVerifiedInfo));
            }
		}
    catch (error) {
      console.error(error);
      txInfo = "";
    }

    if(txInfo){
      this.displayTxInfo(txInfo);
    }
	}

  displayWithdrawNotice = (name) => {

    return(
      <div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
        <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Your Deposit for {name} is available to be withdrawn in full. Any funds withdrawn will no longer be used to generate donations for {name}.</p>
        <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Thank you for donating and participating in JustCause!</p>
      </div>
    )

    }

  displayTxInfo = async(txInfo) => {
		this.props.updatePendingTx('');
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
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
          <h2 className="mb0">Withdraw {displayLogo(withdrawInfo.tokenString)} {withdrawInfo.tokenString} for {withdrawInfo.contractInfo[6]}</h2>
        </ModalHeader>
        <ModalCtas>
          {this.displayWithdrawNotice(withdrawInfo.contractInfo[6])}
          <div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
            <div style={{display:"flex", fontSize: 9, flexDirection: "wrap", gap: "10px", alignItems:"right", justifyContent:"center"}}>
              <p>{displayLogo(withdrawInfo.tokenString)}{withdrawInfo.tokenString}: {withdrawInfo.formatBalance}</p>
              <ButtonExtraSmall text="MAX" callback={() => this.refs.myField.replaceValue(withdrawInfo.formatBalance)}/>

            </div>
            <div style={{marginLeft: "auto", marginTop:"auto"}}>
              <TextField ref="myField" label="amount to withdraw:" value={this.state.val} />
            </div>
          </div>
          <div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"31px"}}>
            <Button style={{marginLeft: "auto", marginTop:"auto"}} text="Withdraw" callback={() => this.setAmount(this.refs.myField.getValue(), withdrawInfo)}/>
          </div>

        </ModalCtas>
      </Fragment>


		);
	}
}

const mapStateToProps = state => ({
    tokenMap: state.tokenMap,
	  poolTrackerAddress: state.poolTrackerAddress,
    withdrawAmount: state.withdrawAmount,
    activeAccount: state.activeAccount,
    networkId: state.networkId,
    userDepositPoolInfo: state.userDepositPoolInfo,
    verifiedPoolInfo: state.verifiedPoolInfo,
    ownerPoolInfo: state.ownerPoolInfo,
    pendingTxList: state.pendingTxList,
})

const mapDispatchToProps = dispatch => ({
    updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
    updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
    updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
    updateTxResult: (res) => dispatch(updateTxResult(res)),
    updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
    updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
    updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
})

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawModal)