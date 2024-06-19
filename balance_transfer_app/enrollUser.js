'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');

async function enrollUser(identityLabel, enrollmentID, enrollmentSecret, enrollmentAttributes) {
    try {
        // Assuming identityLabel is in the format <username>@<organization-domain>
        const orgName = identityLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];

        // Read the connection profile.
        const connectionProfilePath = path.resolve(
            `/Users/akshatsrivastava/EnterpriseBlockchain/Lab1/fabric-samples/test-network/organizations/peerOrganizations/${orgName}`, 
            `connection-${orgNameWithoutDomain}.json`
        );

        let connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const ca = new FabricCAServices(connectionProfile['certificateAuthorities'][`ca.${orgName}`].url);

        // Create a new FileSystemWallet object for managing identities.
        const wallet = await Wallets.newFileSystemWallet('./wallet');

        // Check if the user identity already exists in the wallet.
        let identity = await wallet.get(identityLabel);
        if (identity) {
            console.log(`An identity for the ${identityLabel} user already exists in the wallet`);
            return;
        }

        // Enroll the user and import the new identity into the wallet.
        const enrollmentRequest = {
            enrollmentID: enrollmentID,
            enrollmentSecret: enrollmentSecret,
            attr_reqs: enrollmentAttributes
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
        console.error(`Failed to enroll user: ${error}`);
        throw error; // Rethrow the error to be handled by the caller
    }
}

// Exporting the main function for use in other modules.
module.exports = enrollUser;
