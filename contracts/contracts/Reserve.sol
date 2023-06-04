// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;


import {SafeERC20} from "./libraries/SafeERC20.sol";
import {IERC20} from "./interfaces/other/IERC20.sol";
import {IWETHGateway} from "./interfaces/aave/IWETHGateway.sol";
import {IPremiumGenerator} from "./interfaces/protocol/IPremiumGenerator.sol";
import { IOracleGateway } from "./interfaces/protocol/IOracleGateway.sol";
import {SlashingInsuranceETH} from "./SlashingInsuranceETH.sol";
import { Authenticator } from "./Authenticator.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//AAVE V2
import {ILendingPool} from "./interfaces/aave/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "./interfaces/aave/ILendingPoolAddressesProvider.sol";
import {IProtocolDataProvider} from "./interfaces/aave/IProtocolDataProvider.sol";


/**
 * @title Ethereum Slashing Insurance (SLI) Reserve contract
 * @author smeee
 * @notice This is a proof of concept starter contract for lossless insurance
 *
 * Aave v2 is used to generate interest from beneficiary premium deposits
 * Premium is returned to beneficiary when Policy terminated (validator
 * exits from staking or simply no longer wishes to have insurance).
 * Interest is accrued in Reserve to cover validator slashing claims.
 *
 * Chainlink Functions is used as an oracle to access the validator stats
 * such as slashing, loss, and withdrawal credentials associated with a
 * validator Id.
 *
 * Claims Fund is funded by sliETH.
 *
 * Reserve contract controls deposit calls to Aave for funds held in Reserve.
 *
 * @dev Deposits, withdraws, and claims for Aave Pools
 **/
