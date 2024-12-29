const path = require("path")

// Getting the path to %appdata%
const APPDATA = process.env.APPDATA;

// Defining an object 'PATHS' with paths related to Discord
const PATHS = {
    discord: path.join(APPDATA, "discord"),
    discordcanary: path.join(APPDATA, "discordcanary"),
    // Add more paths if needed... ( Contribute :D )
}

module.exports = {
    PATHS
}