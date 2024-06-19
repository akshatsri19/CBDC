'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');

async function registerAndEnrollUser(registrarLabel, identityLabel, enrollmentID, enrollmentSecret, optional = {}) {
    try {
        // Create a new FileSystemWallet object for managing identities.
        const wallet = await Wallets.newFileSystemWallet('./wallet');

        // Check to see if we've already enrolled the registrar user.
        const registrarIdentity = await wallet.get(registrarLabel);
        if (!registrarIdentity) {
            console.log(`An identity for the registrar user ${registrarLabel} does not exist in the wallet`);
            console.log('Run the enrollUser.js application before retrying');
            return;
        }

        const orgName = registrarLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];

        // Read the connection profile.
        const connectionProfilePath = path.resolve(
            `/Users/akshatsrivastava/EnterpriseBlockchain/Lab1/fabric-samples/test-network/organizations/peerOrganizations/${orgName}`, 
            `connection-${orgNameWithoutDomain}.json`
        );

        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const ca = new FabricCAServices(connectionProfile['certificateAuthorities'][`ca.${orgName}`].url);

        const provider = wallet.getProviderRegistry().getProvider(registrarIdentity.type);
        const registrarUser = await provider.getUserContext(registrarIdentity, registrarLabel);

        // Register the user and return the enrollment secret.
        const registerRequest = {
            enrollmentID: enrollmentID,
            enrollmentSecret: optional.secret || enrollmentSecret,
            role: 'client',
            attrs: optional.attrs || []
        };
        const secret = await ca.register(registerRequest, registrarUser);
        console.log(`Successfully registered the user with the ${enrollmentID} enrollment ID and ${secret} enrollment secret.`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(identityLabel);
        if (identity) {
            console.log(`An identity for the ${identityLabel} user already exists in the wallet`);
            return;
        }

        // Enroll the user, and import the new identity into the wallet.
        const enrollmentRequest = {
            enrollmentID: enrollmentID,
            enrollmentSecret: secret,
            attr_reqs: optional.attrs || []
        };
        const enrollment = await ca.enroll(enrollmentRequest);

        const orgNameCapitalized = orgNameWithoutDomain.charAt(0).toUpperCase() + orgNameWithoutDomain.slice(1);
        identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgNameCapitalized}MSP`,
            type: 'X.509',
        };

        await wallet.put(identityLabel, identity);
        console.log(`Successfully enrolled ${identityLabel} user and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register and enroll user: ${error}`);
        throw error; // Rethrow the error to be handled by the caller
    }
}

// Exporting the function for use in other modules.
module.exports = registerAndEnrollUser;
