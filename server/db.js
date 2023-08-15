const fs = require("fs");
const crypto = require("./crypto");

function generateWallet() {
  const privateKey = crypto.generatePrivateKey();
  console.log(`privateKey: 0x${crypto.toHex(privateKey)}`);

  const publicKey = crypto.recoverPublicKey(privateKey);
  console.log(`publicKey: 0x${crypto.toHex(publicKey)}`);

  const walletAddress = crypto.getWalletAddress(publicKey);
  console.log(`walletAddress: 0x${crypto.toHex(walletAddress)}`);

  return {
    privateKey: `0x${crypto.toHex(privateKey)}`,
    publicKey: `0x${crypto.toHex(publicKey)}`,
    walletAddress: `0x${crypto.toHex(walletAddress)}`,
    balance: 100,
    nonce: 0,
  };
}

function readData(filePath) {
  const walletsJSON = fs.readFileSync(filePath, "utf-8");
  const wallets = JSON.parse(walletsJSON);

  return wallets;
}

function saveData(filePath, wallets) {
  const walletsJSON = JSON.stringify(wallets, null, "\t");
  fs.writeFileSync(filePath, walletsJSON);
}

function generateAndSaveWallet(filePath) {
  const walletPair = generateWallet();
  const wallets = readData(filePath);
  saveData(filePath, [...wallets, walletPair]);
}

function allBalances() {
  const wallets = readData("./data.json");
  return wallets.reduce(function (total, currentValue, currentIndex, arr) {
    total[currentValue["walletAddress"]] = currentValue["balance"];
    return total;
  }, {});
}

function allNonces() {
  const wallets = readData("./data.json");
  return wallets.reduce(function (total, currentValue, currentIndex, arr) {
    total[currentValue["walletAddress"]] = currentValue["nonce"];
    return total;
  }, {});
}

function updateWallets(
  sender,
  senderBalance,
  senderNonce,
  recipient,
  recipientBalance
) {
  const wallets = readData("./data.json");

  const senderWalletIndex = wallets.findIndex(
    function (currentValue, index, arr) {
      return currentValue["walletAddress"] === sender;
    }
  );

  const recipientWalletIndex = wallets.findIndex(
    function (currentValue, index, arr) {
      return currentValue["walletAddress"] === recipient;
    }
  );

  const senderWallet = wallets.at(senderWalletIndex);
  senderWallet["balance"] = senderBalance;
  senderWallet["nonce"] = senderNonce;
  wallets[senderWalletIndex] = senderWallet;

  if (recipientWalletIndex < 0) {
    //create new wallet
    const recipientWallet = {
      walletAddress: recipient,
      balance: recipientBalance,
      nonce: 0,
    };
    wallets.push(recipientWallet);
  } else {
    const recipientWallet = wallets.at(recipientWalletIndex);
    recipientWallet["balance"] = recipientBalance;
    wallets[recipientWalletIndex] = recipientWallet;
  }

  saveData("./data.json", wallets);
}

module.exports = {
  generateAndSaveWallet,
  readData,
  saveData,
  allBalances,
  allNonces,
  updateWallets,
};
