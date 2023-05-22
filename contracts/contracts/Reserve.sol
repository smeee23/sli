// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import {IERC20} from "./interfaces/other/IERC20.sol";
import {IWETHGateway} from "./interfaces/aave/IWETHGateway.sol";
import {IFunctionsConsumer} from "./interfaces/link/IFunctionsConsumer.sol";
import {IPremiumGenerator} from "./interfaces/protocol/IPremiumGenerator.sol";
import {SlashingInsuranceETH} from "./SlashingInsuranceETH.sol";
import {SafeERC20} from "./libraries/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//AAVE V2
import {ILendingPool} from "./interfaces/aave/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "./interfaces/aave/ILendingPoolAddressesProvider.sol";
import {IProtocolDataProvider} from "./interfaces/aave/IProtocolDataProvider.sol";

//AAVE V3
import {IPool} from "./interfaces/aave/IPool.sol";
import {IPoolAddressesProvider} from "./interfaces/aave/IPoolAddressesProvider.sol";

/**
 * @title PoolTracker contract
 * @author JustCause
 * @notice Main point of interaction with JustCause Protocol
 * This is a proof of concept starter contract for lossless donations
 *
 * Aave v3 is used to generate interest for crowdfunding
 *
 * PoolTracker contract controls deposit calls to Aave to make
 * approvals needed only once per token. Calls JustCause Pools for
 * withdrawals and claims
 *
 * Controls Owner/Contributor NFT creation and updates for deposits/withdrawals
 *
 * Controls JustCause Pool creation with proxy contracts
 *
 * @dev Deposits, withdraws, and claims for Aave Pools
 * @dev Generate ERC721 token
 **/

