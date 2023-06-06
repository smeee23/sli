import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import { Button } from '../Button'

import { updateTokenMap } from "../../actions/tokenMap"

import {twitterShare, facebookShare, linkedInShare, copyToClipboard} from '../../func/ancillaryFunctions';

class ShareModal extends Component {


  constructor(props) {
		super(props);

		this.state = {
			copied: false,
		}
	}

  copyToClipboard = (receiver) => {
		copyToClipboard(receiver);

		this.setState({
			copied: true,
		});
	}

  getCopyButton = (url) => {
		if(this.state.copied){
			return (
        <div title="copy receiving address to clipboard"><Button isLogo="copyPaste_check" disable="true" callback={() => this.copyToClipboard(url)}/></div>
      );
		}
		return (
			<div title="copy receiving address to clipboard"><Button isLogo="copyPaste" disable="true" callback={() => this.copyToClipboard(url)}/></div>
		);
	}

  getBody = (info) => {
      return(
        <div style={{display: "flex", flexDirection: "wrap", gap: "16px"}}>
            <p className="mr">"If you are really thankful, what do you do?  You share."  W. Clement Stone</p>
            <Button isLogo="tweet_d" callback={() => twitterShare("Ethereum Slashing Insurance, they don't have a real link because they are a thrown together chainlink hackathon project", "")}/>
          </div>
      );
  }
  render() {
        const { info } = this.props;
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Share Ethereum Slashing Insurance</h2>
        </ModalHeader>
        <ModalCtas>
          {this.getBody(info)}
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
})

const mapDispatchToProps = dispatch => ({
    updateTokenMap: (res) => dispatch(updateTokenMap(res)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ShareModal)