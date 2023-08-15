import { secp256k1 as secp } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";

function getPublicKey(privateKey) {
  return secp.getPublicKey(privateKey);
}

function recoverPublicKey(hash, sign, recovery) {
  return secp.recoverPublicKey(hash, sign, recovery);
}

function getWalletAddress(publicKey) {
  const hashAddress = keccak256(publicKey.slice(1));
  return hashAddress.slice(-20);
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}

function signMessage(messageHash, privateKey) {
  return secp.sign(messageHash, privateKey);
}

function signatureExport(signature) {
  let encoded = new Uint8Array(64);
  encoded.set(signature.toCompactRawBytes());

  return `0x${toHex(encoded)}`;
}

function verifySignature(signature, messageHash, publicKey) {
  return secp.verify(signature, messageHash, publicKey);
}

export default {
  getPublicKey,
  recoverPublicKey,
  getWalletAddress,
  hashMessage,
  signMessage,
  signatureExport,
  verifySignature,
  toHex,
  hexToBytes,
};
