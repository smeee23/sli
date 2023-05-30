// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract ReserveStorage {
address immutable wethGatewayAddr;
    address oracle;
    address public oracleGateway;
    uint256 public constant WAIT_PERIOD = 2 weeks;
    uint256 public constant APPLY_WINDOW = 2 days;

    enum Status {
        NOT_ACTIVE,
        ACTIVE,
        AWAIT_ORACLE_ADD,
        ORACLE_ADD_APPROVE,
        AWAIT_ORACLE_CLAIM,
        CLAIM_WAIT_PERIOD,
        CLOSED,
        CLAIM_PAUSED
    }

    struct Beneficiary {
        Status status;
        address withdrawAddress;
        uint claimTimestamp;
        uint applyTimestamp;
        uint loss;
    }

    //maps validator index to Beneficiary obj
    mapping(uint => Beneficiary) beneficiaries;
    //maps withdraw address to validator Ids
    mapping(address => uint[]) depositors;

    address public immutable generatorPool;

    address public immutable multiSig;
    uint public minimumProvide;
    //minimum required for withdrawals and accepting claims
    uint public minimumReserve;
    //minimum pure ETH to hold in Reserve
    //uint public minimumPureHoldings;
    uint public maxClaim;

    /**
     * @dev Constructor.
     */
    constructor(
        address _multiSig,
        address _generatorPool,
        address _wethGatewayAddr,
        uint _minimumProvide,
        uint _minimumReserve,
        uint _maxClaim,
        address _oracle,
        address _oracleGateway
    ){
        multiSig = _multiSig;
        generatorPool = _generatorPool;
        wethGatewayAddr = _wethGatewayAddr;
        minimumProvide = _minimumProvide;
        minimumReserve = _minimumReserve;
        maxClaim = _maxClaim;
        oracle = _oracle;
        oracleGateway = _oracleGateway;
    }
}
