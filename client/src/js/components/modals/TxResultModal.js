import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalBodyTx} from "../Modal";

import DaiLogo from "../cryptoLogos/DaiLogo";
import WbtcLogo from "../cryptoLogos/WbtcLogo";
import UsdcLogo from "../cryptoLogos/UsdcLogo";
import TetherLogo from "../cryptoLogos/TetherLogo";
import EthLogo from "../cryptoLogos/EthLogo";
import AaveLogo from "../cryptoLogos/AaveLogo";
import MaticLogo from "../cryptoLogos/MaticLogo";
import WEthLogo from "../cryptoLogos/WEthLogo";
import LinkLogo from "../cryptoLogos/LinkLogo";
import DpiLogo from "../cryptoLogos/DpiLogo";
import Logo from "../Logo"
import { Button } from '../Button';

import { updateShare } from  "../../actions/share";

import { redirectWindowBlockExplorer } from '../../func/ancillaryFunctions';
import { getContractInfo } from '../../func/contractInteractions';

class TxResultModal extends Component {

  successOrFail = (success) => {
    if(success) return "SUCCESS"
    return 'FAILED'
  }

  displayLogo = (acceptedTokenString) => {
    let logo = '';
    if(acceptedTokenString === 'ETH'){
      logo = <EthLogo/>;
    }
    else if (acceptedTokenString === 'USDT'){
      logo = <TetherLogo/>;
    }
    else if (acceptedTokenString === 'USDC'){
      logo = <UsdcLogo/>;
    }
    else if (acceptedTokenString === 'WBTC'){
      logo = <WbtcLogo/>;
    }
    else if (acceptedTokenString === 'DAI'){
      logo = <DaiLogo/>;
    }
    else if (acceptedTokenString === 'AAVE'){
      logo = <AaveLogo/>;
    }
    else if(acceptedTokenString === 'WETH'){
      logo = <WEthLogo/>;
    }
    else if(acceptedTokenString === 'MATIC'){
      logo = <MaticLogo/>;
    }
    else if(acceptedTokenString === 'LINK'){
      logo = <LinkLogo/>;
    }
    else if(acceptedTokenString === 'DPI'){
      logo = <DpiLogo/>;
    }
    else{
      logo = <Logo/>
    }

    return logo;
  }

  getContractInfo = async(address) => {
    return await getContractInfo(address);
  };

  share = async(poolAddress, name, txDetails) => {
		await this.props.updateShare("");
		await this.props.updateShare({poolAddress: poolAddress, name: name, txDetails: txDetails});
	}

  getShareButton = (txDetails) => {
    if(txDetails.type === "DEPOSIT"){
      return(
        <div title={"share your donation"} style={{display:"flex", flex:"flex-wrap", gap:"16px", paddingBottom:"32px"}}>
          <h4 style={{fontSize: 15, marginBottom: "auto", marginTop: "auto"}}>Proud of your donation? Share it</h4>
          <Button isLogo="share_d" callback={async() => await this.share(txDetails.poolAddress, txDetails.poolName, txDetails )} />
        </div>
      );
    }
    if(txDetails.type === "CLAIM"){
      return(
        <div title={"share"} style={{display:"flex", flex:"flex-wrap", gap:"16px", paddingBottom:"32px"}}>
          <h4 style={{fontSize: 15, marginBottom: "auto", marginTop: "auto"}}>Thank you for harvesting donations for {txDetails.poolName}!</h4>
          <Button isLogo="share_d" callback={async() => await this.share(txDetails.poolAddress, txDetails.poolName, txDetails)}/>
        </div>
      );
    }
  }

  render() {
      const { txDetails } = this.props;
		return (
      <Fragment>
      <ModalHeader>
        <h2 className="mb0">{txDetails.type === "CLAIM" ? "HARVEST" : txDetails.type} {txDetails.amount} {this.displayLogo(txDetails.tokenString)} {txDetails.tokenString}  {this.successOrFail(txDetails.success)}</h2>
      </ModalHeader>
      <ModalBodyTx>
        {this.getShareButton(txDetails)}
        <div title={"view transaction on block explorer"}><Button text={ "TX HASH       => "+txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4)} callback={() => redirectWindowBlockExplorer(txDetails.txHash, 'tx', txDetails.networkId)}/></div>
        <div title={"view pool address on block explorer"}><Button text={"POOL CONTRACT => "+txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4)} callback={() => redirectWindowBlockExplorer(txDetails.poolAddress, 'address', txDetails.networkId)}/></div>
      </ModalBodyTx>
    </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  tokenMap: state.tokenMap,
})

const mapDispatchToProps = dispatch => ({
  updateShare: (share) => dispatch(updateShare(share)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TxResultModal)