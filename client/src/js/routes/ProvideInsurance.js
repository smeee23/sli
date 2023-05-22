import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Shapes from '../components/Shapes';

import LogoCard from "../components/logos/LogoCard";
import { Button } from '../components/Button';
import ShareModal from "../components/modals/ShareModal";
import {SmallModal } from "../components/Modal";
import { updateShare } from  "../actions/share";
import PendingTxList from "../components/PendingTxList";
import SliSwap from "../components/SliSwap";
import { displayLogo } from '../func/ancillaryFunctions';
class ProvideInsurance extends Component {
	componentDidMount() {
		window.scrollTo(0,0);
	}

    render() {
        console.log("AAAAA")
		return (

			<Fragment>
                <section className="page-section horizontal-padding" style={{paddingBottom: "8px", alignItems: "center", justifyContent: "center"}}>
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                            <h1 style={{alignItems:"center", justifyContent:"center", marginRight:"0%"}}>Bond ETH</h1>
                            <h2 style={{alignItems:"center", justifyContent:"center", marginRight:"0%", marginTop: "-40px", fontSize: 30}}>Provide ETH to Claims Fund</h2>
                            <div style={{display: "flex", flexDirection: "wrap", gap: "5px"}}>
                            <div title={"exchange sliETH back to ETH"}><Button logo={displayLogo("ETH")} text={"Withdraw sliETH"} /*disabled={isDisabled}*/ callback={() => {}}/></div>
                                <div title={"exchange ETH for sliETH and earn"}><Button logo={displayLogo("ETH")} text={"Deposit ETH"} /*disabled={isDisabled}*/ callback={() => {}}/></div>
                            </div>
                            <p style={{alignItems:"center", justifyContent:"center", marginRight:"0%",fontSize: 12}}>Rate: 1 sliETH = 1.07123 ETH</p>
                        </div>
                </section>
                <section className="page-section horizontal-padding">
                    <div style={{margin:'auto'}} className="grid">
                        <div className="grid__item--col-6 grid__item--col-12-medium">
                            <p className="mr">JustCause allows you to leverage the power of decentralized finance (Defi) to fund causes that are important to you. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal injustice, and much more! Create and fund pools with your friends and JustCause smart contracts donate funds while preserving your initial deposit.</p>
                        </div>
                        <div className="grid__item--col-6 grid__item--col-12-medium">
                            <p className="mr">Users participate as Contributors or Pool Creators. Pool Creators generate JustCause Pools which represent a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into lending protocols. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds they simply withdraw their original deposit and the interest accrued is left behind for the cause.</p>
                        </div>
                    </div>
                </section>
				<PendingTxList/>
			</Fragment>

		);
	}
}

const mapStateToProps = state => ({
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
	share: state.share,
})

const mapDispatchToProps = dispatch => ({
	updateShare: (share) => dispatch(updateShare(share)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProvideInsurance)
