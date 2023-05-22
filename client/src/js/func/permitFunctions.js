import getWeb3 from "../../getWeb3NotOnLoad";

const createPermitMessageData = (fromAddress, spender, nonce, expiry, chainId, tokenAddress) => {

  const message = {
    holder: fromAddress,
    spender: spender,
    nonce: nonce,
    expiry: expiry,
    allowed: true,
  };

  const typedData = JSON.stringify({
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        },
      ],
      Permit: [
        {
          name: "holder",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "expiry",
          type: "uint256",
        },
        {
          name: "allowed",
          type: "bool",
        },
      ],
    },
    primaryType: "Permit",
    domain: {
      name: "WETH",
      version: "1",
      chainId: chainId,
      verifyingContract: tokenAddress,
    },
    message: message,
  });

  return {
    typedData,
    message,
  };
};

const signData = async(fromAddress, typeData) => {
    const web3 = await getWeb3();
    const result = await web3.currentProvider.sendAsync({
      id: 1,
      method: "eth_signTypedData_v3",
      params: [fromAddress, typeData],
      from: fromAddress,
    });

    const r = result.result.slice(0, 66);
    const s = "0x" + result.result.slice(66, 130);
    const v = Number("0x" + result.result.slice(130, 132));

    return { v, r, s };
  };

  export const signTransferPermit = async(fromAddress, spender, chainId, tokenAddress) => {
    const SECOND = 1000;
    const expiry = Math.trunc((Date.now() + 120 * SECOND) / SECOND);
    const nonce = 1;
    const messageData = createPermitMessageData(fromAddress, spender, nonce, expiry, chainId, tokenAddress);
    const sig = await signData(fromAddress, messageData.typedData);
    return Object.assign({}, sig, messageData.message);
  };