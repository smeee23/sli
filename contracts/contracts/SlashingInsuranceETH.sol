// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IReserve} from "./interfaces/protocol/IReserve.sol";

contract SlashingInsuranceETH is ERC20 {

    address[] allowed;
    address reserve;

    //Events
    event ETHDeposited(address indexed from, uint256 amount, uint256 time);
    event TokensMinted(address indexed to, uint256 amount, uint256 ethAmount, uint256 time);
    event TokensBurned(address indexed from, uint256 amount, uint256 ethAmount, uint256 time);

    /**
    * @dev Only Reserve can call functions marked by this modifier.
    **/
    modifier onlyReserve(){
        require(reserve == msg.sender, "not the owner");
        _;
    }

    // Construct with our token details
    constructor() ERC20("Slashing Insurance ETH", "sliETH") {
        reserve = msg.sender;
    }

    // Receive an ETH deposit and reroute to reserve
    /*receive() external payable {
        IReserve(reserve).depositETHViaSLI{value: msg.value}(msg.sender);
        emit ETHDeposited(msg.sender, msg.value, block.timestamp);
    }*/

    function getETHValue(uint256 _sliETHAmount) public view returns (uint256) {
        // Get network balances
        uint256 reserveETH = getReserveBalance();
        uint256 sliETHSupply = totalSupply();
        // Use 1:1 ratio if no sliETH is minted
        if (sliETHSupply == 0) { return _sliETHAmount; }
        // Calculate and return
        return (_sliETHAmount * reserveETH) / sliETHSupply;
    }

    // Calculate the amount of sliETH backed by an amount of ETH
    function getSliETHValue(uint256 _ethAmount) public view returns (uint256) {
        // Get network balances
        uint256 reserveETH = getReserveBalance() - _ethAmount;
        uint256 sliETHSupply = totalSupply();
        // Use 1:1 ratio if no sliETH is minted
        if (sliETHSupply == 0) { return _ethAmount; }
        // Check network ETH balance
        require(reserveETH > 0, "Cannot calculate sliETH token amount while reserve balance is zero");
        // Calculate and return
        return (_ethAmount * sliETHSupply ) / reserveETH;
    }

    // Calculate the amount of ETH backing 1 slashing insurance ETH
    function getETHValuePerSliETH() public view returns (uint256) {
        // Get network balances
        uint256 reserveETH = getReserveBalance();
        uint256 sliETHSupply = totalSupply();
        if (sliETHSupply == 0 || reserveETH == 0) { return 0; }
        return ((1 ether) * reserveETH ) / sliETHSupply;
    }

    // Mint sliETH
    // Only accepts calls from the Reserve contract
    function mint(address _to, uint256 _ethAmount) external onlyReserve {
        // Get sliETH amount
        uint256 sliETHAmount = getSliETHValue(_ethAmount);
        // Check sliETH amount
        require(sliETHAmount > 0, "Invalid token mint amount");
        // Update balance & supply
        _mint(_to, sliETHAmount);
        // Emit tokens minted event
        emit TokensMinted(_to, sliETHAmount, _ethAmount, block.timestamp);
    }

    // Burn sliETH for ETH
    // Only accepts calls from the Reserve contract
    function burn(address _from, uint256 _sliETHAmount) external onlyReserve {
        // Check sliETH amount
        require(_sliETHAmount > 0, "Invalid token burn amount");
        require(balanceOf(_from) >= _sliETHAmount, "Insufficient sliETH balance");
        // Get ETH amount
        uint256 ethAmount = getETHValue(_sliETHAmount);
        // Update balance & supply
        _burn(_from, _sliETHAmount);
        // Emit tokens burned event
        emit TokensBurned(msg.sender, _sliETHAmount, ethAmount, block.timestamp);
    }

    function getReserveBalance() public view returns(uint){
        return IReserve(reserve).getProtocolBalance();
    }

    receive() external payable{}

}