import React, {Component} from "react"
import classNames from 'classnames'

class Takeover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    }
  }

  toggle = () => {
    this.setState({
      open: !this.state.open
    })
  }

	render() {
    const classnames = classNames({
      "takeover": true,
      "takeover--open": this.state.open,
    })

		return (
      <div className={classnames}>
        <nav className='takeover__panel horizontal-padding'>
          { this.props.children }
        </nav>
        <div className='takeover__hamburger' onClick={this.toggle}>
          <div className="takeover__hamburger__line"/>
          <div className="takeover__hamburger__line"/>
          <div className="takeover__hamburger__line"/>
        </div>
      </div>
		);
	}
}

export default Takeover
