import React, {Component, Fragment} from "react"
import { connect } from "react-redux";
import { ModalHeader, ModalCtas } from "../Modal";
import TextField from '../TextField'
import { Button } from '../Button'

import { updateSearchInfo} from "../../actions/searchInfo";

import {searchPools } from '../../func/contractInteractions';

class SearchModal extends Component {

  constructor(props) {
		super(props);

		this.state = {
			isValidInput: 'valid',
      		amount: 0,
          pending: false,
		}
	}

  checkValues = () => {
	return false;
  }

  setValue = async(searchTerm) => {
	  console.log('searchTerm', searchTerm);
    this.setState({
      pending: true
    });
    let results = await searchPools(this.props.poolTrackerAddress, this.props.activeAccount, this.props.tokenMap, searchTerm);
    this.props.updateSearchInfo(results);
  }

  getModalBody = (poolInfo) => {
    if(!this.state.pending && !this.props.linkAddress){

      return (
          <TextField ref="searchTerm" label="Name or Address" placeholder="Enter Name or Address"/>
      );
    }
    return <p>Searching...</p>
  }

  render() {
    const { poolInfo } = this.props;
    if(this.props.linkAddress && !this.state.pending && this.props.poolTrackerAddress && this.props.activeAccount && this.props.tokenMap){
      this.setValue(this.props.linkAddress);
    }
		return (
      <Fragment>
        <ModalHeader>
          <h2 className="mb0">Find a Pool by Address or Name</h2>
        </ModalHeader>
        <ModalCtas>
          <div style={{fontSize: 9, display:"flex", flexDirection: "column", alignItems:"left", justifyContent:"left"}}>
            <p className="mr">Enter pool contract address or name to search. Must be exact match, case sensitive.</p>
            {this.getModalBody(poolInfo)}
          </div>
          <div style={{marginLeft: "10px"}}>
            <Button text="Find Pool" disabled={this.checkValues()} callback={() => this.setValue(this.refs.searchTerm.getValue())}/>
          </div>
        </ModalCtas>
      </Fragment>
		);
	}
}

const mapStateToProps = state => ({
  tokenMap: state.tokenMap,
	poolTrackerAddress: state.poolTrackerAddress,
 	depositAmount: state.depositAmount,
	activeAccount: state.activeAccount,
})

const mapDispatchToProps = dispatch => ({
  updateSearchInfo: (info) => dispatch(updateSearchInfo(info)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchModal)