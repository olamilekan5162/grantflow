import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: "example-gateway.mypinata.cloud",
});

export const uploadData = async (jsonData) => {
  try {
    const upload = await pinata.upload.public.json(jsonData);
    return upload;
  } catch (e) {
    console.log("error", e);
  }
};

export const getData = async (cid) => {
  try {
    const { data } = await pinata.gateways.public.get(cid);
    return data;
  } catch (e) {
    console.log("error", e);
  }
};
