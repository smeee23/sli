import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import { Button } from '../Button'

import getWeb3 from "../../../getWeb3NotOnLoad";
import PoolTracker from "../../../contracts/PoolTracker.json";

import { updatePendingTx } from "../../actions/pendingTx";
import { updatePendingTxList } from "../../actions/pendingTxList";
import { updateTxResult } from  "../../actions/txResult";
import { updateClaim } from "../../actions/claim";
import { updateUserDepositPoolInfo } from "../../actions/userDepositPoolInfo";
import { updateVerifiedPoolInfo } from "../../actions/verifiedPoolInfo";
import { updateOwnerPoolInfo } from "../../actions/ownerPoolInfo";

import {delay, displayLogo, getFormatUSD, numberWithCommas, precise, checkPoolInPoolInfo, addNewPoolInfo} from '../../func/ancillaryFunctions';
import { getContractInfo, getDirectFromPoolInfo,  } from '../../func/contractInteractions';
class ClaimModal extends Component {

    claim = async() => {
			let txInfo;
			let result;
			try{
				const web3 = await getWeb3();
				const tokenAddress = this.props.claim.tokenAddress;
				const poolAddress = this.props.claim.poolAddress;
				const tokenString = this.props.claim.tokenString;
				const isETH = (tokenString === 'ETH' || tokenString === 'MATIC');
				const activeAccount = this.props.activeAccount;
				const gasPrice = (await web3.eth.getGasPrice()).toString();
                this.props.updateClaim('');

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
                txInfo = {txHash: '', success: '', amount: '', tokenString: tokenString, type:"CLAIM", poolAddress: poolAddress, poolName: poolName[6], networkId: this.props.networkId};
                result = await PoolTrackerInstance.methods.claimInterest(tokenAddress, poolAddress, isETH).send(parameter , async(err, transactionHash) => {
                    console.log('Transaction Hash :', transactionHash);
					if(!err){
						let info = {
							txHash: transactionHash,
							amount: '',
							tokenString: tokenString,
							type:"CLAIM",
							poolAddress: poolAddress,
							poolName: poolName[6],
							networkId: this.props.networkId,
							status:"pending"
						};
						let pending = [...this.props.pendingTxList];
						pending.push(info);
						console.log("pending_2", pending, this.props.pendingTxList);
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

				let newInfo;
				if(checkPoolInPoolInfo(poolAddress, this.props.userDepositPoolInfo)){
					newInfo = await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress);
					console.log("Gitcoin", newInfo);
					const newDepositInfo = addNewPoolInfo([...this.props.userDepositPoolInfo], newInfo);
					await this.props.updateUserDepositPoolInfo(newDepositInfo);
					localStorage.setItem("userDepositPoolInfo", JSON.stringify(newDepositInfo));
				}

				if(checkPoolInPoolInfo(poolAddress, this.props.ownerPoolInfo)){
					newInfo = newInfo ? newInfo : await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress);
					const newOwnerInfo = addNewPoolInfo([...this.props.ownerPoolInfo], newInfo);
					await this.props.updateOwnerPoolInfo(newOwnerInfo);
					localStorage.setItem("ownerPoolInfo", JSON.stringify(newOwnerInfo));
				}

				if(checkPoolInPoolInfo(poolAddress, this.props.verifiedPoolInfo)){
					newInfo = newInfo ? newInfo : await getDirectFromPoolInfo(poolAddress, this.props.tokenMap, this.props.activeAccount, tokenAddress);
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
			this.props.updateClaim('');
	}

  displayDepositNotice = (txInfo) => {
	const contractInfo = txInfo.contractInfo;
	const priceUSD = this.props.tokenMap[txInfo.tokenString] && this.props.tokenMap[txInfo.tokenString].priceUSD;
	const decimals = this.props.tokenMap[txInfo.tokenString] && this.props.tokenMap[txInfo.tokenString].decimals;

	return(
		<div style={{maxWidth: "300px", fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Calls made to the claim function will harvest donations already earned and send the amount to the receiver of {contractInfo[6]}.</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">Anyone can call this function and send already donated funds to {contractInfo[6]}.</p>
			<p style={{marginLeft:"2%", marginRight:"0%"}} className="mr">{displayLogo(txInfo.tokenString)} {txInfo.tokenString}: {numberWithCommas(precise(txInfo.unclaimedInterest, decimals)) +"  (" +getFormatUSD(precise(txInfo.unclaimedInterest, decimals), priceUSD)+")"}</p>
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
        const { claimInfo } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Harvest {displayLogo(claimInfo.tokenString)} {claimInfo.tokenString} for {claimInfo.contractInfo[6]}</h2>
        </ModalHeader>
        <ModalCtas>
			{this.displayDepositNotice(claimInfo)}
			<div style={{marginLeft: "auto", marginTop:"auto", paddingBottom:"25px"}}>
          		<Button style={{marginLeft: "auto", marginTop:"auto"}} text="Harvest Donations" callback={() => this.claim()}/>
		  	</div>
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  	tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
 	claim: state.claim,
	activeAccount: state.activeAccount,
	networkId: state.networkId,
	userDepositPoolInfo: state.userDepositPoolInfo,
    verifiedPoolInfo: state.verifiedPoolInfo,
    ownerPoolInfo: state.ownerPoolInfo,
	pendingTxList: state.pendingTxList,
})

const mapDispatchToProps = dispatch => ({
    updateClaim: (amount) => dispatch(updateClaim(amount)),
    updatePendingTx: (tx) => dispatch(updatePendingTx(tx)),
	updatePendingTxList: (tx) => dispatch(updatePendingTxList(tx)),
	updateTxResult: (res) => dispatch(updateTxResult(res)),
	updateVerifiedPoolInfo: (infoArray) => dispatch(updateVerifiedPoolInfo(infoArray)),
	updateUserDepositPoolInfo: (infoArray) => dispatch(updateUserDepositPoolInfo(infoArray)),
	updateOwnerPoolInfo: (infoArray) => dispatch(updateOwnerPoolInfo(infoArray)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ClaimModal)