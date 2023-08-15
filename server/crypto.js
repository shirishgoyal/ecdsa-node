const { secp256k1: secp } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {
  hexToBytes,
  toHex,
  utf8ToBytes,
} = require("ethereum-cryptography/utils");

function generatePrivateKey() {
  return secp.utils.randomPrivateKey();
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

function restoreSignature(signature, recovery) {
  return secp.Signature.fromCompact(signature).addRecoveryBit(recovery);
}

function verifySignature(signature, messageHash, publicKey) {
  return secp.verify(signature, messageHash, publicKey);
}

function recoverPublicKey(messageHash, signature, recovery) {
  let pk = new Uint8Array(33);
  pk.set(signature.recoverPublicKey(messageHash).toRawBytes(true));
  return pk;
}

function getPublicKey(privateKey) {
  return secp.getPublicKey(privateKey);
}

module.exports = {
  generatePrivateKey,
  getWalletAddress,
  hashMessage,
  signMessage,
  restoreSignature,
  verifySignature,
  getPublicKey,
  recoverPublicKey,
  hexToBytes,
  toHex,
  utf8ToBytes,
};
