import React, {Component, Fragment} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

class Multiselect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      selected: this.props.selected ? this.props.selected : this.props.children,
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
    const unselected = Array.from(this.props.children).filter(e => this.state.selected.includes(e) || e === item);
    this.setState({
      selected: this.state.selected.includes(item) ? this.state.selected.filter(e => e !== item) : unselected
    })
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
        { this.state.selected.includes(item) ? (<Icon name="check" size={32}/>) : null }
      </div>
    ))

		return (
      <div className={classnames} ref="container">
        <label className="select__label">{label}</label>
        <div className="select__selected-box" style={{ minWidth: '224px' }}>
          <div className="select__selected" onClick={this.state.open ? this.close : this.open }>
            { this.state.selected.map((item, i) => (
              <Fragment key={i}>
                { item }{ i < this.state.selected.length - 1 ? ',' : '' }
              </Fragment>
            )) }
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

export default Multiselect
