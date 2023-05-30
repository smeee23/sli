const axios = require('axios');

export const getValidatorInfo = async(validatorId) => {
    let data;
    try{
        //if(networkId === 80001 || networkId === 137){
            let url = `https://beaconcha.in/api/v1/validator/${validatorId}/performance?apikey=b0lSTDd2TTBlZmlQRksvUWNuNDEu`;
            let response = await axios.get(url);
            console.log('beaconcha.in data for:', response.data.data);
            data = response.data["data"][0];
        //}
            url = `https://beaconcha.in/api/v1/validator/${validatorId}?apikey=b0lSTDd2TTBlZmlQRksvUWNuNDEu`
            response = await axios.get(url);
            console.log('beaconcha.in data for status:', response.data.data);

            data["pubkey"] = response.data.data["pubkey"];
            data["slashed"] = response.data.data["slashed"];
            data["name"] = response.data.data["name"];
            let withdrawAddress = response.data.data["withdrawalcredentials"];
            data["withdrawAddress"] = withdrawAddress.substring(0, 4) == "0x01" ? "0x"+withdrawAddress.substring(withdrawAddress.length - 40) : "0x0"
    }
    catch (error) {
        console.error(error);
    }
    return data;
}