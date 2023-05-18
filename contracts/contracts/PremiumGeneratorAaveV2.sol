// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { ILendingPool} from './interfaces/aave/ILendingPool.sol';
import { ILendingPoolAddressesProvider} from './interfaces/aave/ILendingPoolAddressesProvider.sol';
import { IProtocolDataProvider } from './interfaces/aave/IProtocolDataProvider.sol';
import { PremiumGeneratorCore } from './PremiumGeneratorCore.sol';
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

 * @dev To be covered by a proxy contract
 * @dev deposits, withdraws, withdrawInterest controlled by the Reserve contract
 **/

contract PremiumGeneratorAaveV2 is ReentrancyGuard, PremiumGeneratorCore{

    address immutable lendingPoolAddressesProviderAddr;
    address immutable dataProviderAddr;

    /**
   * @dev Constructor.
   */
    constructor (
        //address _premiumDeposit,
        address _lendingPoolAddressesProviderAddr,
        address _dataProviderAddr,
        //address _reserve,
        address _multiSig,
        address _wethGatewayAddr,
        uint _premiumDeposit
    )PremiumGeneratorCore(
        _multiSig,
        _wethGatewayAddr,
        _premiumDeposit
    ){
        lendingPoolAddressesProviderAddr = _lendingPoolAddressesProviderAddr;
        dataProviderAddr = _dataProviderAddr;
    }

    /**
    * @dev Function updates total deposits.
    **/
    function deposit(uint _validatorIndex) external payable nonReentrant {
        address poolAddr = getLendingPoolAddress();
        _deposit(poolAddr, _validatorIndex);
    }

    /**
    * @notice Only called by Beneficiary reserve tokens for beneficiary.
    **/
    function withdraw(uint _validatorIndex) external nonReentrant {
        address aTokenAddress = getATokenAddress();
        address poolAddr = getLendingPoolAddress();
        _withdraw(poolAddr, aTokenAddress, _validatorIndex);
    }

    /**
    * @dev Function claims interest for reserve. Calls Aave pools exchanging this
    * contracts aTokens for reserve tokens for interestEarned amount.
    **/
    function withdrawInterest()external onlyReserve returns(uint256){
        address aTokenAddress = getATokenAddress();
        return _withdrawInterest(aTokenAddress);
    }

    /**
    * @return poolAddr AAVE lending pool address
    **/
    function getLendingPoolAddress() public view returns(address poolAddr){
        return ILendingPoolAddressesProvider(lendingPoolAddressesProviderAddr).getLendingPool();
    }

    /**
    * @return aTokenAddress address of Aave's aToken for asset
    **/
    function getATokenAddress() public view returns(address){
        (address aTokenAddress,,) = IProtocolDataProvider(dataProviderAddr).getReserveTokensAddresses(wethAddress);
        return aTokenAddress;
    }

     /**
    * @return unclaimedInterest accrued interest that has not yet been claimed
    **/
    function getUnclaimedInterest() public view returns (uint256){
        address aTokenAddress = getATokenAddress();
        return _getUnclaimedInterest(aTokenAddress);
    }

    /**
    * @return aTokenBalance Pool balance of aToken for the asset
    **/
    function getATokenBalance() public view returns (uint256){
        address aTokenAddress = getATokenAddress();
        return _getATokenBalance(aTokenAddress);
    }

    /**
    * @return normalizedIncome reserve's normalized income
    */
    function getReserveNormalizedIncome() public view returns(uint256){
        address lendingPoolAddr = ILendingPoolAddressesProvider(lendingPoolAddressesProviderAddr).getLendingPool();
        return ILendingPool(lendingPoolAddr).getReserveNormalizedIncome(wethAddress);
    }

    /**
    * @return liquidityIndex reserve's liquidity index
    */
    function getAaveLiquidityIndex() public view returns(uint256 liquidityIndex){
        (,,,,,,,liquidityIndex,,) = IProtocolDataProvider(dataProviderAddr).getReserveData(wethAddress);
    }

    /**
    * @notice Returns asset specific pool information
    * @return reserve address of reserve
    * @return interestWithdrawn amount of interest withdrawn
    * @return deposits amount of ETH/WETH deposited in contract
    * @return premiumDeposit amount of ETH required for a deposit
    * @return liquidityIndex reserve's liquidity index
    * @return normalizedIncome reserve's normalized income
    * @return aTokenBalance Pool balance of aToken for the asset
    * @return claimedInterest interest that has been claimed (no longer in contract)
    * @return unclaimedInterest accrued interest that has not yet been claimed
    * @return aTokenAddress address of Aave's aToken for asset
    */
    function getPoolInfo() external view returns(address, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, address){
        return(reserve, interestWithdrawn, deposits, premiumDeposit, getAaveLiquidityIndex(),
                getReserveNormalizedIncome(), getATokenBalance(), getClaimedInterest(),
                getUnclaimedInterest(), getATokenAddress());
    }
}