import React, {Component} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

class Select extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      selected: this.props.selected ? this.props.selected : this.props.children[0],
    }
  }

  componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

  handleClickOutside = (event) => {
    if (!this.refs["container"].contains(event.target)) {
      this.close();
    }
  }

  open = () => {
    this.setState({
      open: true,
    })
  }

  close = () => {
    this.setState({
      open: false
    })
  }

  changeSelected = (item) => {
    this.setState(prevState => ({
      selected: item,
      open: false
    }))
  }

	render() {
		const { label } = this.props;

    const classnames = classNames({
      "select": true,
      "select--open": this.state.open,
    })

    const options = this.props.children.map((item, i) => (
      <div key={i} className="select__option" onClick={() => this.changeSelected(item)}>
        { item }
        { this.state.selected === item ? (<Icon name="check" size={32}/>) : null }
      </div>
    ))

		return (
      <div className={classnames} ref="container">
        <label className="select__label">{label}</label>
        <div className="select__selected-box" onClick={this.state.open ? this.close : this.open }>
          <div className="select__selected">
            { this.state.selected }
          </div>
          <div className="select__caret">
            <Icon name={"caret"} size={32}/>
          </div>
        </div>
        <div className="select__bar"/>
        <div className="select__options">
          { options }
        </div>
      </div>
		);
	}
}

export default Select
