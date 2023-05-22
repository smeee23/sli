import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import { Button } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import ERC20Instance from "../../../contracts/IERC20.json";

import { updatePendingTx } from "../../actions/pendingTx";
import { updateTxResult } from  "../../actions/txResult";
import { updateApprove } from "../../actions/approve";
import { updateTokenMap } from "../../actions/tokenMap"

import {delay, displayLogo} from '../../func/ancillaryFunctions';

class ApproveModal extends Component {

    approve = async() => {
			let txInfo;
			let result;
			try{

				const web3 = await getWeb3();
				const tokenAddress = this.props.approve.tokenAddress;
				const poolAddress = this.props.approve.poolAddress;
				const tokenString = this.props.approve.tokenString;

				const activeAccount = this.props.activeAccount;
				const gasPrice = (await web3.eth.getGasPrice()).toString();
                this.props.updateApprove('');

				const erc20Instance = await new web3.eth.Contract(ERC20Instance.abi, tokenAddress);
                const parameter = {
                    from: activeAccount ,
                    gas: web3.utils.toHex(1500000),
                    gasPrice: web3.utils.toHex(gasPrice)
                    };

                const amount = '10000000000000000000000000000000';
                txInfo = {txHash: '', success: '', amount: '', tokenString: tokenString, type:"APPROVE", poolAddress: poolAddress, networkId: this.props.networkId};
                result = await erc20Instance.methods.approve(this.props.poolTrackerAddress, amount).send(parameter, (err, transactionHash) => {
                    console.log('Transaction Hash :', transactionHash, err);
					if(!err){
						this.props.updatePendingTx({txHash: transactionHash, amount: '', tokenString: tokenString, type:"APPROVE", poolAddress: poolAddress, networkId: this.props.networkId});
						txInfo.txHash = transactionHash;
					}
					else{
						txInfo = "";
					}
                });
                txInfo.success = true;

                let tempTokenMap = this.props.tokenMap;
                tempTokenMap[tokenString]['allowance'] = true;
                this.props.updateTokenMap(tempTokenMap);
			}
			catch (error) {
				console.error(error);
				console.error("ERROR HIT");
				txInfo = "";
			}
			if(txInfo){
				this.displayTxInfo(txInfo);
			}
	}

  displayDepositNotice = (txInfo) => {

	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Approval allows your wallet to interact with the JustCause smart contracts.</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">It will need to be called only once per token.</p>
		</div>
	)

  }

  displayTxInfo = async(txInfo) => {
		this.props.updatePendingTx('');
		this.props.updateTxResult(txInfo);
		await delay(5000);
		this.props.updateTxResult('');
	}

  render() {
        const { approveInfo } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Approve {displayLogo(approveInfo.tokenString)} {approveInfo.tokenString}</h2>
        </ModalHeader>
        <ModalCtas>
			{this.displayDepositNotice(approveInfo)}
			<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"25px"}}>
          		<Button style={{marginLeft: "auto", marginTop:"auto"}} text="Approve" callback={() => this.approve()}/>
		  	</div>
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  	tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
 	approve: state.approve,
	activeAccount: state.activeAccount,
	networkId: state.networkId,
})

const mapDispatchToProps = dispatch => ({
    updateApprove: (amount) => dispatch(updateApprove(amount)),
    updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
    updateTokenMap: (res) => dispatch(updateTokenMap(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ApproveModal)