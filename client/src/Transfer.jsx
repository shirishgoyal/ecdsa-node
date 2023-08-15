import { useState } from "react";
import server from "./server";
import crypto from "./crypto";

function Transfer({ sender, privateKey, setBalance }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => {
    setter(evt.target.value);
    setMessage("");
    setMessageType("");
  };

  function txBody(sender, recipient, amount, nonce) {
    const privKey = BigInt(privateKey);

    // nonce prevent replay attacks
    const tx = {
      sender,
      recipient,
      amount,
      nonce: nonce + 1,
    };

    let publicKey = crypto.getPublicKey(privKey);

    const txHash = crypto.hashMessage(JSON.stringify(tx));

    const rawSign = crypto.signMessage(txHash, privKey);
    const signature = crypto.signatureExport(rawSign);
    const recovery = rawSign.recovery;

    return {
      sender: sender.toLowerCase(),
      recipient: recipient.toLowerCase(),
      amount,
      signature,
      recovery,
    };
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { nonce },
      } = await server.get(`nonce/${sender}`);

      const {
        data: { balance },
      } = await server.post(
        `send`,
        txBody(sender, recipient, parseInt(amount), nonce)
      );

      setBalance(balance);
      setMessage("Transaction successful");
      setMessageType("success");
    } catch (ex) {
      setMessage(ex.response.data.message);
      setMessageType("error");
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <div className={`message ${messageType}`}>{message}</div>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={amount}
          onChange={setValue(setAmount)}
        ></input>
      </label>

      <label>
        Recipient Wallet Address
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input
        type="submit"
        className="button"
        value="Transfer"
        disabled={!!privateKey || amount == null || amount <= 0 || !!recipient}
      />
    </form>
  );
}

export default Transfer;
