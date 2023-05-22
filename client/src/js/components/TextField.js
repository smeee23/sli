import React, {Component} from "react"
import classNames from 'classnames'

import Icon from "./Icon";

class TextField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      completed: this.props.value,
      value: this.props.value ? this.props.value :  ''
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
      this.unfocusField();
    }
  }

  focusField = () => {
    this.setState({
      focused: true,
    })
  }

  unfocusField = () => {
    this.setState({
      completed: this.refs["input"].value.length > 0,
      focused: false
    })
  }

  getValue = () => {
    return this.state.value;
  }
  updateValue = (e) => {
    this.setState({
      value: e.target.value
    });
  }

  replaceValue = (e) => {
    this.setState({
      value: e
    });
  }

	render() {
		const { label, placeholder, id } = this.props;

    const classnames = classNames({
      "textfield": true,
      "textfield--focused": this.state.focused,
      "textfield--completed": this.state.completed,
    })

		return (
      <div className={classnames} onClick={this.state.focused ? this.unfocusField : this.focusField } ref="container">
        <div className="textfield__box">
          <Icon name={"pencil"} size={32}/>
          <label className="textfield__label">{label}</label>
          <input ref="input" className="textfield__input" id={id}
          placeholder={placeholder}
          value={this.state.value}
          onChange={this.updateValue}
          />
        </div>
        <div className="textfield__bar"/>
      </div>
		);
	}
}

export default TextField