contract Reserve is ReentrancyGuard, Authenticator{
    using SafeERC20 for IERC20;

    SlashingInsuranceETH immutable sliETH;

    event DenyApplication(uint validatorIndex,address withdrawAddress,uint8 reason);
    event ApproveApplication( uint validatorIndex, address withdrawAddress);
    event ProvideInsurance(address depositor, uint ethAmount);
    event WithdrawInsurance(address depositor, uint ethAmount, uint sliETHAmount);
    event DenyClaim(uint validatorIndex,address withdrawAddress,uint8 reason);
    event AcceptClaim(uint validatorIndex,address withdrawAddress);
    event AddBeneficiary(uint validatorIndex, address withdrawAddress);
    event WithdrawBeneficiary(uint validatorIndex, address withdrawAddress);
    event MakeClaim(uint validatorIndex);
    event ProcessClaim(address beneficiary, uint amount, uint8 result);

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
    ) Authenticator(
        _multiSig,
        _generatorPool,
        _wethGatewayAddr,
        _minimumProvide,
        _minimumReserve,
        _maxClaim,
        _oracle,
        _oracleGateway
    ){
        sliETH = new SlashingInsuranceETH();
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
        emit ProvideInsurance(msg.sender, msg.value);
    }

    function withdrawInsurance(uint _sliETHAmount) external nonReentrant {
        uint requestedETH = sliETH.getETHValue(_sliETHAmount);
        require(
            minimumReserve < (getProtocolBalance() - requestedETH),
            "reserve insufficient to withdraw insurance"
        );
        sliETH.burn(msg.sender, _sliETHAmount);
        _processOutflow(msg.sender, requestedETH);
        emit WithdrawInsurance(msg.sender, requestedETH, _sliETHAmount);
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
        IOracleGateway(oracleGateway).callOracle(Strings.toString(_validatorIndex));
        beneficiaries[_validatorIndex] = Beneficiary(
            Status.AWAIT_ORACLE_ADD,
            msg.sender,
            0,
            0,
            0
        );
        depositors[msg.sender].push(_validatorIndex);
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
        onlyAddApproved(_validatorIndex)
        onlyBeneficiary(_withdrawAddress, _validatorIndex)
        onlyInApplyWindow(_validatorIndex)
        onlyPools
    {
        beneficiaries[_validatorIndex].status = Status.ACTIVE;
        emit AddBeneficiary(_validatorIndex, _withdrawAddress);
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
            emit DenyApplication(
                _validatorIndex,
                _withdrawAddress,
                0 //address not correct or validator slashed
            );
        }
        else {
            beneficiaries[_validatorIndex].status = Status.ORACLE_ADD_APPROVE;
            beneficiaries[_validatorIndex].applyTimestamp = block.timestamp;
            emit ApproveApplication(_validatorIndex, _withdrawAddress);
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
            emit DenyClaim(
                _validatorIndex,
                _withdrawAddress,
                0//"withdrawAddress incorrect"
            );
        }
        //check if slashed
        else if (_slashed == 0 || _loss == 0) {
            beneficiaries[_validatorIndex].status = Status.ACTIVE;
            emit DenyClaim(
                _validatorIndex,
                _withdrawAddress,
                1//"not slashed"
            );
        }
        else {
            if(_loss > maxClaim){
                beneficiaries[_validatorIndex].status = Status.CLAIM_PAUSED;
                emit DenyClaim(
                _validatorIndex,
                _withdrawAddress,
                2//exceeds max claim and has to be reviewed
            );
            }
            else{
                beneficiaries[_validatorIndex].status = Status.CLAIM_WAIT_PERIOD;
                emit AcceptClaim(_validatorIndex, _withdrawAddress);
            }
            beneficiaries[_validatorIndex].claimTimestamp = block.timestamp;
            beneficiaries[_validatorIndex].loss = _loss;
        }
    }

    function makeClaim(
        uint _validatorIndex
    )
        public
        fromWithdrawAddress(msg.sender, _validatorIndex)
        onlyActiveBeneficiary(_validatorIndex)
    {
        IOracleGateway(oracleGateway).callOracle(Strings.toString(_validatorIndex));
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
        emit ProcessClaim(
            withdrawAddress,
            loss,
            0//approve
            );
    }

    function denyClaim(
        uint _validatorIndex
    ) public onlyMultiSig onlyPausedClaim(_validatorIndex) {
        beneficiaries[_validatorIndex].status = Status.CLOSED;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            1//deny
        );
    }

    function pauseClaim(
        uint _validatorIndex
    ) public onlyMultiSig onlyWaitPeriod(_validatorIndex) {
        beneficiaries[_validatorIndex].status = Status.CLAIM_PAUSED;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            2//pause
        );
    }

    function unpauseClaim(
        uint _validatorIndex
    )
        public
        onlyMultiSig
        onlyPausedClaim(_validatorIndex)
    {
        beneficiaries[_validatorIndex].status = Status.CLAIM_WAIT_PERIOD;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            3//"unpause"
        );
    }

    function resetClaim(
        uint _validatorIndex
    ) public onlyMultiSig {
        beneficiaries[_validatorIndex].status = Status.ACTIVE;
        emit ProcessClaim(
            beneficiaries[_validatorIndex].withdrawAddress,
            0,
            4//"reset"
        );
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
        beneficiaries[_validatorIndex].status = Status.NOT_ACTIVE;
        emit WithdrawBeneficiary(_validatorIndex, _withdrawAddress);
    }

    /**
     * @dev Emit Claim
     **/
    function _harvestInterest() internal {
        uint256 amount = IPremiumGenerator(generatorPool).withdrawInterest();
    }

    function getSlashingInsuranceETHAddress() public view returns (address) {
        return address(sliETH);
    }

    function getSlashingInsuranceETHBalance(
        address _depositor
    ) public view returns (uint) {
        return IERC20(getSlashingInsuranceETHAddress()).balanceOf(_depositor);
    }

    function getDepositorValidatorIds(address _withdrawAddress) public view returns(uint[] memory){
        return depositors[_withdrawAddress];
    }

    function getReserveATokenBalance() public view returns (uint) {
        address aTokenAddress = IPremiumGenerator(generatorPool)
                .getATokenAddress();

        return IERC20(aTokenAddress).balanceOf(address(this));
    }

    function getProtocolBalance() public view returns (uint) {
        return (
            address(this).balance +
            IPremiumGenerator(generatorPool).getUnclaimedInterest() +
            getReserveATokenBalance()
        );
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

    function getBeneficiaryInfo(
        uint _validatorIndex
    ) public view returns (Beneficiary memory) {
        return beneficiaries[_validatorIndex];
    }
}