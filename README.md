# Ethereum Slashing Insurance (SLI) Protocol

This repository contains the smart contract code and front-end React dapp for Ethereum Slashing Insurance protocol SLI (v1). The app uses Truffle as a development environment for testing and deployment tasks.

This project is part of the Chainlink 2023 Spring Hackathon. Our goal is to deploy a Proof of Concept on the Matic Mumbai network. Our project uses AWS to host the API and Chainlink Functions to make the data available to our contracts.

# What is Ethereum Staking?

Ethereum staking is the process of participating in the Ethereum network by depositing and holding a specified amount of ETH as a stake. Validators, also known as stakers, are responsible for creating and validating new blocks and securing the network by ensuring consensus on the validity of transactions. To become a validator, one must lock up a minimum of 32 ETH in a specialized smart contract called the Beacon Chain.

# What is Slashing?

By staking ETH, validators contribute to the security and decentralization of the network. In return, they receive rewards in the form of additional ETH.

Slashing is a penalty mechanism designed to discourage malicious behavior and ensure the integrity of the Ethereum network. If a validator is found to have violated the network's rules, their staked ETH can be partially or fully slashed, meaning a portion of their funds is forfeited.

# What Actions Trigger Slashing?

There are several actions that can trigger slashing, including double-signing (signing conflicting blocks), surrounding violations, and non-participation in the consensus process. Double-signing occurs when a validator attempts to create or attest to multiple blocks at the same time, which undermines the security and consistency of the blockchain. Surrounding violations involve validators intentionally surrounding a block or group of blocks to manipulate the consensus process.

Ideally, validators who maintain a proper setup and do not engage in malicious behavior should not have to be concerned about facing slashing penalties. However, in practice, a notable number of honest validators have experienced slashing incidents (outnumbering those who intentionally engage in malicious activities). This can be attributed to various factors, including human error, software bugs, and the effectiveness and security of backup systems. The slashing of well-intentioned validators, highlights the need for continuous vigilance and thorough preparations to ensure the security of staked assets.

# SLI Protocol

SLI leverages the power of decentralized finance (DeFi) to allow validators to protect themselves from the losses associated with slashing penalties at no cost to themselves.

To qualify for insurance, validators deposit ETH into the SLI PremiumGenerator Contracts, which, in turn, deposit the ETH into the Aave lending protocol. The Aave lending protocol generates a passive rate of interest on the deposited assets by lending them out in the form of collateralized loans. The interest earned is used to cover losses for any slashing penalties for members.

When validators choose to withdraw their staked ETH from the network, they can terminate their insurance benefit by withdrawing their deposit. The validator's deposit is returned in full.

# Where Does the Interest Come From?

Aave can be thought of as an automated system of liquidity pools. Users deposit tokens they want to lend out, which are amassed into reserve pools. Borrowers may then draw from these pools by taking out collateralized loans. In exchange for providing liquidity to the market lenders earn a passive rate of interest on their deposits.

With lending protocols like Aave risk exists because the financial value behind the collateral and borrowed debt can fluctuate significantly due to the volatility of crypto markets. To mitigate this risk, Aave requires loans to be overcollateralized, meaning the collateral is always worth more than the debt being borrowed. To maintain solvency, positions nearing under collateralization are liquidated (collateral is sold to pay back the debt), protecting lenders and keeping all positions over 100% collateralized.

# Learn More

The easiest way to familiarize yourself with SLI is through our [dapp](tbd) hosted on IPFS (InterPlanetary File System). Connect your wallet and start experimenting with our proof of concept Dapp running on the Matic Mumbai testnet.

# Setup

The app uses Truffle as a development environment for testing and deployment tasks. Truffle requires updated versions of node and npm to function correctly. To check the versions enter command:

```
truffle --version

npm --version

node --version
```
(Installation: [Downloading and installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [Truffle Suite)](https://trufflesuite.com/docs/truffle/getting-started/installation/)


To run locally clone this repository with command:

```
git clone https://github.com/smeee23/sli/tree/master
```

To install dependencies, from the client directory enter the command:

```
npm install
```

After installing dependencies, to start a local instance of the dapp enter the command:

```
npm start
```

# Test

In order to run the full smart contract testing suite open the truffle developer console by entering the command:

```
truffle develop
```

This provides your own private Ethereum blockchain sandbox. Once in the developer console enter the command:

```
test
```

