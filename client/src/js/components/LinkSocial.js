import React, {Component, Fragment} from "react";
import { connect } from "react-redux"

import Logo from "./Logo";
import {Button} from "./Button";
import TextLink from "./TextLink";
import { NavLink } from 'react-router-dom'
import Takeover from "./Takeover";

import ShareModal from "../components/modals/ShareModal";
import {SmallModal } from "../components/Modal";

import { updateShare } from  "../actions/share";

import { checkLocationForAppDeploy } from "../func/ancillaryFunctions"
class LinkSocial extends Component {
	render() {
    const { isMobile } = this.props;
    if("inApp" !== checkLocationForAppDeploy()) return null;
		return (
      <div style={{position: "fixed", top: "300px", marginBottom: "5px", marginLeft: "20px", display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
        <a title="Github" style={{marginTop: "24px", marginLeft: "-10px"}}  href="https://github.com/smeee23/sli/tree/master" target="_blank" rel="noopener noreferrer"><Button isLogo="github"/></a>
        <a title="Twitter" style={{marginTop: "3px", marginLeft: "-10px"}} href="https://twitter.com/JustCauseDev" target="_blank" rel="noopener noreferrer"><Button isLogo="tweet"/></a>
        <a title="Discord" style={{marginTop: "3px", marginLeft: "-10px"}} href="" target="_blank"><Button isLogo="discord"/></a>
      </div>
		);
	}
}

const mapStateToProps = state => ({
	isMobile: state.isMobile,
})

const mapDispatchToProps = dispatch => ({
	updateShare: (share) => dispatch(updateShare(share)),
})

export default connect(mapStateToProps, mapDispatchToProps)(LinkSocial)