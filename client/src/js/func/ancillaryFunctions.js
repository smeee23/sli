import React from "react"

import DaiLogo from "../components/cryptoLogos/DaiLogo";
import WbtcLogo from "../components/cryptoLogos/WbtcLogo";
import UsdcLogo from "../components/cryptoLogos/UsdcLogo";
import TetherLogo from "../components/cryptoLogos/TetherLogo";
import EthLogo from "../components/cryptoLogos/EthLogo";
import AaveLogo from "../components/cryptoLogos/AaveLogo";
import MaticLogo from "../components/cryptoLogos/MaticLogo";
import WEthLogo from "../components/cryptoLogos/WEthLogo";
import LinkLogo from "../components/cryptoLogos/LinkLogo";
import DpiLogo from "../components/cryptoLogos/DpiLogo";

import DaiLogoLg from "../components/cryptoLogos/DaiLogoLg";
import WbtcLogoLg from "../components/cryptoLogos/WbtcLogoLg";
import UsdcLogoLg from "../components/cryptoLogos/UsdcLogoLg";
import TetherLogoLg from "../components/cryptoLogos/TetherLogoLg";
import EthLogoLg from "../components/cryptoLogos/EthLogoLg";
import AaveLogoLg from "../components/cryptoLogos/AaveLogoLg";
import MaticLogoLg from "../components/cryptoLogos/MaticLogoLg";
import WEthLogoLg from "../components/cryptoLogos/WEthLogoLg";
import LinkLogoLg from "../components/cryptoLogos/LinkLogoLg";
import DpiLogoLg from "../components/cryptoLogos/DpiLogoLg";

import Logo from "../components/Logo"

import {getPriceFromCoinGecko} from './priceFeeds.js'

export const linkedInShare = (purl, ptitle, poolAddress, psummary) => {
  let url = 'http://www.linkedin.com/shareArticle?mini=true';
  url += '&url=' + encodeURIComponent(purl)+poolAddress;
  url += '&title=' + encodeURIComponent(ptitle);
  url += '&summary=' + encodeURIComponent(psummary);
  url += '&source=' + encodeURIComponent("https://www.justcause.finance/#/");

  window.open(url, "_blank");
}

export const twitterShare = (purl, ptitle, poolAddress) => {
  let url = 'http://twitter.com/share';
  url += '?text=' + encodeURIComponent(ptitle);
  url += '&url=' + encodeURIComponent(purl)+poolAddress;
  url += '&counturl=' + encodeURIComponent(purl);

  window.open(url, "_blank");
}

export const facebookShare = (purl,poolAddress) => {
  let url = 'http://www.facebook.com/sharer.php?s=100';
  url += '&u=' + encodeURIComponent(purl)+poolAddress;
  window.open(url, "_blank");
}

export const getBlockExplorerUrl = (label, networkId) => {
  label = '/'+label+'/';
  let urlBase;
  if(networkId === 80001) urlBase = 'https://mumbai.polygonscan.com';
  else if (networkId === 137) urlBase = 'https://polygonscan.com';
  return urlBase + label;
}
export const redirectWindowBlockExplorer = (hash, label, networkId) => {
  let url = getBlockExplorerUrl(label, networkId);
  let newPageUrl = url + hash;
  window.open(newPageUrl, "_blank")
}

export const redirectWindowUrl = (url) => {
  window.open(url, "_blank")
}

export const redirectWindowHash = (url, hash) => {
  let newPageUrl = url + hash;
  window.open(newPageUrl, "_blank")
}

export const getTokenBaseAmount = (amount, dec) => {
    let stringf = "";
    amount = String(amount);
    let pos = amount.indexOf('.');

    let len = (pos === -1) ? dec : dec - (amount.length-1 - pos);
    for(var i=0;i<len;i++){
      stringf = stringf+"0";
    }
    amount = amount.replace('.', '');
    return amount+stringf;
}


