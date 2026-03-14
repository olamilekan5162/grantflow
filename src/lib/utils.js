import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

export const uploadData = async (jsonData) => {
  try {
    const upload = await pinata.upload.public.json(jsonData);
    return upload.cid;
  } catch (e) {
    console.error("error uploading json data", e);
  }
};

export const uploadFile = async (fileObj) => {
  try {
    const upload = await pinata.upload.public.file(fileObj);
    return upload.cid;
  } catch (e) {
    console.error("error uploading file", e);
    throw e;
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
