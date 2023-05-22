import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import Icon from "./Icon";
import {Button} from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import { redirectWindowBlockExplorer } from '../func/ancillaryFunctions';

class SliSwap extends Component {
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

	render() {
    	return (
            <Fragment>
                <p style={{fontSize: 75}}>Bond ETH</p>
                <p style={{fontSize: 30}}>Exchange ETH and sliETH</p>
                <div className="sliswap">
                <div className="sliswap__body">

                <div className="sliswap__container">
                    <header className="sliswap__header">
                        {"Sli Exchange"}
                    </header>

                    <form className="sliswap__swap-form">
                        <div className="sliswap__input-group">
                            <input type="text" id="input-token" />
                        </div>
                    </form>
                </div>
                </div>
                </div>
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

export default connect(mapStateToProps)(SliSwap)