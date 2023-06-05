import React, {Component} from "react"
import { Fragment } from "react";

import { connect } from "react-redux";

import Arrow from "../components/icons/Arrow";
import Charity from "../components/icons/Charity";
import LogoCard from "../components/logos/LogoCard";
import AGD from "../components/logos/AGD";
import AaveLogo from "../components/cryptoLogos/AaveLogoXL"
import MaleOne from "../components/icons/MaleOne"

import EthLogoLg from "../components/cryptoLogos/EthLogoLg"
import LinkLogoLg from "../components/cryptoLogos/LinkLogoLg"
import UsdcLogo from "../components/cryptoLogos/UsdcLogo"

class Homepage extends Component {

	componentDidMount() {
		window.scrollTo(0,0);
	}

	getSlide = () => {
		const graphic =
				<div style={{marginTop:"100px", paddingtop:"10px", display: "flex", alignItems:"center", justifyContent:"center"}}>
					<div style={{gridColumn: "2", gridRow: "1", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<h2 style={{fontSize:60, marginTop: "50px"}}>Lossless Insurance</h2>
					<div style={{flexWrap: "wrap", display: "grid", gridTemplateColumns: "repeat(7, auto)", gap: "5px", gridTemplateRows: "repeat(2, auto)", alignItems:"center", justifyContent:"center"}}>

					<div style={{gridColumn: "3",marginRight: "20px", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<h1 style={{fontSize: 150}} >SLI</h1>
						<h3 style={{marginTop: "-45px"}} className="mb0">Reserve</h3>
						<h3 style={{marginTop: "5px"}} className="mb0">Contracts</h3>
					</div>
					<div style={{gridColumn: "4", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center", marginRight:"20px"}}>
						<LinkLogoLg/>
						<h3 style={{marginTop: "5px"}} className="mb0">Oracles</h3>
						<div style={{marginLeft: "25px"}}><Arrow/></div>
					</div>
					<div style={{gridColumn: "5", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center", marginRight:"20px"}}>
						<AaveLogo/>
						<h3 style={{marginTop: "5px"}} className="mb0">AAVE</h3>
						<h3 style={{marginTop: "5px"}} className="mb0">Contracts</h3>
					</div>
					<div style={{gridColumn: "6", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<LinkLogoLg/>
						<h3 style={{marginTop: "5px"}} className="mb0">Oracles</h3>
						<div style={{marginLeft: "25px"}}><Arrow/></div>
					</div>
					<div style={{gridColumn: "7", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<MaleOne/>
						<h3 style={{marginTop: "5px"}} className="mb0">Slashed</h3>
						<h3 style={{marginTop: "5px"}} className="mb0">Validator</h3>
					</div>
				</div>
					</div>
				</div>
		return graphic;
	}

	render() {
		return (
			<Fragment>

				<article>
					<div style={{marginBottom:"10px",  alignItems:"center", justifyContent:"center"}}>
						{this.getSlide()}
					</div>
					<section className="page-section horizontal-padding">
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Protect your staked assets with Ethereum Slashing Insurance (SLI) protocol, the cutting-edge slashing insurance protocol designed specifically for validators on blockchain networks. We understand the risks that honest validators face in the ever-evolving crypto landscape, and we're here to provide you with peace of mind and financial protection.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Validators participate by depositing their premiums into the SLI contracts, which, in turn, deposit them into Aave. The interest earned is set aside to pay out future slashing claims. When validators no longer require coverage (e.g., they exit the validator, no longer desire coverage, or get slashed), they simply withdraw their premium deposit, and the accrued interest remains reserved for future claims.</p>
							</div>
						</div>
					</section>
					<section className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50, paddingBottom: "50px"}}>How We Do It</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">SLI contracts generate interest through an integration with the Aave lending protocol. Aave can be thought of as an automated system of liquidity pools. Users deposit tokens they want to lend out, which are amassed into a large lending pool. Borrowers may then draw from these pools by taking out collateralized loans. In exchange for providing liquidity to the market lenders earn a passive rate of interest on their deposits.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">The Aave Protocol has been audited, and has an ongoing bug bounty program. It secures tens of billions of dollars of value. The protocol is completely open source, allowing anyone to interact and build on top of it. Every possible step has been taken to minimize the risk as much as possible. However, no platform can be considered entirely risk free.</p>
							</div>
						</div>
					</section>
					<section className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50,  paddingBottom: "50px"}}>Why We Do It</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Validators on the Ethereum network can face penalties for certain actions, such as double signing attestations or proposals. Accidental slashing can occur due to technical issues or human error. Slashing insurance can help validators protect themselves financially against such accidental slashing incidents.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Slashing insurance allows validators to mitigate the financial risks associated with slashing. It is our hope that by providing insurance coverage for slashing, validators may feel more confident and secure in participating in the network. This increased participation can enhance the overall security and decentralization of the Ethereum network by encouraging more validators to stake their assets.</p>
							</div>
						</div>
					</section>
					<section style={{alignItems:"center", justifyContent:"center"}}  className="page-section bw0 horizontal-padding">
						<a href="https://docs.justcause.finance/" target="_blank" rel="noopener noreferrer">LEARN MORE AT OUR DOCS PAGE</a>
					</section>
				</article>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	tokenMap: state.tokenMap,
	verifiedPoolAddrs: state.verifiedPoolAddrs,
	verifiedPoolInfo: state.verifiedPoolInfo,
})

const mapDispatchToProps = dispatch => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(Homepage)
