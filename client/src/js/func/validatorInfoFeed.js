import { convertGweiToETH } from './contractInteractions';
const axios = require('axios');

export const addTestnetValidator = async(validatorId, activeAccount) => {
    try{
        let url = `https://flask-servicecors.rfqbhr834qlno.us-east-2.cs.amazonlightsail.com/status/${validatorId}`;
        let response_aws = await axios.get(url);
        if(response_aws.data["index"].toString() === "9999999999999"){
            url = `https://flask-servicecors.rfqbhr834qlno.us-east-2.cs.amazonlightsail.com/add/${validatorId}?withdrawAddress=${activeAccount}`;
            response_aws = await axios.get(url);
            console.log("add validator Response", response_aws.data);
            return "OK";
        }
        else{
            if(activeAccount !== response_aws.data["withdrawAddress"].toString()) return "YOUR ADDRESS IS NOT THE WITHDRAW ADDRESS";
            else if(response_aws.data["slashed"]) return "VALIDATOR SLASHED";

            return "OK";
        }
    }
    catch (error) {
        console.error(error);
        return "ERROR";
    }
}

export const getValidatorInfo = async(validatorId, forceBeaconCall) => {
    let data;
    try{
        let url = `https://flask-servicecors.rfqbhr834qlno.us-east-2.cs.amazonlightsail.com/status/${validatorId}`;
        const response_aws = await axios.get(url);
        console.log("aws", response_aws.data);

        data = {}
        data["pubkey"] = "0x0"//response.data.data["pubkey"];
        data["slashed"] = response_aws.data["slashed"];
        let withdrawAddress = response_aws.data["withdrawAddress"];
        data["withdrawAddress"] = withdrawAddress.substring(0, 4) == "0x01" ? "0x"+withdrawAddress.substring(withdrawAddress.length - 40) : "0x0";

        if(forceBeaconCall){
            data["beaconInfo"] = await getBeaconInfo(validatorId);
        }
        else{
            const beaconInfo = localStorage.getItem("beaconInfo"+validatorId);
            data["beaconInfo"] = beaconInfo ? JSON.parse(beaconInfo) : await getBeaconInfo(validatorId);
        }
        data["loss"] = response_aws.data["loss"];
        console.log("data", data, data["loss"], response_aws.data["loss"])
    }
    catch (error) {
        console.error(error);
    }
    console.log("data check", data);
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