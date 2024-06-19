"use strict";
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Gateway, Wallets } = require("fabric-network");
const bodyParser = require("body-parser");
const cors = require("cors");
const enrollUser = require("./registerUser");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Function to get contract instance
async function getContractInstance(user) {
    const orgName = 'org1.example.com';
    const orgNameWithoutDomain = orgName.split('.')[0];

    const connectionProfilePath = path.resolve(
        `/Users/akshatsrivastava/EnterpriseBlockchain/Lab1/fabric-samples/test-network/organizations/peerOrganizations/${orgName}`,
        `connection-${orgNameWithoutDomain}.json`
    );
    const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const gateway = new Gateway();
    await gateway.connect(connectionProfile, {
        wallet,
        identity: user,
        discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("balance_transfer");
    console.log(contract);
    return contract;
}

app.get("/", (req, res) => res.send("Balance Transfer Api"));

app.get("/list-accounts", async (req, res) => {
    const { user } = req.query;
    if (!user) {
        return res.status(400).json({ error: "User not specified" });
    }
    try {
        const contract = await getContractInstance(user);
        const result = await contract.evaluateTransaction('listAccounts');
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/init-account", async (req, res) => {
    const { id, balance, user } = req.body;
    if (!id || !balance || !user) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const contract = await getContractInstance(user);
        await contract.submitTransaction('initAccount', id, balance.toString());
        res.json({ message: "Account initialized successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/transfer", async (req, res) => {
    const { idFrom, idTo, amount, user } = req.body;
    if (!idFrom || !idTo || !amount || !user) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const contract = await getContractInstance(user);
        await contract.submitTransaction('transfer', idFrom, idTo, amount.toString());
        res.json({ message: "Transfer completed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/set-balance", async (req, res) => {
    const { id, newBalance, user } = req.body;
    if (!id || !newBalance || !user) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const contract = await getContractInstance(user);
        await contract.submitTransaction('setBalance', id, newBalance.toString());
        res.json({ message: "Balance set successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/enroll-user", async (req, res) => {
  const { registrarLabel, identityLabel, enrollmentID, enrollmentSecret, enrollmentAttributes } = req.body;
  if (!registrarLabel || !identityLabel || !enrollmentID || !enrollmentSecret) {
      return res.status(400).json({ error: "Missing required fields" });
  }
  try {
      await enrollUser(registrarLabel, identityLabel, enrollmentID, enrollmentSecret, { attrs: enrollmentAttributes });
      res.json({ message: `Successfully registered and enrolled user ${identityLabel}` });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/wallet-users', async (req, res) => {
  try {
    const wallet = await Wallets.newFileSystemWallet('./wallet');
    const walletUsers = await wallet.list();
    res.json(walletUsers);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// app.delete('/wallet-users/:userId', async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const wallet = await Wallets.newFileSystemWallet('./wallet');
//         await wallet.remove(userId);
//         res.json({ message: `Successfully deleted user ${userId} from the wallet` });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


const server = app.listen(port, () => console.log(`Server running on port ${port}`));
server.timeout = 60000;