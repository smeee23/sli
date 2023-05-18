var Reserve = artifacts.require("Reserve");
var PoolAddressesProviderMock = artifacts.require("PoolAddressesProviderMock");
var PoolMock = artifacts.require("PoolMock");
var WethGatewayTest = artifacts.require("WethGatewayTest");
var aTestToken = artifacts.require("aTestToken");
var TestToken = artifacts.require("TestToken");
var OracleMock = artifacts.require("OracleMock");

//var PremiumGeneratorAaveV3 = artifacts.require("PremiumGeneratorAaveV3");
var PremiumGeneratorAaveV2 = artifacts.require("PremiumGeneratorAaveV2");
var LendingPoolAddressesProviderMock = artifacts.require("LendingPoolAddressesProviderMock");
var ProtocolDataProviderMock = artifacts.require("ProtocolDataProviderMock");

var ValidatorOracleClaim = artifacts.require("ValidatorOracleClaim");

require("dotenv").config({path: "../.env"});

module.exports = async function(deployer, network, accounts){
  let poolAddressesProviderAddr;
  let wethGatewayAddr;
  let multiSig;
  console.log('network', network);

  if(["matic_mumbai"].includes(network) ){
    multiSig = "0x78726673245fdb56425c8bd782f6FaA3E447625A";
    await deployer.deploy(ValidatorOracleClaim, multiSig);
  }
  else if(["goerli", "goerli-fork"].includes(network) ){
    multiSig = "0x78726673245fdb56425c8bd782f6FaA3E447625A";
    await deployer.deploy(ValidatorOracleClaim, multiSig);
  }
  else {
    await deployer.deploy(PoolMock);
    await deployer.deploy(WethGatewayTest);
    await deployer.deploy(PoolAddressesProviderMock);
    await deployer.deploy(aTestToken);
    await deployer.deploy(TestToken);
    await deployer.deploy(LendingPoolAddressesProviderMock, PoolMock.address);
    await deployer.deploy(ProtocolDataProviderMock, aTestToken.address);
    multiSig = accounts[0];
    await deployer.deploy(OracleMock, multiSig);

    wethGatewayTest = await WethGatewayTest.deployed();
    oracleMock = await OracleMock.deployed();
    poolAddressesProviderMock = await PoolAddressesProviderMock.deployed();
    await poolAddressesProviderMock.setPoolImpl(PoolMock.address);
    poolAddressesProviderAddr = poolAddressesProviderMock.address;
    lendingPoolAddressesProviderMock = await LendingPoolAddressesProviderMock.deployed();
    protocolDataProviderMock = await ProtocolDataProviderMock.deployed();
    wethGatewayAddr = wethGatewayTest.address;

    //await deployer.deploy(PremiumGeneratorAaveV3, poolAddressesProviderAddr, multiSig, wethGatewayAddr, "1000000000000000000");
    //premiumGeneratorAaveV3 = await PremiumGeneratorAaveV3.deployed();

    await deployer.deploy(PremiumGeneratorAaveV2, lendingPoolAddressesProviderMock.address, protocolDataProviderMock.address, multiSig, wethGatewayAddr, "1000000000000000000");
    premiumGeneratorAaveV2 = await PremiumGeneratorAaveV2.deployed();

    await deployer.deploy(Reserve, multiSig, premiumGeneratorAaveV2.address, wethGatewayAddr, "100000000000000", "100000000000000000000", "100000000000", oracleMock.address);
  }


};
