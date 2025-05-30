import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { v4 as uuidv4 } from "uuid";

export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

export const getFingerprint = async (): Promise<string> => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId; // A unique identifier for the user
};
