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

class TxResultModal extends Component {

  successOrFail = (success) => {
    if(success) return "SUCCESS"
    return 'FAILED'
  }

  getTxHash = (txHash, networkId) => {
    if(txHash){
      return (
        <div title={"view transaction on block explorer"}><Button text={ "TX HASH       => "+txHash.slice(0, 6) + "..."+txHash.slice(-4)} callback={() => redirectWindowBlockExplorer(txHash, 'tx', networkId)}/></div>
      );
    }
  }

  render() {
      const { txDetails } = this.props;
		return (
      <Fragment>
        <div style={{display: "flex", alignItems: "center", justifyContent:"center", textAlign: "center"}}>
          <h2>{txDetails.type} {txDetails.amount} {txDetails.tokenString}  {this.successOrFail(txDetails.success)}</h2>
        </div>
      <ModalBodyTx>
        {this.getTxHash(txDetails.txInfo, txDetails.networkId)}
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