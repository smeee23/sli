---
layout: default
title: about
---

<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {
  font-family: "Lato", sans-serif;
  margin-left: 200px;
}

.hidden {
  display: none;
}

.sidenav {
  height: 100%;
  width: 200px;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  transition: 0.5s;
  padding-top: 60px;
}

.sidenav a {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 15px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

.sidenav p {
  padding: 8px 8px 8px 16px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

.sidenav a:hover {
  color: #f1f1f1;
}

.sidenav .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

@media screen and (max-height: 450px) {
  .sidenav {padding-top: 15px;}
  .sidenav a {font-size: 18px;}
}
</style>
</head>
<body>

<div id="mySidenav" class="sidenav">
  <p>General</p>
  <a href="#" onclick="setText('about')">About</a>
  <a href="#" onclick="setText('donations')">Lossless Donations</a>
  <a href="#" onclick="setText('cause')">Your Cause</a>
  <a href="#" onclick="setText('faq')">FAQ</a>
  <a href="#" onclick="setText('risks')">Risks</a>

  <p>Contracts</p>
  <a href="#" onclick="setText('summary')">Contract Overview</a>
  <a href="#" onclick="setText('poolTracker')">PoolTacker</a>
  <a href="#" onclick="setText('depositorNFT')">JCDepositorERC721</a>
  <a href="#" onclick="setText('justCausePool')">JustCausePool</a>
</div>

<div id="logo" markdown="1">
  ![jc_logo](https://user-images.githubusercontent.com/85646760/170550529-6cd84d59-b1c6-496c-810c-0242cf9eb843.png)
</div>

<div id="home" markdown="1">

# About Us

JustCause is a crowdfunding platform that allows users to leverage the power of defi to fund causes that are important to them. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal causes, and much more.

Users participate as either Contributors or Pool Creators. Pool Creators generate JustCause Pools representing a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into Aave’s lending protocol. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds, they simply withdraw their original deposit and the interest accrued is left behind for the cause.

# Our Mission

JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools with a user interface or interact directly with the smart contracts on the network. This freedom lies at the heart of the difference between permissioned (closed) and permissionless (open) systems.

Our mission is to give users the freedom to create and fund any cause they deem worthy. Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem.

</div>



<div id="summary" class="hidden" markdown="1">

## Contract Overview

PoolTracker, JustCausePool, and JCDepositorERC721 are the three contracts in the JustCause protocol. Together these contracts allow for four main processes: pool creation, deposit, withdraw, and claim

PoolTracker coordinates all major functionality of the protocol. It is the only address with permission to execute the pool creation, deposit, withdraw, and claim processes in JustCause.

### Pool Creation

To create a new pool the `createJCPoolClone` method of PoolTracker is called. This method generates proxy contracts for both JustCausePool and JCDepositorERC721. In the JustCause protocol each pool/cause has its own JustCausePool smart contract clone and ERC721 token.

The JustCausePool contract stores the user deposits in the form of [aTokens](https://docs.aave.com/developers/tokens/atoken) keeping track of the total deposits for each of the accepted assets.

The JCDepositorERC721 contract acts as an on-chain receipt of user deposits into the JustCausePool. Individual contributor’s deposit information is stored and updated in the ERC721 contract.

### Deposit

When contributors deposit into pools the `addDeposit` method of PoolTracker is called. The PoolTracker contract is the point of contact for deposits into Aave liquidity pools. The JustCausePool and JCDepositorERC721 are sent the deposit information to update the balances accordingly.

### Withdraw

When contributors want to withdraw their deposits the `withdrawDeposit` method of PoolTracker is called. The JustCausePool contract is the point of contact for withdrawals from Aave liquidity pools. The contributor’s balance is updated in the JCDepositorERC721 contract.

### Claim

When any user wishes to claim the donations from Aave and send them to the receiver address the `claimInterest` method of PoolTracker is called. Claims work similar to withdrawals except that the amount withdrawn is the JustCausePool balance of aTokens subtracted by the total deposits for a given token.

</div>

<div id="about" class="hidden" markdown="1">

# About Us

JustCause is a crowdfunding platform that allows users to leverage the power of defi to fund causes that are important to them. We use an innovative funding mechanism to allow users to contribute to public goods, charitable organizations, DAOs, local/global/personal causes, and much more.

Users participate as either Contributors or Pool Creators. Pool Creators generate JustCause Pools representing a cause in need of funding. Contributors deposit tokens into JustCause Pools which in turn deposit them into Aave’s lending protocol. The interest earned is donated to the cause associated with the Pool. When Contributors need access to their funds, they simply withdraw their original deposit and the interest accrued is left behind for the cause.

# Our Mission

JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools with a user interface or interact directly with the smart contracts on the network. This freedom lies at the heart of the difference between permissioned (closed) and permissionless (open) systems.

Our mission is to give users the freedom to create and fund any cause they deem worthy. Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem.

</div>

<div id="donations" class="hidden" markdown="1">

# Lossless Donations

JustCause smart contracts let users give to charity without actually giving their hard earned money!

### Aave

JustCause Pools generate interest through an integration with the [Aave lending protocol](https://docs.aave.com/hub/). Aave can be thought of as an automated system of liquidity pools. Users deposit tokens they want to lend out, which are amassed into reserve pools. Borrowers may then draw from these pools by taking out collateralized loans. In exchange for providing liquidity to the market lenders earn a passive rate of interest on their deposits.

With lending protocols like Aave risk exists because the financial value behind the collateral and borrowed debt can fluctuate significantly due to the volatility of crypto markets. To mitigate this risk, Aave requires loans to be overcollateralized, meaning the collateral is always worth more than the debt being borrowed. To maintain solvency, positions nearing under collateralization are liquidated (collateral is sold to pay back the debt), protecting lenders and keeping all positions over 100% collateralized.

The Aave Protocol has been audited, and has an ongoing bug bounty program. It secures tens of billions of dollars of value. The protocol is completely open source, allowing anyone to interact and build on top of it. Every possible step has been taken to minimize the risk as much as possible. However, no platform can be considered entirely risk free. Please see the [Aave risk framework](https://docs.aave.com/risk/) for more details.

### Fund a Cause

Through lossless donations, JustCause is able to charge no fees to Contributors. To donate users go to the Dashboard to see JustCause's Verified Pools. Alternatively, users search for user generated pools by name or contract address.

Users share causes they create or feel passionate about on social media by clicking the share icons in the  Pool. This creates a post with a link on the platform for friends to follow and contribute.

Contributors are able to see and withdraw deposits from pools they have contributed to under Contributions in the Dashboard tab. 

### Contributor NFT’s

Another unique feature of JustCause is that the deposit information for the users and pool creators is stored on-chain in the form of an NFT’s (non-fungible tokens). A Pool Creator has the option of uploading an image at the time of pool creation. An NFT is generated of the image for the Contributors to the pool. The Contributor’s token acts as an on-chain receipt by storing data on their funds deposited in the Pool. It is for this reason that contributor NFT’s are non-transferable. The only way to get one is to deposit for the cause.

</div>

<div id="cause" class="hidden" markdown="1">

# Your Cause

We want to make it so anyone can create and fund a cause on JustCause.

Every cause on JustCause is funded through a Pool. Think of a Pool as a savings account that generates interest on deposits. Any interest generated gets automatically donated to the cause. JustCause has two types of pools: Verified Pools and User pools.

### Verified Pools

Verified pools are created by the team, and the recipient of the funds are known and established entities.  In short, any user who contributes knows where the donations are going.

All verified pools can be found under verified causes in the Dashboard tab.

### User Pools

User pools are generated by pool creators utilizing the protocol’s smart contracts. The recipients of the funds are specified by the creators at the time of generation.

It is important to note that anyone can create a user pool for any reason. More importantly, the allocation of funds cannot be accounted for in most circumstances. Therefore, it is crucial that users take caution when contributing to user pools. We advise only contributing to user pools when both the pool creator and receiver are trusted entities.

User pools can be found by searching by name or contract address.

### Your Cause

Donations must be claimed through a transaction on the blockchain. No fee is charged by JustCause.


</div>

<div id="faq" class="hidden" markdown="1">

# FAQ

---

### What is JustCause?

JustCause is a decentralized non-custodial crowdfunding protocol where users participate as Contributors or Pool Creators. Contributors deposit funds that are used in the Aave lending protocol to generate donations for public goods, charitable organizations, DAOs, local/global/personal causes, and much more.

---

### Where are my deposited funds stored?

Your funds are allocated in a smart contract. The code of the smart contract is public, open source, and audited by third party auditors. You can withdraw your funds from the pool at any time.

---

### How do I interact with the JustCause protocol?

[JustCause dApp](https://www.justcause.finance/#/) is currently deployed on the Polygon PoS (proof of stake) network.

Users have the option to run the dApp locally by following the setup guide in our [readme file](https://github.com/smeee23/just_cause/blob/main/README.md).

---

### What is Polygon PoS?

Polygon is a decentralised Ethereum scaling platform that enables developers to build scalable user-friendly dApps with low transaction fees.

See: [Getting started on the Polygon PoS chain](https://wallet.polygon.technology/)

---

### What is the cost of donating with JustCause protocol?

Contributors receive their full deposit back upon withdrawal, minus network transaction fees. Interacting with the protocol requires transactions and thus transaction fees on the Polygon PoS blockchain.

---

### What fee does JustCause charge?

No fee is charged by JustCause. However, a fee mechanism is built into the contracts. This rate can be raised to as high as 0.4% or lowered to 0 by the team to find an equilibrium that supports the causes as well as JustCause in the long run. This can only be done by the team multisig address. There are no plans to turn on the fee mechanism. 


---


### Why use JustCause?

JustCause is an open source, permissionless and non-custodial protocol. This means that anyone has the freedom to create or contribute to pools.

Crowdfunding mechanisms based on traditional financial payment networks are inherently permissioned and custodial. This leaves the funds and users of these systems vulnerable to financial censorship. We want to solve this problem.

---

### What causes are allowed?

Our mission is to give users the freedom to create and fund any cause they deem worthy. Our contracts are immutable and permissionless by design. Anyone has the right to create a user cause and publish it on our user interface (ui). While anyone can interact with our contracts and [github respository](https://github.com/smeee23/just_cause) we do reserve the right to remove causes from our team operated front end. This would only be done in extreme cases, eg. promotion of violence of any kind.

The team has no control over user funds deposited into pools.

---

### Is there any risk?

The risks related to the JustCause platform are the smart contract risk (risk of a bug within the protocol code and the Aave protocol code) and liquidation risk (risk on the collateral liquidation process on Aave). Every possible step has been taken to minimize the risk as much as possible-- the protocol code is public and open source and it has been audited.

---

### How much will my contributions donate?

JustCause Pools receive continuous earnings from Aave that evolve with market conditions based on:

The interest rate payment on loans – on Aave depositors share the interests paid by borrowers corresponding to the average borrow rate times the utilization rate. The higher the utilization of a reserve the higher the yield for depositors.

Flash Loan fees – on Aave depositors receive a share of the Flash Loan fees corresponding to .09% of the Flash Loan volume.

On Aave each asset has its own market of supply and demand with its own APY (Annual Percentage Yield) which evolves with time.

---

### Is there a minimum or maximum amount to deposit?

Users are able to deposit any amount they want, there is no minimum or maximum limit.

---

### What tokens are allowed to be deposited?

JustCause Pool creators choose what tokens to accept at pool creation. They can choose from Polygon network MATIC, USDC, USDT, DAI, WBTC, WETH, AAVE, DPI, and LINK with more to be added.

---

</div>

<div id="risks" class="hidden" markdown="1">

# Risks

### JustCause

Every possible step has been taken to minimize the risk to user funds as much as possible. We have been audited

However, JustCause is a brand new social experiment. Before deciding to participate in JustCause, you should carefully consider your objectives, level of experience with crypto and risk appetite. Most importantly, do not deposit money with JustCause you cannot afford to lose. Crypto markets are very risky and you may lose all or some of your deposits.

The risks related to the JustCause platform are the smart contract risk (risk of a bug within the protocol code and the Aave protocol code) and liquidation risk (risk on the collateral liquidation process on Aave).

### Aave

The Aave Protocol has been audited, and has an ongoing bug bounty program. It secures tens of billions of dollars of value. The protocol is completely open source, allowing anyone to interact and build on top of it. Every possible step has been taken to minimize the risk as much as possible. However, no platform can be considered entirely risk free.

### Permanent loss of a peg

If one of the stablecoins deposited in a JustCause pool goes significantly down below the peg of $1.00 and never returns to the peg, it could mean the loss of user funds.

</div>

<div id="justCausePool" class="hidden" markdown="1">

# JustCausePool
 ---

This contract is part of the JustCause Protocol for lossless donations using Aave v3. Full code can be found [here](https://github.com/smeee23/just_cause/blob/main/contracts/polygon/JustCausePool.sol) in our github repository.

The protocol uses Aave to generate interest for crowdfunding. JustCausePool is a point of contact with the Aave Pool contract, and where the protocol stores the deposited [aTokens](https://docs.aave.com/developers/tokens/atoken).

> aTokens are tokens minted and burnt upon supply and withdraw of assets to an Aave market, which denote the amount of crypto assets supplied and the yield earned on those assets. The aTokens’ value is pegged to the value of the corresponding supplied asset at a 1:1 ratio and can be safely stored, transferred or traded. All yield collected by the aTokens' reserves are distributed to aToken holders directly by continuously increasing their wallet balance. - Aave Documentation

*Functions withdraw() and withdrawDonations() directly interact with the Aave Pool.*

*Deposits are performed through the PoolTracker contract to minimize approvals.*

---


# Write Methods

---

## initialize

```solidity
function initialize(
        address[] memory _acceptedTokens,
        string memory _name,
        string memory _about,
        string memory _picHash,
        string memory _metaUri,
        address _receiver,
        address _poolAddressesProviderAddr,
        address _wethGatewayAddr,
        address _erc721Addr,
        bool _isVerified

    )...
```

Initializes the JustCausePool proxy contracts. Function is invoked by the PoolTacker contract when a Pool is created.


| Param | Type | Description |
|--- | --- | --- |
| _acceptedTokens | `address[]` | list of tokens to be accepted by the JustCausePool (JCP) |
|--- | --- | --- |
| _name | `string` | unique name of Pool |
|--- | --- | --- |
| _about | `string` | ipfs hash of pool description of JCP |
|--- | --- | --- |
|_picHash | `string` | ipfs hash of picture used for the Pool NFT that Contributors receive |
|--- | --- | --- |
| _metaUri | `string` | meta info uri for NFT of JCP |
|--- | --- | --- |
| _receiver | `address` | address of receiver of JCP donations |
|--- | --- | --- |
| _poolAddressesProviderAddr | `address` | address of Aave pool addresses provider |
|--- | --- | --- |
| _wethGatewayAddr | `address` | address of Aave WETH gateway |
|--- | --- | --- |
| _erc721Addr | `address` | address of nft contract for pool |
|--- | --- | --- |
| _isVerified | `bool` | indicates whether JCP is verified |
|--- | --- | --- |

---

## deposit

```solidity
function deposit(address _assetAddress, uint256 _amount)...
```

Function updates total deposits. Deposit interactions with the Aave Pool contract are done through the PoolTracker contract to minimize approvals.


| Param | Type | Description |
|--- | --- | --- |
| _assetAddress| `address` | address of the underlying asset of the reserve |
|--- | --- | --- |
| _amount | `uint256` | amount of supplied assets |
|--- | --- | --- |

---

## withdraw

```solidity
function withdraw(
    address _assetAddress,
    uint256 _amount,
    address _depositor,
    bool _isETH
)...
```

Function withdraws Contributor's funds from Aave pools, exchanging the JustCausePool's aTokens for reserve tokens and sending them to the Contributor's wallet.


| Param | Type | Description |
|--- | --- | --- |
| _assetAddress| `address` | address of the underlying asset of the reserve |
|--- | --- | --- |
| _amount | `uint256` | amount of supplied assets |
|--- | --- | --- |
| _depositor | `address` | address making the deposit |
|--- | --- | --- |
| _isETH | `bool` | indicating if asset is the base token of network (eth/matic/...) |
|--- | --- | --- |

---

## withdrawDonations

```solidity
function withdrawDonations(
  address _assetAddress,
  address _feeAddress,
  bool _isETH,
  uint256 _bpFee)
external onlyPoolTracker returns(uint256){...
```

Function claims donations for receiver. Calls Aave Pool contract, exchanging JustCausePool's aTokens for reserve tokens for interestEarned amount. Calculates interestEarned and subtracts 0.2% fee from claim amount for non-verified Pools. Sends interestEarned - fee to receiver and fee to protocol (or just sends interestEarned for verified Pools).


| Param | Type | Description |
|--- | --- | --- |
| _assetAddress| `address` | address of the underlying asset of the reserve |
|--- | --- | --- |
| _feeAddress | `address` | address that collects the 0.2% protocol fee |
|--- | --- | --- |
| _isETH | `bool` | indicating if asset is the base token of network (eth/matic/...) |
|--- | --- | --- |
| _bpFee | `uint256` | fee rate paid to the protocol 0 - 0.4% |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| donated | `uint256` | amount donated to pool |
|--- | --- | --- |

---

## setAbout

```solidity
function setAbout(string memory _about) external onlyReceiver()...
```

Function allows the receiver to  change the reference to the description in the pool.


| Return | Type | Description |
|--- | --- | --- |
| about | `string` | new ipfs hash of pool description of JCP. |
|--- | --- | --- |

---

## setMetaUri

```solidity
function setMetaUri(string memory _metaUri) external onlyReceiver()...
```

Function allows the receiver to  change the reference to the metadata URI information for the ERC721 of the pool.


| Return | Type | Description |
|--- | --- | --- |
| _metaUri | `string` | new ipfs hash of metaUri of JCP. |
|--- | --- | --- |

---

# View Methods


---

## getAcceptedTokens

```solidity
function getAcceptedTokens() external view returns(address[] memory)...
```

Function returns list of tokens to be accepted by Pool.


| Return | Type | Description |
|--- | --- | --- |
| acceptedTokens| `address[]` | List of tokens to be accepted by JCP |
|--- | --- | --- |

---

## getName

```solidity
function getName() external view returns(string memory)...
```

Function returns name of JustCausePool.


| Return | Type | Description |
|--- | --- | --- |
| name | `string` | unique name of Pool |
|--- | --- | --- |

---

## getAbout

```solidity
function getAbout() external view returns(string memory)...
```

Function returns ipfs hash of pool description of JustCausePool.


| Return | Type | Description |
|--- | --- | --- |
| about | `string` | ipfs hash of pool description of JCP. |
|--- | --- | --- |

---

## getPicHash

```solidity
function getPicHash() external view returns(string memory)...
```

Function returns ipfs hash of NFT picture for JustCausePool.


| Return | Type | Description |
|--- | --- | --- |
| picHash | `string` | ipfs hash of picture used for the Pool NFT that Contributors receive. |
|--- | --- | --- |

---

## getMetaUri

```solidity
function getMetaUri() external view returns(string memory){...
```

Function returns meta info uri for NFT for JustCausePool.


| Return | Type | Description |
|--- | --- | --- |
| metaUri | `string` | meta info uri for NFT of JCP. |
|--- | --- | --- |

---

## getIsVerified

```solidity
function getIsVerified() external view returns(bool)...
```

Function returns whether JustCausePool is a verified pool or user created.


| Return | Type | Description |
|--- | --- | --- |
| isVerified | `bool` | indicates whether JCP is verified |
|--- | --- | --- |


---

## getRecipient

```solidity
function getRecipient() external view returns(address)...
```

Function returns the receiver address of the Pool.


| Return | Type | Description |
|--- | --- | --- |
| receiver | `address` | address of receiver of JCP donations |
|--- | --- | --- |

---

## getERC721Address

```solidity
function getERC721Address() external view returns(address)...
```

Function returns the receiver address of the Pool.


| Return | Type | Description |
|--- | --- | --- |
| erc721Addr | `address` | address of the NFT contract for this Pool |
|--- | --- | --- |

---

## getPoolInfo

```solidity
function getPoolInfo() external view returns (address[] memory, address, bool, string memory, string memory, string memory, string memory)...
```

Function returns general pool information.


| Return | Type | Description |
|--- | --- | --- |
| acceptedTokens | `address[]` | list of tokens to be accepted by the JustCausePool (JCP) |
|--- | --- | --- |
| name | `string` | unique name of Pool |
|--- | --- | --- |
| about | `string` | ipfs hash of pool description of JCP |
|--- | --- | --- |
| picHash | `string` | ipfs hash of picture used for the Pool NFT that Contributors receive |
|--- | --- | --- |
| metaUri | `string` | meta info uri for NFT of JCP |
|--- | --- | --- |
| receiver | `address` | address of receiver of JCP donations |
|--- | --- | --- |
| isVerified | `bool` | indicates whether JCP is verified |
|--- | --- | --- |

---

## getATokenAddress

```solidity
function getATokenAddress(address _assetAddress) public view returns(address aTokenAddress)...
```

Function returns the address of Aave's aToken for the supplied _assetAddress.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| totalDeposit | `uint256` | total assets deposited in pool |
|--- | --- | --- |

---

## getTotalDeposits

```solidity
function getTotalDeposits(address _assetAddress) public view returns(uint256)...
```

Function returns the total assets deposited in the Pool for the supplied _assetAddress.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | Address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| aTokenAddress | `address` | address of Aave's aToken for the supplied _assetAddress |
|--- | --- | --- |

---

## getUnclaimedInterest

```solidity
function getUnclaimedInterest(address _assetAddress) public view returns (uint256)...
```

Function returns the accrued interest that has not yet been claimed for the supplied _assetAddress.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | Address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| unclaimedInterest | `uint256` | accrued interest that has not yet been claimed |
|--- | --- | --- |

---

## getClaimedInterest

```solidity
function getClaimedInterest(address _assetAddress) public view returns (uint256)...
```

Function returns the accrued interest that has not yet been claimed for the supplied _assetAddress.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | Address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| claimedInterest | `address` | record of donations that have been paid out to receiver |
|--- | --- | --- |

---

## getATokenBalance

```solidity
function getATokenBalance(address _assetAddress) public view returns (uint256)...
```

Function returns the Pool balance of aToken for the supplied _assetAddress.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | Address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| aTokenBalance | `uint256` |  Pool balance of aToken for the asset |
|--- | --- | --- |

---

## getReserveNormalizedIncome

```solidity
function getReserveNormalizedIncome(address _assetAddress) public view returns(uint256)...
```

Function returns the reserve normalized income of the Aave Pool for the supplied _assetAddress.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | Address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| normalizedIncome | `uint256` |  reserve's normalized income |
|--- | --- | --- |

---

## getAaveLiquidityIndex

```solidity
function getAaveLiquidityIndex(address _assetAddress) public view returns(uint256 liquidityIndex)...
```

Function returns the liquidity index of the Aave Pool for the supplied _assetAddress.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | Address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| liquidityIndex | `uint256` |  reserve's liquidity index |
|--- | --- | --- |

---

## getPoolTokenInfo

```solidity
function getPoolTokenInfo(address _asset) external view returns(uint256, uint256, uint256, uint256, uint256, uint256, address)...
```

Function rReturns asset specific pool information.

| Param | Type | Description |
|--- | --- | --- |
| _assetAddress | `address` | Address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| liquidityIndex | `uint256` |  reserve's liquidity index |
|--- | --- | --- |
| normalizedIncome | `uint256` |  reserve's normalized income |
|--- | --- | --- |
| aTokenBalance | `uint256` |  Pool balance of aToken for the asset |
|--- | --- | --- |
| claimedInterest | `address` | record of donations that have been paid out to receiver |
|--- | --- | --- |
| unclaimedInterest | `address` | accrued interest that has not yet been claimed |
|--- | --- | --- |
| totalDeposit | `uint256` | total assets deposited in pool |
|--- | --- | --- |
| aTokenAddress | `address` | address of Aave's aToken for the supplied _assetAddress |
|--- | --- | --- |

</div>

<div id="depositorNFT" class="hidden" markdown="1">

# JCDepositorERC721
---

This contract is part of the JustCause Protocol for lossless donations using Aave v3. Full code can be found [here](https://github.com/smeee23/just_cause/blob/main/contracts/polygon/JCDepositorERC721.sol) in our github repository.

JCDepositorERC721 creates an ERC721 (NFT) for each Contributor, which acts as a digital receipt storing information about their donations. It is for this reason that the NFTs cannot be sold/transferred from the original Contributor's wallet. The only way to get a JustCausePool NFT is to **donate!**


The contract inherits from the [OpenZeppelin](https://www.openzeppelin.com/) contract ERC721URIStorageUpgradeable.  Each JCDepositorERC721 is created through a proxy contract and matches 1:1 with a specific JustCausePool contract.


User deposit information is stored in a Deposit `struct`

``` solidity
struct Deposit {
	uint256 balance;
	uint256 timeStamp;
	address asset;
}

```

A mapping links unique tokenId’s to Deposit information.

```solidity
mapping (uint256 => Deposit) deposits;
```

 The tokenId consists of a keccak hash of the addresses of the Contributor, JustCausePool, and reserve asset

```solidity
uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, jcPool, _asset)))

```


---


# Write Methods


---

## initialize

```solidity
function initialize(address _jcPool)...
```

Initializes the JCDepositor Token. Function is invoked by the PoolTacker contract when a Pool is created.


| Param | Type | Description |
|--- | --- | --- |
| _receiver | `address` | address of JustCausePool that is associated with this contract |
|--- | --- | --- |

---

## addFunds

```solidity
function addFunds(
	address _tokenOwner,
        uint256 _amount,
        uint256 _timeStamp,
        address _asset,
        string memory _metaUri
)...
```

Function updates the balance for _tokenOwner. Creates NFT for _tokenOwner if first deposit for pool and reserve asset.

| Param | Type | Description |
|--- | --- | --- |
| _tokenOwner | `address` | address of contributor |
|--- | --- | --- |
| _amount | `uint256` | amount of supplied assets |
|--- | --- | --- |
| _timeStamp | `uint256` | timeStamp of token creation |
|--- | --- | --- |
| _asset| `address` | address of the underlying asset of the reserve |
|--- | --- | --- |
| _metaUri | `string` | meta info uri for nft of JCP |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| firstDeposit | `bool` |  is this the contributor's fist deposit |
|--- | --- | --- |


---

## withdrawFunds

```solidity
function withdrawFunds(address _tokenOwner, uint256 _amount, address _asset)...
```

Function updates the balance for _tokenOwner. Creates NFT for _tokenOwner if first deposit for pool and reserve asset.

| Param | Type | Description |
|--- | --- | --- |
| _tokenOwner | `address` | address of contributor |
|--- | --- | --- |
| _amount | `uint256` | amount of supplied assets |
|--- | --- | --- |
| _asset | `address` | address of the underlying asset of the reserve |
|--- | --- | --- |

---


# View Methods


---


## getDepositInfo

```solidity
function getDepositInfo(uint256 _tokenId) public view returns (Deposit memory)...
```

Function returns the deposit info for a given tokenId. This includes the Contributor's balance, time of deposit, and the reserve asset deposited.

| Param | Type | Description |
|--- | --- | --- |
| _tokenId | `uint256` | unique tokenId keccak hash of depositor, pool and asset addresses |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| Deposit | `struct` |  struct containing info about the holders deposit |
|--- | --- | --- |

---

## getUserBalance

```solidity
function getUserBalance(uint256 _tokenId) public view returns (uint256)...
```

Function returns the Contributor's Pool balance info for a given tokenId.


| Param | Type | Description |
|--- | --- | --- |
| _tokenId | `uint256` | unique tokenId keccak hash of depositor, pool and asset addresses |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| balance | `struct` |  the pool balance of the owner of the token |
|--- | --- | --- |

---

## getUserTokens

```solidity
function getUserTokens(address _tokenOwner) external view returns(uint256[] memory)...
```

Function returns an uint for all assets accepted by the Pool. It returns tokenIds for each asset deposited by _tokenOwner. If there is no deposit on record for a particular asset, the function returns 0.



| Param | Type | Description |
|--- | --- | --- |
| _tokenOwner | `address` | address of contributor |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| ids | `uint256[]` |  list of tokenId's belonging to a given Contributor |
|--- | --- | --- |

---

## getPool

```solidity
function getPool() public view returns(address)...
```

Function returns the Pool associated with this NFT contract.


| Return | Type | Description |
|--- | --- | --- |
| jcPool | `address` | the pool associated with this ERC721 token |
|--- | --- | --- |

</div>

<div id="poolTracker" class="hidden" markdown="1">

# PoolTracker

This contract is part of the JustCause Protocol for lossless donations using Aave v3. Full code can be found [here](https://github.com/smeee23/just_cause/blob/main/contracts/polygon/PoolTracker.sol) in our github repository.

PoolTracker coordinates all major functionality of the protocol.

It generates the proxy contracts for both JustCausePool and JCDepositorERC721 and is the only address with permission to execute their write methods.

The PoolTracker contract also interacts directly with Aave [Pool](https://docs.aave.com/developers/core-contracts/pool#view-methods) and [WETHGateway](https://docs.aave.com/developers/periphery-contracts/wethgateway) when Contributors make donations through the addDeposit function. This makes approvals required only once per token. The withdrawDeposit and claim functions do not interact with the Aave contracts directly. This interaction is handled by the JustCausePool contract.


---


# Write Methods


---

## addDeposit

```solidity
function addDeposit(uint256 _amount, address _asset, address _pool, bool _isETH)...
```

Function deposits specified token to the Aave Pool contract either via the WETHGateway or the Aave Pool directly. Calls JCDepositorERC721 to mint NFT for the Contributor. Emits AddDeposit event.


| Param | Type | Description |
|--- | --- | --- |
| _amount | `uint256` | amount of supplied assets |
|--- | --- | --- |
| _asset| `address` | address of the underlying asset of the reserve |
|--- | --- | --- |
| _pool | `address` | address of JustCausePool |
|--- | --- | --- |
| _isETH | `bool` | indicates if the _asset is the native token of the chain |
|--- | --- | --- |

---

## withdrawDeposit

```solidity
function withdrawDeposit(uint256 _amount, address _asset, address _pool, bool _isETH)...
```

Function withdraws the _asset from the Aave reserve pool and pays back the original deposit to the Contributor. Emits WithdrawDeposit event.


| Param | Type | Description |
|--- | --- | --- |
| _amount | `uint256` | amount of supplied assets |
|--- | --- | --- |
| _asset| `address` | address of the underlying asset of the reserve |
|--- | --- | --- |
| _pool | `address` | address of JustCausePool |
|--- | --- | --- |
| _isETH | `bool` | indicates if the _asset is the native token of the chain |
|--- | --- | --- |

## claimInterest

```solidity
function claimInterest(address _asset, address _pool, bool _isETH) ...
```

Function claims the acrued interest as donations for the receiver of the Pool. Emits Claim event.


| Param | Type | Description |
|--- | --- | --- |
| _asset| `address` | address of the underlying asset of the reserve |
|--- | --- | --- |
| _pool | `address` | address of JustCausePool |
|--- | --- | --- |
| _isETH | `bool` | indicates if the _asset is the native token of the chain |
|--- | --- | --- |

---

## createJCPoolClone

```solidity
function createJCPoolClone(
	address[] memory _acceptedTokens,
	string memory _name,
	string memory _about,
	string memory _picHash,
	string memory _metaUri,
	address _receiver
)...
```

Function creates new JustCausePool and JCDepositorERC721 by proxy contract. Adds Pool to verified list if sender is team address. Emits AddPool event.


| Param | Type | Description |
|--- | --- | --- |
| _acceptedTokens | `address[]` | list of tokens to be accepted by the JustCausePool (JCP) |
|--- | --- | --- |
| _name | `string` | unique name of Pool |
|--- | --- | --- |
| _about | `string` | ipfs hash of pool description of JCP |
|--- | --- | --- |
|_picHash | `string` | ipfs hash of picture used for the Pool NFT that Contributors receive |
|--- | --- | --- |
| _metaUri | `string` | meta info uri for NFT of JCP |
|--- | --- | --- |
| _receiver | `address` | address of receiver of JCP donations |
|--- | --- | --- |

---

## setBpFee

```solidity
function setBpFee(uint256 feeKey)...
```

Function sets the basis point fee that is withdraw from donations (ranges from 0 - 0.4% of donations). Can only be called by the multiSig address.


| Param | Type | Description |
|--- | --- | --- |
| feeKey | `uint256` | key to the array that stores valid protocol fee values |
|--- | --- | --- |

---


# View Methods


---

## getTvl

```solidity
function getTVL(address _asset) public view returns(uint256)...
```

Function returns the total value locked for a given asset.

| Param | Type | Description |
|--- | --- | --- |
| _asset | `address` | address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| tvl | `uint256` | the total value locked |
|--- | --- | --- |

---

## getTotalDonated

```solidity
function getTotalDonated(address _asset) public view returns(uint256)...
```

Function returns the total donated amount for a given asset.

| Param | Type | Description |
|--- | --- | --- |
| _asset | `address` | address of the underlying asset of the reserve |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| totalDonation | `uint256` | claimed donation for a given asset |
|--- | --- | --- |

---

## getDepositorERC721Address

```solidity
 function getDepositorERC721Address() public view returns(address)...
```

Function returns the JCDepositorERC721 address.


| Return | Type | Description |
|--- | --- | --- |
| addressOfERC721 | `address` | address of ERC721 for depositors, created on deployment |
|--- | --- | --- |

---

## getReceiverPools

```solidity
 function getReceiverPools(address _user) public view returns(address[] memory)...
```

Function returns the the list of pools that a given address is the receiver for.

| Param | Type | Description |
|--- | --- | --- |
| _user | `address` | address to check for receiver |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| receiverList | `address[]` | list of pools that an address is the receiver for |
|--- | --- | --- |

---

## getBpFee

```solidity
function getBpFee() public view returns(uint256)...
```

Function returns basis point fee that is withdraw from donations (ranges from 0 - 0.4% of donations).


| Return | Type | Description |
|--- | --- | --- |
| bpFee | `uint256` | basis points (parts per 10,000) ex. 20 = 0.2% |
|--- | --- | --- |

---

## getMultiSig

```solidity
 function getMultiSig() public view returns(address)...
```

Function returns the address of the validator. This is the address that is allowed to create verified pools.


| Return | Type | Description |
|--- | --- | --- |
| multiSig | `address` | address of multiSig, only address allowed to create pools and change fee rate |
|--- | --- | --- |

---

## getContributions

```solidity
 function getContributions(address _user) public view returns(address[] memory)...
```

Function returns the the list of pools that a given address is a contributor to.

| Param | Type | Description |
|--- | --- | --- |
| _user | `address` | address to check for contributions |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| contributorList | `address[]` | list of pools that an address is a contributor to |
|--- | --- | --- |

---

## getPoolAddr

```solidity
 function getPoolAddr() public view returns(address)...
```

Function returns the address of Aave Pool contract.


| Return | Type | Description |
|--- | --- | --- |
| poolAddr | `address` | address of Aave Pool contract |
|--- | --- | --- |

---

## getReservesList

```solidity
 function getReservesList() public view returns(address[] memory)...
```

Function returns a list of addresses of Aave reserves.


| Return | Type | Description |
|--- | --- | --- |
| reserveList | `address[]` | list of addresses of Aave reserves |
|--- | --- | --- |

---

## getBaseJCPoolAddress

```solidity
 function getBaseJCPoolAddress() public view returns(address)...
```

Function returns base JustCausePool address.


| Return | Type | Description |
|--- | --- | --- |
| baseJCPool | `address` | base JustCausePool address |
|--- | --- | --- |

---

## getVerifiedPools

```solidity
 function getVerifiedPools() public view returns(address[] memory)...
```

Function returns list of verified pools.


| Return | Type | Description |
|--- | --- | --- |
| verifiedPools | `address[]` | list of verified pools |
|--- | --- | --- |

---

## checkPool

```solidity
  function checkPool(address _pool) public view returns(bool)...
```

Function returns if a pool address exists

| Param | Type | Description |
|--- | --- | --- |
| _pool | `address` | address of JustCausePool |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| isPool | `bool` | if pool address exists |
|--- | --- | --- |

---

## getAddressFromName

```solidity
 function getAddressFromName(string memory _name) external view returns(address)...
```

Function returns an address from a pool name.

| Param | Type | Description |
|--- | --- | --- |
| _name | `string` | name of pool |
|--- | --- | --- |

| Return | Type | Description |
|--- | --- | --- |
| pool | `address` | address for a given pool name |
|--- | --- | --- |

</div>

<script>

function setText(id) {
  document.getElementById('home').innerHTML = document.getElementById(id).innerHTML;
}

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
</script>

</body>
</html>
