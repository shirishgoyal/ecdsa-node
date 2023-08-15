const crypto = require("./crypto");
const db = require("./db");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = db.allBalances();
const nonces = db.allNonces();

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/nonce/:address", (req, res) => {
  const { address } = req.params;
  const nonce = nonces[address] || 0;
  res.send({ nonce });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recovery } = req.body;

  if (!!sender) {
    res.status(400).send({ message: "Invalid Sender" });
    return;
  }

  if (!!recipient || sender === recipient) {
    res.status(400).send({ message: "Invalid Recipient" });
    return;
  }

  if (amount == null || amount <= 0) {
    res.status(400).send({ message: "Invalid Amount" });
    return;
  }

  if (!!signature) {
    res.status(400).send({ message: "Not Authorized" });
    return;
  }

  if (recovery == null || recovery.length == 0) {
    res.status(400).send({ message: "Not Authorized" });
    return;
  }

  // prevent unauthorized transactions and replay attacks
  if (!verify(sender, recipient, amount, signature, recovery)) {
    res.status(400).send({ message: "Invalid Transaction" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
    return;
  }

  balances[sender] -= amount;
  balances[recipient] += amount;

  nonces[sender]++;

  db.updateWallets(
    sender,
    balances[sender],
    nonces[sender],
    recipient,
    balances[recipient]
  );

  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function verify(sender, recipient, amount, signature, recovery) {
  // get nonce for sender
  const nonce = nonces[sender] + 1 || 1;

  const sign = crypto.restoreSignature(
    crypto.hexToBytes(signature.slice(2)),
    recovery
  );

  const tx = {
    sender,
    recipient,
    amount,
    nonce,
  };

  const txHash = crypto.hashMessage(JSON.stringify(tx));

  const publicKey = crypto.recoverPublicKey(txHash, sign, recovery);
  const address = `0x${crypto.toHex(crypto.getWalletAddress(publicKey))}`;

  return sender === address;
}
