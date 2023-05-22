const axios = require('axios');

export const getPriceFromMessari = async(apiKey) => {
    let priceUSD;
    try{
        const url = "https://data.messari.io/api/v1/assets/"+apiKey+"/metrics/market-data";
        const response = await axios.get(url);
        priceUSD = response.data.data.market_data.price_usd;
    }
    catch (error) {
        console.error(error);
    }
    return priceUSD;
}

export const getPriceFromCoinGecko = async(networkId) => {
    let data;
    try{
        if(networkId === 80001 || networkId === 137){
            const url = "https://api.coingecko.com/api/v3/simple/price?ids=aave,dai,tether,usd-coin,ethereum,bitcoin,chainlink,matic-network,defipulse-index&vs_currencies=usd";
            const response = await axios.get(url);
            console.log('coingecko prices:', response.data);
            data = response.data;
        }
    }
    catch (error) {
        console.error(error);
    }
    return data;
}

