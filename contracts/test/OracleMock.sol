// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IReserve } from '../contracts/interfaces/protocol/IReserve.sol';

contract OracleMock {
  address reserve;
  address multiSig;
  address sender;
  string index;

  /**
  * @dev Only Reserve can call functions marked by this modifier.
  **/
  modifier onlyReserve(){
      require(reserve == msg.sender, "not the reserve");
      _;
  }

  /**
  * @dev Only MultiSig can call functions marked by this modifier.
  **/
  modifier onlyMultiSig(){
      require(multiSig == msg.sender, "not the multiSig");
      _;
  }

  constructor(address _multiSig) {
    multiSig = _multiSig;
  }

  function getStatusAndAddrResponse(string memory _index) external onlyReserve returns (bytes32 requestId) {
    index = _index;
    return 0x0;
  }

  function fulfillMultipleParameters(
        bytes32 _requestId,
        uint _index,
        uint8 _slashed,
        address _withdrawAddress,
        uint _loss
    ) public {
    _requestId = 0x0;
    IReserve(reserve).oracleResponse(_index, _slashed, _withdrawAddress, _loss);
  }

  function executeRequest(
        string calldata source,
        bytes calldata secrets,
        string[] calldata args,
        uint64 subscriptionId,
        uint32 gasLimit
    ) external returns (bytes32){
      bytes32 result = "";
      return result;
    }

  function setReserve(address _reserve) external onlyMultiSig {
    require(reserve == address(0), "reserve already set");
    reserve = _reserve;
  }
}