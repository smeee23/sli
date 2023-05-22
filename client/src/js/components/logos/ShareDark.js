import React, {Component} from "react"

class ShareDark extends Component {

	render() {
		const { callback} = this.props;
		return (
				<svg className="share_d" width="24" height="24" viewBox="0 0 24 24" onClick={callback}>
					<path fill="black" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/>
				</svg>
		);
	}
}

export default ShareDark