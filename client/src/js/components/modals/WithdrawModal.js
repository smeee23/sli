import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button, ButtonExtraSmall } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import Reserve from "../../../contracts/Reserve.json";

import { updatePendingTxList } from "../../actions/pendingTxList";
import { updateTxResult } from  "../../actions/txResult";
import { updateWithdrawAmount } from  "../../actions/withdrawAmount";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateDepositorValIds } from "../../actions/depositorValIds";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";
import { updateSliETHInfo } from "../../actions/sliETHInfo";

import {getDirectFromPoolInfo, getContractInfo, getSliStats, getBalances, convertWeiToETH } from '../../func/contractInteractions';
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
            const activeAccount = this.props.activeAccount;

            const amount = this.props.withdrawAmount.amount;
            this.props.updateWithdrawAmount('');
            const amountInBase = web3.utils.toWei(String(amount), "ether");
            const gasPrice = (await web3.eth.getGasPrice()).toString();

            const parameter = {
                from: activeAccount,
                gas: web3.utils.toHex(1500000),
                gasPrice: web3.utils.toHex(gasPrice)
            };

            let ReserveInstance = new web3.eth.Contract(
              Reserve.abi,
              this.props.reserveAddress.reserve,
            );
            txInfo = {txHash: '', success: false, amount: amount, tokenString: "sliETH", type:"WITHDRAW", poolName: "Unbond ETH", networkId: this.props.networkId};
            result = await ReserveInstance.methods.withdrawInsurance(amountInBase).send(parameter , async(err, transactionHash) => {
                console.log('Transaction Hash :', transactionHash);
                if(!err){
                  let info = {txHash: transactionHash, amount: amount, tokenString: "sliETH", type:"WITHDRAW", poolName: "Unbond ETH", networkId: this.props.networkId, status:"pending"};
						      let pending = [...this.props.pendingTxList];
                  if(!pending) pending = [];
                  pending.push(info);
						      await this.props.updatePendingTxList(pending);
                  localStorage.setItem("pendingTxList", JSON.stringify(pending));
                  txInfo.txHash = transactionHash;
                }
            });
            txInfo.success = true;

            const oldBalance = this.props.activeBalances.ethBalance;

            this.setSliETHInfo(await getSliStats(this.props.reserveAddress.reserve));

            const newBalance = (await getBalances(this.props.reserveAddress.reserve, this.props.activeAccount)).ethBalance;
            const diff = web3.utils.toBN(newBalance).sub(web3.utils.toBN(oldBalance)).toString();
            txInfo["balanceGain"] = await convertWeiToETH(diff);
            txInfo["gainToken"] = "ETH";
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

        console.log(this.props.sliETHInfo)
    }
	}

  displayWithdrawNotice = (name) => {

    return(
      <div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
        <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Your Deposit into the SLI Claims Fund is available to be withdrawn in full.</p>
        <p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Withdrawing will swap your sliETH for ETH at the current conversion rate. Withdrawn ETH will no longer earn rewards.</p>
        <p style={{alignItems:"center", justifyContent:"center", marginRight:"0%", marginTop: "8px", marginBottom: "0px"}}>Conversion: 1 sliETH = {this.props.sliETHInfo["sliConversion"]} ETH</p>
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

  getErrorMsg = () => {
    if(this.state.isValidInput === 'nan') return this.state.amount + " is not a number";
    else if(this.state.isValidInput === 'neg') return this.state.amount + " is a negative number";
    else if(this.state.isValidInput === 'bal') return this.state.amount + " exceeds your balance";
    else if(this.state.isValidInput === 'zero') return " amount cannot be zero";
  }

  getConvertedValue = (value) => {

    const rate = this.props.sliETHInfo["sliConversion"];

    console.log("CONVERSION ",typeof(rate), rate, typeof(value.getValue()), value.getValue())
    return rate;

  }
  getValue = (value) => {
    if(value){
      return this.getConvertedValue(value.getValue());
    }
    console.log(value)
  }

  render() {
        const { withdrawInfo } = this.props;

		return (
      <Fragment>
        <ModalHeader>
        <p style={{fontSize: 30}} className="mb0">Unbond ETH</p>
        </ModalHeader>
        <ModalCtas>
          {this.displayWithdrawNotice()}
          <div style={{marginLeft: "auto", marginTop:"auto", display:"flex", flexDirection: "column", alignItems:"flex-end", justifyContent:"left"}}>
            <div style={{display:"flex", fontSize: 9, flexDirection: "wrap", gap: "10px", alignItems:"right", justifyContent:"center"}}>
              <p>{displayLogo("ETH_WHITE")}{withdrawInfo.tokenString}: {withdrawInfo.userBalance}</p>
              <ButtonExtraSmall text="MAX" callback={() => this.refs.myField.replaceValue(withdrawInfo.userBalance)}/>

            </div>
            <div style={{marginLeft: "auto", marginTop:"auto"}}>
              <TextField ref="myField" label="amount to withdraw:" value={this.state.val} />
            </div>
            <div style={{display:"flex", fontSize: 9, flexDirection: "wrap", gap: "10px", alignItems:"right", justifyContent:"center"}}>
              <p>{this.getValue(this.refs.myField)}</p>
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
	  reserveAddress: state.reserveAddress,
    withdrawAmount: state.withdrawAmount,
    activeAccount: state.activeAccount,
    networkId: state.networkId,
    userDepositPoolInfo: state.userDepositPoolInfo,
    verifiedPoolInfo: state.verifiedPoolInfo,
    ownerPoolInfo: state.ownerPoolInfo,
    pendingTxList: state.pendingTxList,
    sliETHInfo: state.sliETHInfo,
    activeBalances: state.activeBalances,
})

const mapDispatchToProps = dispatch => ({
    updateWithdrawAmount: (amount) => dispatch(updateWithdrawAmount(amount)),
    updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
    updateTxResult: (res) => dispatch(updateTxResult(res)),
    updateDepositorValIds: (infoArray) => dispatch(updateDepositorValIds(infoArray)),
    updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
    updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
    updateSliETHInfo: (o) => dispatch(updateSliETHInfo(o)),
  })

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawModal)