import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import Icon from "./Icon";
import {Button} from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { redirectWindowBlockExplorer } from '../func/ancillaryFunctions';

class PendingTx extends Component {
    constructor(props) {
        super(props);

        this.state = {
          open: true,
        }
      }
    showSlice = (str) => {
        return (str.slice(0, 6) + " . . . "+str.slice(-4));
    }
    toggleCardOpen = () => {
		this.setState({
			open: !this.state.open
		})
	}
    getHeader = (status) => {
        if(status === 'pending'){
            return <h2 style={{fontSize: 16,  marginBottom: "2px", marginTop: "2px", marginLeft: "4px", marginRight: "4px"}}>Pending Transaction</h2>
        }
        else if(status === 'complete'){
            return <h2 style={{fontSize: 16,  marginBottom: "2px", marginTop: "2px", marginLeft: "4px", marginRight: "4px"}}>Processed Transaction</h2>
        }
    }
    getPendingTx = (txInfo) => {
		if(txInfo && this.state.open){
            let cn = txInfo.status === "pending" ? "tx tx__pending" : "tx tx__completed";
            return (
                <div className={cn} >
                    <div style={{display: "flex", flexDirection: "wrap"}}>
                        {this.getHeader(txInfo.status)}
                        <div className="tx__open-button" style={{marginLeft:"auto", marginRight:"1px"}} onClick={this.toggleCardOpen}>
                            <Icon name={"plus"} size={8} color="black"/>
                        </div>
                    </div>
                    <h2 style={{fontSize: 12,  marginBottom: "2px", marginLeft: "4px", marginRight: "4px"}}>{txInfo.type} {'=>'} {txInfo.poolName}</h2>
                    <a title="view on block explorer" style={{color: "black"}} href={"https://polygonscan.com/tx/"+txInfo.txHash+"/"} target="_blank" rel="noopener noreferrer">
                        <h2 style={{fontSize: 12,  marginBottom: "2px", color:"black", marginLeft: "4px", marginRight: "4px"}}>HASH {this.showSlice(txInfo.txHash)}</h2>
                    </a>
                </div>
            );
    }
	}
	render() {
    const { isMobile, txInfo } = this.props;

		return (
            <Fragment>
                {this.getPendingTx(txInfo)}
            </Fragment>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
    activeAccount: state.activeAccount,
    tokenMap: state.tokenMap,
    pendingTxList: state.pendingTxList,
})

export default connect(mapStateToProps)(PendingTx)