/*
 * This script generates a JSON file for the server side to manage redirections.
 * In this case, we generate a vercel.json file for Vercel to handle these redirections.
 * (More information on redirections can be found in https://vercel.com/docs/concepts/projects/project-configuration)
 */

'use strict';
const fs = require('fs');
const urlRedirections = require('../resources/urlRedirections');

// Constants
const permanentRedirection = false;

// Creating the redirection paths
let serverConfigRedirections = [];
for (const pathFrom in urlRedirections) {
    serverConfigRedirections.push({
        "source": pathFrom,
        "destination": urlRedirections[pathFrom],
        "permanent": permanentRedirection
    });
}

// Creating the JSON object for the server
const serverConfigJson = {
    "redirects": serverConfigRedirections
};

// Vercel file should go in the root of the project
fs.writeFileSync('../vercel.json', JSON.stringify(serverConfigJson));

