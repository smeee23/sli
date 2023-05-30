// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IOracleGateway {
    function setReserve(address _reserve) external;
    function callOracle(string memory _index) external;
}