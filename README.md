# CBDC Application

A simple Central Bank Digital Currency (CBDC) application leveraging the account transfer functions of the Account Transfer Application in Hyperledger Fabric. The application includes additional functionalities such as freezing and unfreezing accounts.

## Features
- Register & Enroll user: Feature to register and enroll a new user
- Account Initialization: Users can initialize new accounts with unique identifiers
- Set Balance: Set the intial balance for an account, the same method can be used to update the balance of an account
- Freeze Account: Freeze an account to prevent any transaction or any modification to the account
- Transfer: Transfer funds between accounts
- Unfreeze Account: Unfreeze a previously frozen account to allow transactions

## Prerequisites
- Docker
- Node.js and npm
- React
- Hyperledger Fabric binaries and Docker images

# Setup Instructions

## Step 1: Set Up the Network

1. Clone the CBDC repository

__Note__: you should already have fabric-samples repo on your system.

```
cd fabric-samples
git clone https://github.com/akshatsri19/CBDC.git
```

2. Clean up and set the environment variables
```
cd test-network
```
```
./network.sh down
```
```
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

3. Start the network channel
```
.network.sh up createChannel -ca -s couchdb 
```
```
sudo chmod a+rwx -R organizations  ## this is only done for project env
```
```
sudo chmod a+rwx -R ../config  ## this is only done for project env
```

4. Deploy the chaincode
```
./network.sh deployCC -ccn cbdc -ccv 1.0 -ccp ../CBDC/balance_transfer -ccl javascript
```

5. Test to see if you see the mychannel and installed chaincode
```
peer channel list
```
```
peer lifecycle chaincode queryinstalled
```

<details open>
<summary>Open to see the commands to invoke the chaincode to test the functions using commands here. </summary>
<h4> Invoke chaincode: </h4>
<pre>
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel \
    -n balance_transfer \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    -c '{"function":"initAccount","Args":["A1","100"]}'
</pre>
<h4>List the initial balance</h4>
<pre>
peer chaincode query \
    -C mychannel \
    -n balance_transfer \
    -c '{"function":"listAccounts", "Args":[]}' | jq
</pre>

<h4>
Repeat same invoke command with -c '{"function":"setBalance","Args":["A1","150"]}'
</h4>
<pre>
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel \
    -n balance_transfer \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    -c '{"function":"setBalance","Args":["A1","150"]}'
</pre>
<h4>Now, list the new balance</h4>
<pre>
peer chaincode query \
    -C mychannel \
    -n balance_transfer \
    -c '{"function":"listAccounts", "Args":[]}' | jq
</pre>
<h4> Use the following commands to invoke freezeAccount and unfreezeAccount functions in chaincode </h4>

freezeAccount
<pre>
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel \
    -n balance_transfer \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    -c '{"function":"freezeAccount","Args":["A1"]}'  
</pre>

unfreezeAccount
<pre>
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel \
    -n balance_transfer \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    -c '{"function":"unfreezeAccount","Args":["A1"]}'   
</pre>

<h4>Change user to User1</h4>
<pre>
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp
</pre>
<h4>Initialize the account with some funds</h4>
<pre>
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel \
    -n balance_transfer \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    -c '{"function":"initAccount","Args":["U1","150"]}'
</pre>
<h4>Now transfer between User1 (U1) and Admin (A1)</h4>
<pre>
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel \
    -n balance_transfer \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    -c   '{"function":"transfer","Args":["U1","A1", "100"]}'
</pre>
<h4>List the final balance of U1</h4>
<pre>
peer chaincode query \
    -C mychannel \
    -n balance_transfer \
    -c '{"function":"listAccounts", "Args":[]}' | jq
</pre>
<h4>And then the final balance of A1</h4>
<pre>
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp

peer chaincode query \
    -C mychannel \
    -n balance_transfer \
    -c '{"function":"listAccounts", "Args":[]}' | jq
</pre>
</details>

## Step 2: Using Fabric Application Gateway, Wallets to interact with Chaincode

Go into the balance_transfer_app directory

> [!TIP]
> To avoid any issues accessing the organizations directory make sure to set path to the directory containing CBDC as HOME. `export HOME=/path/to/directory/containingCBDC`.

```
cd ../CBDC/balance_transfer_app
```
Install node node modules
```
npm install
```
First you have to enroll the admin user (required)
```
node enrollUser.js 'CAAdmin@org1.example.com' admin adminpw
```

__NOTE__: The registration and enrollment of user can be done via frontent as well. Start the backend server `node app.js`and Skip to [Step 3](#step-3-interact-through-frontend) to interact with chaincode through frontend.

Now register user as follows (The registration and enrollment of user can be performed via frontend as well.)
```
node registerUser.js 'CAAdmin@org1.example.com' 'User1@org1.example.com' '{"secret": "userpw"}'
```
Then enroll user
```
node enrollUser.js 'User1@org1.example.com' 'User1@org1.example.com' userpw
```

Using User1 credentials create account acc1
```
node submitTransaction.js 'User1@org1.example.com' initAccount acc1 100
```

To check the balance
```
node submitTransaction.js 'User1@org1.example.com' listAccounts
```
Register and enroll User2
```
node registerUser.js 'CAAdmin@org1.example.com' 'User2@org1.example.com' '{"secret": "userpw2"}'
```
```
node enrollUser.js 'User2@org1.example.com' 'User2@org1.example.com' userpw2
```

Note: If your network is restarted, you will need to remove the wallet directory (and regsiter and enroll again) because the public/private keys will no longer match the issuing CA on your network.

## Step 3: Interact through Frontend

1. Navigate to frontend directory

```
cd ../balance_transfer_app_frontend
```
2. Install dependencies

```
npm install
```
3. Run the frontend application

```
npm start
```
4. Open the browser and navigate to the url displayed on terminal
```
http://localhost:3001 (port number may differ)
```
The backend is running on port 3000 and frontend will run on a different port (probably 3001).

5. Use the interface to interact with the CBDC application
- Intialize accounts
- Set balance
- Freeze and unfreeze accounts
- Transfer funds between accounts

# Conclusion

This README provides a step-by-step guide to setting up and interacting with a simple CBDC application built on Hyperledger Fabric. The application includes additional functionalities to manage accounts effectively. Follow the instructions carefully to deploy and run the application successfully.


