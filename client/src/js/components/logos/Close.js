import React, {Component} from "react"

class Close extends Component {
	render() {
		const { callback } = this.props;
		return (
				<svg className="share" width="12" height="6" viewBox="0 0 24 24" onClick={callback}>
					<path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/>
				</svg>
		);
	}
}

export default Close
