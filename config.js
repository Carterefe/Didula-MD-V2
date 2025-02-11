const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {

FOOTER: process.env.FOOTER || "*◆─〈 ✦𝐃𝐢𝐝𝐮𝐥𝐚 𝐌𝐃 𝐕𝟐✦ 〉─◆*",
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/tC37Q7B/20241220-122443.jpg",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
MODE: process.env.MODE || "public",
ALWAYS_ONLINE : process.env.ALWAYS_ONLINE || "false",
AUTO_TYPING: process.env.AUTO_TYPING || "false",
AUTO_RECORDING: process.env.AUTO_RECORDING || "true",
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
AUTO_STATUS__MSG: process.env.AUTO_STATUS__MSG || "*SEEN YOUR STATUS BY Didula MD V2*",
ANTI_CALL: process.env.ANTI_CALL || "false",
SESSION_ID: process.env.SESSION_ID || "Ai1QBSyR#Nbj64l5I5KGDU-ZyB2zl0Bee4RptoXp8w6B_951Tw7U",
ALIVE_REACT: process.env.ALIVE_REACT || "⚠️",
};