contract Reserve is ReentrancyGuard {
    using SafeERC20 for IERC20;

    SlashingInsuranceETH immutable sliETH;
    address immutable wethGatewayAddr;
    address oracle;
    uint256 public constant WAIT_PERIOD = 2 weeks;
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
        uint loss;
    }

    //maps validator index to Beneficiary obj
    mapping(uint => Beneficiary) beneficiaries;

    address generatorPool;

    address immutable multiSig;
    uint public minimumProvide;
    //minimum required for withdrawals and accepting claims
    uint public minimumReserve;
    //minimum pure ETH to hold in Reserve
    //uint public minimumPureHoldings;
    uint public maxClaim;

    event DenyAddBeneficiary(
        uint validatorIndex,
        address withdrawAddres,
        string reason
    );
    event AddBeneficiary(uint validatorIndex, address withdrawAddress);
    event WithdrawBeneficiary(uint validatorIndex, address withdrawAddres);
    event Harvest(address pool, uint amount);
    event MakeClaim(uint validatorIndex);
    event ProcessClaim(address beneficiary, uint amount, string result);

    modifier claimLessThanMax(uint _claimAmount) {
        require(_claimAmount < maxClaim, "claim cannot be more than 16 Ether");
        _;
    }

    modifier minimumReserveMet() {
        require(
            minimumReserve <= getProtocolBalance(),
            "minimum reserve not met"
        );
        _;
    }

    modifier onlyApply(uint _validatorIndex) {
        require(
            beneficiaries[_validatorIndex].withdrawAddress == address(0),
            "not eligible to apply"
        );
        _;
    }

    modifier onlyBeneficiary(address _withdrawAddress, uint _validatorIndex) {
        require(
            beneficiaries[_validatorIndex].withdrawAddress == _withdrawAddress,
            "must send tx from validator withdrawAddress"
        );
        _;
    }
    modifier onlyAddApproved(uint _validatorIndex) {
        require(
            beneficiaries[_validatorIndex].status == Status.ORACLE_ADD_APPROVE,
            "beneficiary is not approved"
        );
        _;
    }

    modifier onlyActiveBeneficiary(uint _validatorIndex) {
        require(
            beneficiaries[_validatorIndex].status == Status.ACTIVE,
            "beneficiary not active"
        );
        _;
    }

    modifier onlyWaitPeriod(uint _validatorIndex) {
        require(
            beneficiaries[_validatorIndex].status == Status.CLAIM_WAIT_PERIOD,
            "no claim pending"
        );
        _;
    }

    modifier onlyPausedClaim(uint _validatorIndex) {
        require(
            beneficiaries[_validatorIndex].status == Status.CLAIM_PAUSED,
            "no claim paused"
        );
        _;
    }

    modifier onlyTimeoutPassed(uint _validatorIndex) {
        require(block.timestamp >=
                beneficiaries[_validatorIndex].claimTimestamp +
                WAIT_PERIOD, "Cannot withdraw claim until timeout passed"
        );
        _;
    }

    modifier fromWithdrawAddress(
        address _withdrawAddress,
        uint _validatorIndex
    ) {
        require(
            beneficiaries[_validatorIndex].withdrawAddress == _withdrawAddress,
            "withdrawAddress does not match"
        );
        _;
    }

    /**
     * @dev Only address that are a pool can be passed to functions marked by this modifier.
     **/
    modifier onlyPools() {
        require(isPool(msg.sender), "sender is not pool");
        _;
    }

    /**
     * @dev Only multisig can call functions marked by this modifier.
     **/
    modifier onlyMultiSig() {
        require(multiSig == msg.sender, "not the multiSig");
        _;
    }

    /**
     * @dev Only oracle can call functions marked by this modifier.
     **/
    modifier onlyOracle() {
        require(oracle == msg.sender, "not the oracle");
        _;
    }

    /**
     * @dev Only sliETH contract can call functions marked by this modifier.
     **/
    modifier onlySliETHContract() {
        require(address(sliETH) == msg.sender, "not the sliETH contract");
        _;
    }

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
        address _oracle
    ) {
        multiSig = _multiSig;
        generatorPool = _generatorPool;
        wethGatewayAddr = _wethGatewayAddr;
        sliETH = new SlashingInsuranceETH();
        oracle = _oracle;
        minimumProvide = _minimumProvide;
        minimumReserve = _minimumReserve;
        maxClaim = _maxClaim;
    }

    receive() external payable {
        provideInsurance();
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        provideInsurance();
    }

    function provideInsurance() public payable nonReentrant {
        require(
            msg.value >= minimumProvide,
            "value must be greater than minimum"
        );
        sliETH.mint(msg.sender, msg.value);
        address aaveLendingPool = IPremiumGenerator(generatorPool).getLendingPoolAddress();
        IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(aaveLendingPool, address(this), 0);
    }

    function withdrawInsurance(uint _sliETHAmount) external nonReentrant {
        uint requestedETH = sliETH.getETHValue(_sliETHAmount);
        require(
            minimumReserve < (getProtocolBalance() - requestedETH),
            "reserve insufficient to withdraw insurance"
        );
        sliETH.burn(msg.sender, _sliETHAmount);
        _processOutflow(msg.sender, requestedETH);
    }

    function _processOutflow(address _to, uint requestedETH) internal {
        //harvest aave pools for outflow
        uint aTokenBalance = getReserveATokenBalance();
        if(aTokenBalance < requestedETH){
            _harvestInterest();
        }

        address aTokenAddress = IPremiumGenerator(generatorPool)
            .getATokenAddress();
        IERC20(aTokenAddress).safeApprove(wethGatewayAddr, 0);
        IERC20(aTokenAddress).safeApprove(wethGatewayAddr, requestedETH);
        address aaveLendingPool = IPremiumGenerator(generatorPool)
            .getLendingPoolAddress();
        IWETHGateway(wethGatewayAddr).withdrawETH(
            aaveLendingPool,
            requestedETH,
            _to
        );
    }

    /**
     * @param _validatorIndex uint index of insured validator
     **/
    function applyForCoverage(
        uint _validatorIndex
    ) external onlyApply(_validatorIndex) {
        _callOracle(Strings.toString(_validatorIndex));
        beneficiaries[_validatorIndex] = Beneficiary(
            Status.AWAIT_ORACLE_ADD,
            msg.sender,
            0,
            0
        );
    }

    /**
     * @param _withdrawAddress address of beneficiary
     * @param _validatorIndex uint index of insured validator
     **/
    function addBeneficiary(
        address _withdrawAddress,
        uint _validatorIndex
    )
        external
        minimumReserveMet
        onlyAddApproved(_validatorIndex)
        onlyBeneficiary(_withdrawAddress, _validatorIndex)
        onlyPools
    {
        beneficiaries[_validatorIndex] = Beneficiary(
            Status.ACTIVE,
            _withdrawAddress,
            0,
            0
        );
    }

    function oracleResponse(
        uint _validatorIndex,
        uint8 _slashed,
        address _withdrawAddress,
        uint _loss
    ) external onlyOracle {
        if (beneficiaries[_validatorIndex].status == Status.AWAIT_ORACLE_CLAIM) {
            _oracleClaimResponse(_validatorIndex, _slashed, _withdrawAddress, _loss);
        }
        else if (beneficiaries[_validatorIndex].status == Status.AWAIT_ORACLE_ADD) {
            _oracleAddBeneResponse(_validatorIndex, _slashed, _withdrawAddress);
        }
        else{
            return;
        }
    }

    function _oracleAddBeneResponse(
        uint _validatorIndex,
        uint8 _slashed,
        address _withdrawAddress
    ) internal {
        //check withdraw address with oracle reponse
        //check validator is active with oracle response
        if (
            beneficiaries[_validatorIndex].withdrawAddress != _withdrawAddress ||
            _slashed == 1
        ) {
            beneficiaries[_validatorIndex].withdrawAddress = address(0);
            beneficiaries[_validatorIndex].status = Status.NOT_ACTIVE;
            emit DenyAddBeneficiary(
                _validatorIndex,
                _withdrawAddress,
                "address not correct or not set"
            );
        }
        else {
            beneficiaries[_validatorIndex].status = Status.ORACLE_ADD_APPROVE;
        }
    }

    function _oracleClaimResponse(
        uint _validatorIndex,
        uint8 _slashed,
        address _withdrawAddress,
        uint _loss
    ) internal {
        //check withdraw address with oracle reponse
        if (
            beneficiaries[_validatorIndex].withdrawAddress != _withdrawAddress
        ) {
            beneficiaries[_validatorIndex].status = Status.ACTIVE;
            emit DenyAddBeneficiary(
                _validatorIndex,
                _withdrawAddress,
                "withdrawAddress incorrect"
            );
        }
        //check if slashed
        else if (_slashed == 0) {
            beneficiaries[_validatorIndex].status = Status.ACTIVE;
            emit DenyAddBeneficiary(
                _validatorIndex,
                _withdrawAddress,
                "not slashed"
            );
        }
        //check loss is not 0
        else if (_loss == 0) {
            beneficiaries[_validatorIndex].status = Status.ACTIVE;
            emit DenyAddBeneficiary(
                _validatorIndex,
                _withdrawAddress,
                "not slashed"
            );
        }
        else {
            if(_loss > maxClaim){
                beneficiaries[_validatorIndex].status = Status.CLAIM_PAUSED;
            }
            else{
                beneficiaries[_validatorIndex].status = Status.CLAIM_WAIT_PERIOD;
            }
            beneficiaries[_validatorIndex].claimTimestamp = block.timestamp;
            beneficiaries[_validatorIndex].loss = _loss;
        }
    }

    function _callOracle(string memory _index) internal {
        string memory source =
            ("const validatorIndex = args[0]\n\
            const url = 'https://flask-service.rfqbhr834qlno.us-east-2.cs.amazonlightsail.com/status/'+validatorIndex.toString()\n\
            const cryptoCompareRequest = Functions.makeHttpRequest({\n\
                url: url,\n\
            })\n\
            const cryptoCompareResponse = await cryptoCompareRequest\n\
            if (cryptoCompareResponse.error) {\n\
                console.error(cryptoCompareResponse.error)\n\
                throw Error('Request failed')\n\
            }\n\
            const data = cryptoCompareResponse['data']\n\
            if (data.Response === 'Error') {\n\
                console.error(data.Message)\n\
                throw Error(`Functional error. Read message: ${data.Message}`)\n\
            }\n\
            let slashed = true;\n\
            if(!data['slashed']){\n\
                slashed = false;\n\
            }\n\
            if(data['withdrawAddress'] == '0x0'){\n\
                data['withdrawAddress'] = '0x0000000000000000000000000000000000000000'\n\
            }\n\
            let loss = data['loss'] * 1\n\
            const buffer = Buffer.alloc(1);\n\
            buffer.writeUInt8(slashed ? 1 : 0, 0)\n\
            const hexBool = buffer.toString('hex')\n\
            let hexIndex = data['index'].toString(16).padStart(64, '0')\n\
            let hexLoss = loss.toString(16).padStart(64, '0')\n\
            let result = Buffer.from(data['withdrawAddress'].slice(2)+hexBool+hexIndex+hexLoss, 'hex')\n\
            return Buffer.from(result)");
        bytes memory secrets;
        string[] memory args = new string[](1);
        args[0] = _index;
        uint64 sub = 902;
        uint32 gasLimit = 250000;
        IFunctionsConsumer(oracle).executeRequest(
            source,
            secrets,
            args,
            sub,
            gasLimit
        );
    }

    function makeClaim(
        uint _validatorIndex
    )
        public
        fromWithdrawAddress(msg.sender, _validatorIndex)
        onlyActiveBeneficiary(_validatorIndex)
    {
        string memory indexStr = Strings.toString(_validatorIndex);
        _callOracle(indexStr);
        beneficiaries[_validatorIndex].status = Status.AWAIT_ORACLE_CLAIM;
    }

    function payClaim(
        uint _validatorIndex
    )
        external
        onlyWaitPeriod(_validatorIndex)
        onlyTimeoutPassed(_validatorIndex)
    {
        address withdrawAddress = beneficiaries[_validatorIndex]
            .withdrawAddress;
        uint loss = beneficiaries[_validatorIndex].loss;
        _processOutflow(
            withdrawAddress,
            beneficiaries[_validatorIndex].loss
        );
        beneficiaries[_validatorIndex].status = Status.CLOSED;
        emit ProcessClaim(withdrawAddress, loss, "approve");
    }

    function denyClaim(
        uint _validatorIndex
    ) public onlyMultiSig onlyPausedClaim(_validatorIndex) {
        beneficiaries[_validatorIndex].status = Status.CLOSED;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            "deny"
        );
    }

    function pauseClaim(
        uint _validatorIndex
    ) public onlyMultiSig onlyWaitPeriod(_validatorIndex) {
        beneficiaries[_validatorIndex].status = Status.CLAIM_PAUSED;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            "pause"
        );
    }

    function unpauseClaim(
        uint _validatorIndex
    ) public onlyMultiSig onlyPausedClaim(_validatorIndex) {
        beneficiaries[_validatorIndex].status = Status.CLAIM_WAIT_PERIOD;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            "unpause"
        );
    }

    function resetClaim(
        uint _validatorIndex
    ) public onlyMultiSig {
        beneficiaries[_validatorIndex].status = Status.ACTIVE;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            "reset"
        );
    }

    function getPremiumHarvestNeeded(
        uint _requested
    ) public view returns (uint) {
        require(
            getProtocolBalance() >= _requested,
            "requested is larger than protocol balance"
        );

        if (address(this).balance >= _requested) {
            return 0;
        } else {
            return (_requested - address(this).balance);
        }
    }

    /**
     * @dev Emit WithdrawDeposit
     * @param _withdrawAddress address of beneficiary
     * @param _validatorIndex uint index of insured validator
     **/
    function withdrawBeneficiary(
        address _withdrawAddress,
        uint _validatorIndex
    )
        external
        fromWithdrawAddress(_withdrawAddress, _validatorIndex)
        onlyActiveBeneficiary(_validatorIndex)
        onlyPools
    {
        beneficiaries[_validatorIndex].status = Status.ORACLE_ADD_APPROVE;
        emit WithdrawBeneficiary(_validatorIndex, _withdrawAddress);
    }

    /**
     * @dev Emit Claim
     **/
    function _harvestInterest() internal {
        uint256 amount = IPremiumGenerator(generatorPool).withdrawInterest();
        emit Harvest(generatorPool, amount);
    }

    /**
     * @return multiSig address of multisig
     **/
    function getMultiSig() public view returns (address) {
        return multiSig;
    }

    /**
     * @return list of verified pools
     **/
    function getGeneratorPool() public view returns (address) {
        return generatorPool;
    }

    function getSlashingInsuranceETHAddress() public view returns (address) {
        return address(sliETH);
    }

    function getSlashingInsuranceETHBalance(
        address _depositor
    ) public view returns (uint) {
        return IERC20(getSlashingInsuranceETHAddress()).balanceOf(_depositor);
    }

    function getUnclaimedInterest() public view returns (uint) {
        return IPremiumGenerator(generatorPool).getUnclaimedInterest();
    }

    function getReserveATokenBalance() public view returns (uint) {
        address aTokenAddress = IPremiumGenerator(generatorPool)
                .getATokenAddress();

        return IERC20(aTokenAddress).balanceOf(address(this));
    }

    function getProtocolBalance() public view returns (uint) {
        return address(this).balance + getUnclaimedInterest() + getReserveATokenBalance();
    }

    function getSliETHTotalSupply() public view returns (uint) {
        return IERC20(getSlashingInsuranceETHAddress()).totalSupply();
    }

    function getSliETHConversion() public view returns (uint256) {
        return sliETH.getETHValuePerSliETH();
    }

    function getBeneficiaryStatus(
        uint _validatorIndex
    ) public view returns (Status status) {
        status = beneficiaries[_validatorIndex].status;
    }

    function getValidatorWithdrawAddress(
        uint _validatorIndex
    ) public view returns (address withdrawAddress) {
        withdrawAddress = beneficiaries[_validatorIndex].withdrawAddress;
    }

    function isPool(address _pool) public view returns(bool){
        return (_pool == generatorPool);
    }
}