export const toFixed = (x) => {
    if (Math.abs(x) < 1.0) {
      let e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      let e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }

export const precise = (x, decimals) => {
    let number = (Number.parseFloat(x).toPrecision(6) / (10**decimals));
    return toFixed(number);
}

export const rayMul = (a, b) => {
    if (a === 0 || b === 0) {
      return 0;
    }

    const ray = 1e27;
    const halfRAY = ray / 2;
    return (a * b + halfRAY) / ray;
  }


  export const getAPY = (depositAPY) => {
    if(depositAPY){
        return depositAPY + '%';
    }
    else{
        return "N/A";
    }
}

export const delay = (delayInms) => {
  return new Promise(resolve => {
    setTimeout(() => {
    resolve(2);
    }, delayInms);
  });
}

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

export const formatDollars = (x) => {
  if(x && x < 0.01){
    return  "<$0.01";
  }
  x = x.toFixed(2);
  let commas = numberWithCommas(x);
  x = isNaN(x) ? "" : ('$' + commas);
  return x;
}

export const getFormatUSD = (amount, priceUSD) => {
  amount = amount * priceUSD;
  amount = formatDollars(amount);
  return amount;
}

export const getHeaderValuesInUSD = (acceptedTokenInfo, tokenMap) => {
  if (!acceptedTokenInfo) return 'no data';

  let userBalance = 0.0;
  let interestEarned = 0.0;
  let totalBalance = 0.0;

  for(let i = 0; i < acceptedTokenInfo.length; i++){
    const item = acceptedTokenInfo[i];
    const tokenString = item.acceptedTokenString;
    const priceUSD = tokenMap[tokenString] && tokenMap[tokenString].priceUSD;

    userBalance += precise(item.userBalance, item.decimals) * priceUSD;

    const totalInterest = Number(item.unclaimedInterest) + Number(item.claimedInterest);
    interestEarned += precise(totalInterest, item.decimals) * priceUSD;

    totalBalance += precise(item.totalDeposits, item.decimals) * priceUSD;
  }

  userBalance = formatDollars(userBalance);
  totalBalance = formatDollars(totalBalance);
  interestEarned = formatDollars(interestEarned);

  return {userBalance, interestEarned, totalBalance}
}

export const getConnection = (tokenMap, networkId) => {
  if(tokenMap){
    let netName;
    if(networkId === 80001) netName = 'Mumbai Testnet';
    else if (networkId === 137) netName = 'Polygon';

    return netName;
  }
}

export const displayTVL = (id, label, tokenMap, cutOff) => {
  if(tokenMap){
    let total = 0.0;

    let acceptedTokens = Object.keys(tokenMap);
    for(let i = 0; i < acceptedTokens.length; i++){
      const key = acceptedTokens[i];

      const priceUSD = tokenMap[key] && tokenMap[key].priceUSD;
      const tokenAmount = tokenMap[key][id];
      if(tokenAmount && priceUSD){
        total += tokenAmount * priceUSD;
      }

    }
    const s = formatDollars(total);
    if(s === "<$0.01") return label +  " $0"
    return label + ' ' + s.substring(0, s.length - cutOff);
  }
}

export const displayLogo = (acceptedTokenString) => {
  let logo = '';
  if(acceptedTokenString === 'ETH'){
    logo = <EthLogo/>;
  }
  else if (acceptedTokenString === 'USDT'){
    logo = <TetherLogo/>;
  }
  else if (acceptedTokenString === 'USDC'){
    logo = <UsdcLogo/>;
  }
  else if (acceptedTokenString === 'WBTC'){
    logo = <WbtcLogo/>;
  }
  else if (acceptedTokenString === 'DAI'){
    logo = <DaiLogo/>;
  }
  else if (acceptedTokenString === 'AAVE'){
    logo = <AaveLogo/>;
  }
  else if(acceptedTokenString === 'WETH'){
    logo = <WEthLogo/>;
  }
  else if(acceptedTokenString === 'MATIC'){
    logo = <MaticLogo/>;
  }
  else if(acceptedTokenString === 'LINK'){
    logo = <LinkLogo/>;
  }
  else if(acceptedTokenString === 'DPI'){
    logo = <DpiLogo/>;
  }
  else{
    logo = <Logo/>
  }
  return logo
}

export const checkLocationForAppDeploy = () => {
  const urls = ["https://www.justcause.finance/#/", "https://www.justcause.finance/#/just_cause/howitworks", "https://www.justcause.finance/#/just_cause/",
              "https://www.justcause.finance/#/just_cause"];

  const pathnames = ["/howitworks", "/just_cause", "/"]
  const url = window.location.href;
  if(urls.includes(url) || (pathnames.includes(window.location.pathname) && !url.includes("#"))) return "outsideApp";

  else if((window.location.href).includes("search?address=")) return "inSearch"

  return "inApp";
}

export const copyToClipboard = (str) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
  if(navigator.clipboard.writeText(str)){
    //alert(str + " copied to clipboard")
    return navigator.clipboard.writeText(str);
  }
  return Promise.reject('The Clipboard API is not available.');
}

