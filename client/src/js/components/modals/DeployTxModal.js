import React, {Component, Fragment} from "react"
import { ModalHeader, ModalBody} from "../Modal";

import TextLink from '../TextLink'

import { redirectWindowBlockExplorer, getBlockExplorerUrl } from '../../func/ancillaryFunctions';
import { Button } from '../Button';

export default class DeployTxModal extends Component {

  successOrFail = (status) => {
    if(status === 'pending') return "PENDING POOL CREATION";
    else if(status === 'success') return "SUCCESSFUL POOL CREATION";
    else if(status === 'failed') return "FAILED POOL CREATION";
  }
  showPoolButton = (txDetails) => {
    if(txDetails.status === 'success'){
      return <TextLink text={"- POOL CONTRACT: "+txDetails.poolAddress.slice(0, 6) + "..."+txDetails.poolAddress.slice(-4) +"          view on block explorer"} href={getBlockExplorerUrl('address')+txDetails.poolAddress} callback={() => redirectWindowBlockExplorer(txDetails.poolAddress, 'address', txDetails.networkId)}/>
    }
  }
  getShareButton = (txDetails) => {
    if(txDetails.status === "success"){
      return(
        <div title={"share "+txDetails.poolName} style={{display:"flex", flex:"flex-wrap", gap:"16px"}}>
            <h4 style={{fontSize: 15}}>Congratulations, now share your pool and get some funding!</h4>
            <Button isLogo="share_d" callback={async() => await this.share(txDetails.poolAddress, txDetails.poolName, txDetails )} />
          </div>
      );
    }
  }
  render() {
      const { txDetails } = this.props;

		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">{this.successOrFail(txDetails.status)}</h2>
        </ModalHeader>
        <ModalBody>
            <p>{txDetails.poolName}<br/>
               {this.showPoolButton(txDetails)}
               <TextLink text={"- RECEIVER: "+txDetails.receiver.slice(0, 6) + "..."+txDetails.receiver.slice(-4) +"          view on block explorer"} href={getBlockExplorerUrl('address', txDetails.networkId)+txDetails.receiver} callback={() => redirectWindowBlockExplorer(txDetails.receiver, 'address', txDetails.networkId)}/>
              <TextLink text={"- TX HASH: "+txDetails.txHash.slice(0, 6) + "..."+txDetails.txHash.slice(-4) +"          view on block explorer"} href={getBlockExplorerUrl('tx', txDetails.networkId)+txDetails.txHash} callback={() => redirectWindowBlockExplorer(txDetails.txHash, 'tx', txDetails.networkId)}/>
            </p>
            {this.getShareButton(txDetails)}
        </ModalBody>
      </Fragment>
		);
	}
}