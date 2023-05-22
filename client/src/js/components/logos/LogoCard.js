import React, {Component} from "react"

class LogoCard extends Component {

	render() {
		return (
            <svg className="logo" width="150px" height="150px" viewBox="0 0 21 21">
                <defs>
                    <circle id="path-1" cx="10.5" cy="10.5" r="9.5"></circle>
                </defs>
                <g stroke="none" fill="none" fillRule="evenodd">
                    <mask id="mask" fill="white">
                        <use xlinkHref="#path-1"></use>
                    </mask>
                    <line x1="4" y1="20" x2="14" y2="15" stroke="#3FA7D6" strokeWidth="3" strokeLinecap="butt" mask="url(#mask)"></line>
                    <line x1="2" y1="15" x2="16" y2="8" stroke="#E0C723" strokeWidth="3" strokeLinecap="butt" mask="url(#mask)"></line>
                    <line x1="0" y1="10" x2="10" y2="5" stroke="#CE3232" strokeWidth="3" strokeLinecap="butt" mask="url(#mask)"></line>
                    <circle stroke="#FFFFFF" cx="10.5" cy="10.5" r="9.5" strokeWidth="2"></circle>
                </g>
            </svg>
		);
	}
}

export default LogoCard