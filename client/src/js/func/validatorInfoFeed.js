import { convertGweiToETH } from './contractInteractions';
const axios = require('axios');

export const getValidatorInfo = async(validatorId) => {
    let data;
    try{
        let url = `https://flask-servicecors.rfqbhr834qlno.us-east-2.cs.amazonlightsail.com/status/${validatorId}`;
        const response_aws = await axios.get(url);
        console.log("aws", response_aws.data);

        data = {}
        data["pubkey"] = "0x0"//response.data.data["pubkey"];
        data["slashed"] = response_aws.data["slashed"];
        data["loss"] = response_aws.data["loss"];
        let withdrawAddress = response_aws.data["withdrawAddress"];
        data["withdrawAddress"] = withdrawAddress.substring(0, 4) == "0x01" ? "0x"+withdrawAddress.substring(withdrawAddress.length - 40) : "0x0";

        const beaconInfo = localStorage.getItem("beaconInfo"+validatorId);
        if(beaconInfo){

        }
        data["beaconInfo"] = beaconInfo ? JSON.parse(beaconInfo) : await getBeaconInfo(validatorId);
    }
    catch (error) {
        console.error(error);
    }
    return data;
}

const getBeaconInfo = async(validatorId) =>{
    let data
    try{
        let url = `https://beaconcha.in/api/v1/validator/${validatorId}/performance?apikey=b0lSTDd2TTBlZmlQRksvUWNuNDEu`;
        let response = await axios.get(url);
        console.log('beaconcha.in data for:', response.data.data);
        data = response.data["data"][0];

        url = `https://beaconcha.in/api/v1/validator/${validatorId}?apikey=b0lSTDd2TTBlZmlQRksvUWNuNDEu`
        response = await axios.get(url);
        console.log('beaconcha.in data for status:', response.data.data);

        data["pubkey"] = response.data.data["pubkey"];
        data["status"] = response.data.data["status"].toUpperCase();
        data["name"] = response.data.data["name"];
        data["balance"] = await convertGweiToETH(data["balance"]);
        data["performance1d"] = await convertGweiToETH(data["performance1d"]);
        data["performance7d"] = await convertGweiToETH(data["performance7d"]);
        data["performance31d"] = await convertGweiToETH(data["performance31d"]);
        data["performance365d"] = await convertGweiToETH(data["performance365d"]);
        data["performancetotal"] = await convertGweiToETH(data["performancetotal"]);

        localStorage.setItem("beaconInfo"+validatorId, JSON.stringify(data));
    }
    catch (error) {
        console.error(error);
    }
    return data;
}