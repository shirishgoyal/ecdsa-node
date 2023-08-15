import server from "./server";
import crypto from "./crypto";

function Wallet({
  privateKey,
  setPrivateKey,
  address,
  setAddress,
  balance,
  setBalance,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;

    if (privateKey) {
      setPrivateKey(privateKey);

      const privKey = BigInt(privateKey);
      const publicKey = crypto.getPublicKey(privKey);
      const address = `0x${crypto.toHex(crypto.getWalletAddress(publicKey))}`;

      setAddress(address);

      if (address) {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Type a private key, for example: 0x1"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div className="address">Address: {address}</div>
      <div
        className={`balance ${
          balance > 0 ? "balance-success" : "balance-fail"
        }`}
      >
        Balance: {balance}
      </div>
    </div>
  );
}

export default Wallet;
