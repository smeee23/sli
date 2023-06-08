const axios = require('axios');

export const getPriceFromCoinGecko = async(networkId) => {
    let data;
    try{
        if(networkId === 80001 || networkId === 137){
            const url = "https://api.coingecko.com/api/v3/simple/price?ids=aave,dai,tether,usd-coin,ethereum,bitcoin,chainlink,matic-network,defipulse-index&vs_currencies=usd";
            const response = await axios.get(url);
            data = response.data;
        }
    }
    catch (error) {
        console.error(error);
    }
    return data;
}

