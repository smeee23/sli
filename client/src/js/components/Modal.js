import React, {Component, Fragment} from "react"
import classNames from 'classnames'

import Logo from "./Logo";

class ModalHeader extends Component {
  render() {
		return (
      <div className="modal__header">
        <Fragment>
            { this.props.children }
            <div className="modal__close-btn" onClick={this.closeModal}>
              <Logo/>
            </div>
        </Fragment>
      </div>
		);
	}
}

class ModalHeaderNoClose extends Component {
  render() {
		return (
      <div className="modal__header">
        <Fragment>
            { this.props.children }
        </Fragment>
      </div>
		);
	}
}

class ModalBody extends Component {
  render() {
		return (
      <div className="modal__body">
        { this.props.children }
      </div>
		);
	}
}

class ModalBodyTx extends Component {
  render() {
		return (
      <div className="modal__bodytx">
        { this.props.children }
      </div>
		);
	}
}

class ModalBodyDeploy extends Component {
  render() {
		return (
      <div className="modal__bodydeploy">
        { this.props.children }
      </div>
		);
	}
}

class ModalCtas extends Component {
  render() {
		return (
      <div className="modal__ctas">
        { this.props.children }
      </div>
		);
	}
}

class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
    }
  }

  componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

  handleClickOutside = (event) => {
    if (!this.refs["modal"].contains(event.target)) {
      this.closeModal();
    }
  }

  openModal = () => {
    this.setState({
      isOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      isOpen: false
    })
  }

	render() {
    const classnames = classNames({
      "modal": true,
      "modal--open": this.state.isOpen,
    })

		return (
      <div className={classnames}>
        <div className="modal__background"/>
        <div className="modal__box theme--white" ref="modal">
          { this.props.children }
        </div>
      </div>
		);
	}
}

class SmallModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
    }
  }

  componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

  handleClickOutside = (event) => {
    if (!this.refs["modal"].contains(event.target)) {
      this.closeModal();
    }
  }

  openModal = () => {
    this.setState({
      isOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      isOpen: false
    })
  }

	render() {
    const classnames = classNames({
      "modal": true,
      "modal--open": this.state.isOpen,
    })

		return (
      <div className={classnames}>
        <div className="modal__background"/>
        <div className="modal__boxsm theme--white" ref="modal">
          { this.props.children }
        </div>
      </div>
		);
	}
}

class LargeModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
    }
  }

  componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

  handleClickOutside = (event) => {
    if (!this.refs["modal"].contains(event.target)) {
      this.closeModal();
    }
  }

  openModal = () => {
    this.setState({
      isOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      isOpen: false
    })
  }

	render() {
    const classnames = classNames({
      "modal": true,
      "modal--open": this.state.isOpen,
    })

		return (
      <div className={classnames}>
        <div className="modal__background"/>
        <div className="modal__boxdeploy theme--white" ref="modal">
          { this.props.children }
        </div>
      </div>
		);
	}
}

export { Modal, LargeModal, SmallModal, ModalHeader, ModalHeaderNoClose, ModalBody, ModalBodyTx, ModalBodyDeploy, ModalCtas }
