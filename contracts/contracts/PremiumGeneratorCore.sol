// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IERC20} from './interfaces/other/IERC20.sol';
import { IWETHGateway} from './interfaces/aave/IWETHGateway.sol';
import { SafeERC20 } from './libraries/SafeERC20.sol';
import { IReserve} from './interfaces/protocol/IReserve.sol';
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PremiumGenerator contract
 * @author smeee
 * This is a contract for lossless insurance premiums using Aave v3

   Aave is used to generate interest for insurance applications

   Beneficiaries deposit tokens into PremiumGenerator which deposit
   them into Aave lending protocol

   The interest earned is directed to the reserve associated with
   the PremiumGenerator

   Beneficiaries can claim their funds (and terminate their policy) at any time.

   Functions withdraw() and withdrawInterest() directly call the aave Pool

   Deposits are done through the Reserve contract to minimize approvals for ERC20's

 * @dev To be covered by a proxy contract
 * @dev deposits, withdraws, withdrawInterest controlled by the Reserve contract
 **/

contract PremiumGeneratorCore is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint public interestWithdrawn;
    uint public deposits;
    uint public premiumDeposit;

    //address immutable lendingPoolAddressesProviderAddr;
    //address immutable dataProviderAddr;
    address immutable wethGatewayAddr;
    address immutable wethAddress;
    address public reserve;
    address immutable public multiSig;


    /**
    * @dev Only tokens that are on the accepted list can be passed
    * to functions marked by this modifier.
    **/
    modifier correctValue(){
        require(msg.value == premiumDeposit, "value sent must be equal to premium deposit");
        _;
    }

    /**
    * @dev Only Reserve can call functions marked by this modifier.
    **/
    modifier onlyReserve(){
        require(reserve == msg.sender, "not the owner");
        _;
    }

     /**
  * @dev Only MultiSig can call functions marked by this modifier.
  **/
  modifier onlyMultiSig(){
      require(multiSig == msg.sender, "not the owner");
      _;
  }

    /**
   * @dev Constructor.
   */
    constructor (
        address _multiSig,
        address _wethGatewayAddr,
        uint _premiumDeposit
    ){
        multiSig = _multiSig;
        premiumDeposit = _premiumDeposit;
        wethGatewayAddr = _wethGatewayAddr;
        wethAddress = IWETHGateway(wethGatewayAddr).getWETHAddress();
        //lendingPoolAddressesProviderAddr = _lendingPoolAddressesProviderAddr;
        //dataProviderAddr = _dataProviderAddr;
    }

    /**
    * @notice Only called by PoolTracker.
    * @dev Function updates total deposits.
    * @param _poolAddr aave lending pool address
    **/
    function _deposit(address _poolAddr, uint _validatorIndex) internal correctValue{
        deposits += premiumDeposit;
        IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(_poolAddr, address(this), 0);
        IReserve(reserve).addBeneficiary(msg.sender, _validatorIndex);
    }

    /**
    * @notice Only called by PoolTracker.
    * @dev Function updates total deposits.
    * @param _poolAddr aave lending pool address
    **/
    function _reserveDeposit(address _poolAddr) internal {
        IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(_poolAddr, reserve, 0);
    }

    /**
    * @notice Only called by Beneficiary reserve tokens for beneficiary.
    * @param _poolAddr aave lending pool address
    * @param _aTokenAddress aave atoken address for aWETH
    **/
    function _withdraw(address _poolAddr, address _aTokenAddress, uint _validatorIndex) internal {
        deposits -= premiumDeposit;
        IERC20(_aTokenAddress).safeApprove(wethGatewayAddr, 0);
        IERC20(_aTokenAddress).safeApprove(wethGatewayAddr, premiumDeposit);
        IWETHGateway(wethGatewayAddr).withdrawETH(_poolAddr, premiumDeposit, msg.sender);
        IReserve(reserve).withdrawBeneficiary(msg.sender, _validatorIndex);
    }

    /**
    * @dev Function claims amount of interest for reserve. Calls Aave pools exchanging this
    * contracts aTokens for reserve tokens for interestEarned amount.
    * @param _aTokenAddress aave atoken address for aWETH
    **/
    function _withdrawInterest(address _aTokenAddress) internal returns(uint256){
        uint256 aTokenBalance = IERC20(_aTokenAddress).balanceOf(address(this));
        uint256 interestEarned = aTokenBalance - deposits;
        if(interestEarned > 0){
            IERC20(_aTokenAddress).safeTransfer(reserve, interestEarned);
        }
        return interestEarned;
    }

    /**
    * @notice Only called by Reserve.
    * @dev Function claims interest for reserve. Calls Aave pools exchanging this
    * contracts aTokens for reserve tokens for interestEarned amount.
    **/
    function setPremiumDeposit(uint _premiumDeposit)external onlyReserve {
        premiumDeposit = _premiumDeposit;
    }

    /**
    * @param _reserve address of reserve.
    **/
    function setReserve(address _reserve) external onlyMultiSig {
        require(reserve == address(0), "reserve already set");
        reserve = _reserve;
    }


    /**
    * @return unclaimedInterest accrued interest that has not yet been claimed
    **/
    function _getUnclaimedInterest(address _aTokenAddress) internal view returns (uint256){
        uint256 aTokenBalance = IERC20(_aTokenAddress).balanceOf(address(this));
        return aTokenBalance - deposits;
    }

    /**
    * @return claimedInterest interest that has been claimed (no longer in contract)
    **/
    function getClaimedInterest() public view returns (uint256){
        return interestWithdrawn;
    }

    /**
    * @return aTokenBalance Pool balance of aToken for the asset
    **/
    function _getATokenBalance(address _aTokenAddress) public view returns (uint256){
        return IERC20(_aTokenAddress).balanceOf(address(this));
    }
}