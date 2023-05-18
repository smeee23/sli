// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IPool} from './interfaces/aave/IPool.sol';
import { IPoolAddressesProvider} from './interfaces/aave/IPoolAddressesProvider.sol';
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

   Deposits are done through the Reserve contract to minimize approvals for ERC20's

 * @dev To be covered by a proxy contract
 * @dev deposits, withdraws, withdrawInterest controlled by the Reserve contract
 **/

contract PremiumGeneratorAaveV3 is ReentrancyGuard, PremiumGeneratorCore {

    address immutable poolAddressesProviderAddr;

    /**
   * @dev Constructor.
   */
    constructor(
        address _poolAddressesProviderAddr,
        address _multiSig,
        address _wethGatewayAddr,
        uint _premiumDeposit
    ) PremiumGeneratorCore(
        _multiSig,
        _wethGatewayAddr,
        _premiumDeposit
    ){
        poolAddressesProviderAddr = _poolAddressesProviderAddr;
    }

    /**
    * @notice Only called by non-beneficiaries
    * @dev Function updates total deposits.
    **/
    function deposit(uint _validatorIndex) nonReentrant external payable{
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
        return IPoolAddressesProvider(poolAddressesProviderAddr).getPool();
    }

    /**
    * @return aTokenAddress address of Aave's V3 aToken for aWETH
    **/
    function getATokenAddress() public view returns(address aTokenAddress){
        address poolAddr = IPoolAddressesProvider(poolAddressesProviderAddr).getPool();
        return IPool(poolAddr).getReserveData(wethAddress).aTokenAddress;
    }

    /**
    * @return unclaimedInterest accrued interest that has not yet been claimed
    **/
    function getUnclaimedInterest() public view returns (uint256){
        address aTokenAddress = getATokenAddress();
        return _getUnclaimedInterest(aTokenAddress);
    }

    function getStats() public view returns (uint256){
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
        address poolAddr = IPoolAddressesProvider(poolAddressesProviderAddr).getPool();
        return IPool(poolAddr).getReserveNormalizedIncome(wethAddress);
    }

    /**
    * @return liquidityIndex reserve's liquidity index
    */
    function getAaveLiquidityIndex() public view returns(uint256 liquidityIndex){
        address poolAddr = IPoolAddressesProvider(poolAddressesProviderAddr).getPool();
        liquidityIndex = IPool(poolAddr).getReserveData(wethAddress).liquidityIndex;
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