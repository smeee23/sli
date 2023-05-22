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
import MaticLogo from "../components/cryptoLogos/MaticLogo"
import UsdcLogo from "../components/cryptoLogos/UsdcLogo"

class Homepage extends Component {

	componentDidMount() {
		window.scrollTo(0,0);
	}

	getSlide = () => {
		const graphic =
				<div style={{marginTop:"100px", paddingtop:"10px", display: "flex", alignItems:"center", justifyContent:"center"}}>
					<div style={{gridColumn: "2", gridRow: "1", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<h2 style={{fontSize:60, marginTop: "30px"}}>Lossless Insurance</h2>
					<div style={{flexWrap: "wrap", display: "grid", gridTemplateColumns: "repeat(7, auto)", gap: "5px", gridTemplateRows: "repeat(2, auto)", alignItems:"center", justifyContent:"center"}}>

					<div style={{gridColumn: "3",marginRight: "20px", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center", paddingRight:"20px"}}>
						<h1 style={{fontSize: 150}} >SLI</h1>
						<h2 style={{marginTop: "-45px"}} className="mb0">Contracts</h2>
					</div>
					<div style={{gridColumn: "4", gridRow: "2"}}>
						<Arrow/>
						<div>
							<EthLogoLg/>
						</div>
					</div>
					<div style={{gridColumn: "5", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center", paddingRight:"20px"}}>
						<AaveLogo/>
						<h2 style={{marginTop: "5px"}} className="mb0">AAVE</h2>
					</div>
					<div style={{gridColumn: "6", gridRow: "2", display: "flex", flexDirection: "column"}}>
						<Arrow/>
						<div>
							<EthLogoLg/>
						</div>
					</div>
					<div style={{gridColumn: "7", gridRow: "2", display: "flex", flexDirection: "column", alignItems:"center", justifyContent:"center"}}>
						<MaleOne/>
						<h2 style={{marginTop: "5px"}} className="mb0">Claims</h2>
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
						<h2 style={{margin:'auto', fontSize:50, paddingBottom: "50px"}}>different approach to insurance</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause allows you to leverage the power of decentralized finance (Defi) to fund causes that are important to you. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal injustice, and much more! Create and fund pools with your friends and JustCause smart contracts donate funds while preserving your initial deposit.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Users participate as Contributors or Pool Creators. Pool Creators generate JustCause Pools which represent a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into lending protocols. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds they simply withdraw their original deposit and the interest accrued is left behind for the cause.</p>
							</div>
						</div>
					</section>
					<section className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50, paddingBottom: "50px"}}>How We Do It</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause Pools generate interest through an integration with the Aave lending protocol. Aave can be thought of as an automated system of liquidity pools. Users deposit tokens they want to lend out, which are amassed into a large lending pool. Borrowers may then draw from these pools by taking out collateralized loans. In exchange for providing liquidity to the market lenders earn a passive rate of interest on their deposits.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">The Aave Protocol has been audited, and has an ongoing bug bounty program. It secures tens of billions of dollars of value. The protocol is completely open source, allowing anyone to interact and build on top of it. Every possible step has been taken to minimize the risk as much as possible. However, no platform can be considered entirely risk free. Please see the Risks section for more details.</p>
							</div>
						</div>
					</section>
					<section className="page-section horizontal-padding">
						<h2 style={{margin:'auto', fontSize:50,  paddingBottom: "50px"}}>Why We Do It</h2>
						<div style={{margin:'auto'}} className="grid">
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools with a user interface or interact directly with the smart contracts on the network. This freedom lies at the heart of the difference between permissioned (closed) and permissionless (open) systems.</p>
							</div>
							<div className="grid__item--col-6 grid__item--col-12-medium">
								<p className="mr">Our mission is to give users the freedom to create and fund any cause they deem worthy. Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem.</p>
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