export const checkPoolInPoolInfo = (poolAddress, poolInfo) => {
  for(let i = 0; i < poolInfo.length; i++){
    if(poolInfo[i].address === poolAddress){
      return true;
    }
  }
  return false;
}

export const filterOutVerifieds = (poolAddrs) => {
  return poolAddrs.filter((e) => !["0x4C41B254E7792Af9F03bCf1f72f986fFfE235f00"].includes(e));
}
export const addNewPoolInfo = (prevInfo, newInfo) => {

  Object.keys(prevInfo).forEach( (key, index) => {
    if(prevInfo[key].address === newInfo.poolAddress){
      prevInfo[key].about = newInfo.about;

      Object.keys(prevInfo[key].acceptedTokenInfo).forEach( (key_2, index_2) => {
        if(prevInfo[key].acceptedTokenInfo[key_2].address === newInfo.tokenAddress){
          prevInfo[key].acceptedTokenInfo[key_2].totalDeposits = newInfo.totalDeposits;
          prevInfo[key].acceptedTokenInfo[key_2].userBalance = newInfo.userBalance;
          prevInfo[key].acceptedTokenInfo[key_2].unclaimedInterest = newInfo.unclaimedInterest;
          prevInfo[key].acceptedTokenInfo[key_2].claimedInterest = newInfo.claimedInterest;
        }
      }
      );
    }
  });

  return prevInfo;
}

export const addNewPoolInfoAllTokens = (prevInfo, newInfo) => {
  Object.keys(prevInfo).forEach( (key, index) => {
    if(prevInfo[key].address === newInfo.poolAddress){
      prevInfo[key].about = newInfo.about;

      Object.keys(prevInfo[key].acceptedTokenInfo).forEach( (i) => {
          const tokenInfo = newInfo.newTokenInfo && newInfo.newTokenInfo[prevInfo[key].acceptedTokenInfo[i].address];
          console.log("tokenInfo", tokenInfo);
          prevInfo[key].acceptedTokenInfo[i].totalDeposits = tokenInfo.totalDeposits;
          prevInfo[key].acceptedTokenInfo[i].userBalance = tokenInfo.userBalance;
          prevInfo[key].acceptedTokenInfo[i].unclaimedInterest = tokenInfo.unclaimedInterest;
          prevInfo[key].acceptedTokenInfo[i].claimedInterest = tokenInfo.claimedInterest;
        }
      );
    }
  });
  console.log("newInfo_____", prevInfo);
  return prevInfo;
}

export const addNewPoolInfoAboutOnly = (prevInfo, newInfo) => {
  Object.keys(prevInfo).forEach( (key, index) => {
    if(prevInfo[key].address === newInfo.poolAddress){
      prevInfo[key].about = newInfo.about;
    }
  });

  return prevInfo;
}
export const displayLogoLg = (acceptedTokenString) => {
  let logo = '';
  if(acceptedTokenString === 'ETH'){
    logo = <EthLogoLg/>;
  }
  else if (acceptedTokenString === 'USDT'){
    logo = <TetherLogoLg/>;
  }
  else if (acceptedTokenString === 'USDC'){
    logo = <UsdcLogoLg/>;
  }
  else if (acceptedTokenString === 'WBTC'){
    logo = <WbtcLogoLg/>;
  }
  else if (acceptedTokenString === 'DAI'){
    logo = <DaiLogoLg/>;
  }
  else if (acceptedTokenString === 'AAVE'){
    logo = <AaveLogoLg/>;
  }
  else if(acceptedTokenString === 'WETH'){
    logo = <WEthLogoLg/>;
  }
  else if(acceptedTokenString === 'MATIC'){
    logo = <MaticLogoLg/>;
  }
  else if(acceptedTokenString === 'DPI'){
    logo = <DpiLogoLg/>;
  }
  else if(acceptedTokenString === 'LINK'){
    logo = <LinkLogoLg/>;
  }

  return logo;
}