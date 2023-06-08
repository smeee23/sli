import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import PendingTx from "./PendingTx";
import {Button} from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { redirectWindowBlockExplorer } from '../func/ancillaryFunctions';

class PendingTxList extends Component {

    showSlice = (str) => {
        return (str.slice(0, 6) + " . . . "+str.slice(-4));
    }
    getHeader = (status) => {
        if(status === 'pending'){
            return <h2 style={{fontSize: 16,  marginBottom: "2px", marginTop: "2px", marginLeft: "4px", marginRight: "4px"}}>Pending Transaction</h2>
        }
        else if(status === 'complete'){
            return <h2 style={{fontSize: 16,  marginBottom: "2px", marginTop: "2px", marginLeft: "4px", marginRight: "4px", color: "green"}}>Completed Transaction</h2>
        }
    }
    getPendingTxs = (pending) => {
        let testInfo = {
            txHash: "0x64a638ee16688e0a3f17f89603313cc6",
            poolName: "Gitcoin Grants Matching Pool",
            type: "Claim",
            status: "complete"
        };
        let txInfo = []
		if(pending){
			pending.forEach((e, i) =>{
				txInfo.push(
                    <PendingTx key={i} txInfo={e}/>
                );
			})
		}
		return txInfo;
	}
	render() {
    const { isMobile } = this.props;
    const pending = this.props.pendingTxList;
		return (
        <div style={{position: "fixed", top: "120px", color:"black", marginLeft: "0px", display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left", gap: "5px"}}>
            {this.getPendingTxs(pending)}
        </div>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
    activeAccount: state.activeAccount,
    tokenMap: state.tokenMap,
    pendingTxList: state.pendingTxList,
})

export default connect(mapStateToProps)(PendingTxList)