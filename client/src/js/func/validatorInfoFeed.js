import { convertGweiToETH } from './contractInteractions';
const axios = require('axios');

export const getValidatorInfo = async(validatorId) => {
    let data;
    try{
        //if(networkId === 80001 ){
            let url = `https://beaconcha.in/api/v1/validator/${validatorId}/performance?apikey=b0lSTDd2TTBlZmlQRksvUWNuNDEu`;
            let response = await axios.get(url);
            console.log('beaconcha.in data for:', response.data.data);
            data = response.data["data"][0];

            url = `https://beaconcha.in/api/v1/validator/${validatorId}?apikey=b0lSTDd2TTBlZmlQRksvUWNuNDEu`
            response = await axios.get(url);
            console.log('beaconcha.in data for status:', response.data.data);

            data["pubkey"] = response.data.data["pubkey"];
            data["slashed"] = response.data.data["slashed"];
            data["name"] = response.data.data["name"];
            //let withdrawAddress = response.data.data["withdrawalcredentials"];
            //data["withdrawAddress"] = withdrawAddress.substring(0, 4) == "0x01" ? "0x"+withdrawAddress.substring(withdrawAddress.length - 40) : "0x0";
            data["status"] = response.data.data["status"].toUpperCase();
            data["balance"] = await convertGweiToETH(data["balance"]);
            data["performance1d"] = await convertGweiToETH(data["performance1d"]);
            data["performance7d"] = await convertGweiToETH(data["performance7d"]);
            data["performance31d"] = await convertGweiToETH(data["performance31d"]);
            data["performance365d"] = await convertGweiToETH(data["performance365d"]);
            data["performancetotal"] = await convertGweiToETH(data["performancetotal"]);
        //}
    }
    catch (error) {
        console.error(error);
    }
    return data;
}