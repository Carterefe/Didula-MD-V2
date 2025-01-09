
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const yts = require("yt-search");
const axios = require('axios');
const mimeTypes = require('mime-types');

let activeGroups = {};
let lastSongTitles = {};

// Function to fetch the latest song from YouTube
async function getLatestSong() {
    try {
        const searchResult = await yts("Sinhala songs"); // Modify this search query as needed
        const song = searchResult.all[0]; // Get the first song result

        if (!song) {
            throw new Error("No song found.");
        }

        // New API for downloading MP3
        const downloadInfo = await fetchJson(`https://apitest1-f7dcf17bd59b.herokuapp.com/download/ytmp3?url=${song.url}`);
        
        if (!downloadInfo.result || !downloadInfo.result.dl_link) {
            throw new Error("Failed to fetch download link.");
        }

        return {
            title: downloadInfo.result.title || song.title, // Fallback to song title
            artist: song.author.name,
            downloadUrl: downloadInfo.result.dl_link,
            thumbnail: song.thumbnail,
            audioUrl: downloadInfo.result.dl_link // Using the new download link
        };
    } catch (error) {
        console.error(`Error fetching latest song: ${error.message}`);
        return null;
    }
}

// Function to send the latest song to a group
async function sendSong(conn, groupId, song) {
    if (song) {
        // Check if the title is different before sending
        if (lastSongTitles[groupId] !== song.title) {
            lastSongTitles[groupId] = song.title; // Update the last song title sent to the group

            // Constructing the message
            let message = `🎶 *Latest Song*\n\n*Title:* ${song.title}\n*Artist:* ${song.artist}\n*Download Link:* ${song.downloadUrl}\n\n*© Projects of Didula Rashmika*`;

            // Downloading the MP3 file
            const res = await axios.get(song.audioUrl, { 
                responseType: 'arraybuffer',
                timeout: 15000
            });

            // Get MIME type and extension
            const mime = res.headers['content-type'] || 'application/octet-stream';
            const extension = mimeTypes.extension(mime) || 'unknown';

            // Define file name
            const fileName = `${song.title}.${extension}`; 

            // Send the message with the MP3 file
            await conn.sendMessage(groupId, {
                document: { url: song.audioUrl },
                caption: message,
                mimetype: mime,
                fileName: fileName
            });
        }
    }
}

// Function to check and post the latest song
async function checkAndPostSong(conn, groupId) {
    const latestSong = await getLatestSong();

    // Send the latest song
    if (latestSong) {
        await sendSong(conn, groupId, latestSong);
    }
}

// Command to activate 24/7 song service in a group
cmd({
    pattern: "startmusic",
    desc: "Enable automatic song updates in this group",
    isGroup: true,
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (isAdmin || isBotOwner) {
            if (!activeGroups[from]) {
                activeGroups[from] = true;
                await conn.sendMessage(from, { text: "🎵 Automatic song updates activated." });

                // Start the interval if it's not already active
                if (!activeGroups['interval']) {
                    activeGroups['interval'] = setInterval(async () => {
                        for (const groupId in activeGroups) {
                            if (activeGroups[groupId] && groupId !== 'interval') {
                                await checkAndPostSong(conn, groupId);
                            }
                        }
                    }, 60000); // Run every 60 seconds
                }
            } else {
                await conn.sendMessage(from, { text: "🎵 Automatic song updates already activated." });
            }
        } else {
            await conn.sendMessage(from, { text: "🚫 This command can only be used by group admins or the bot owner." });
        }
    } catch (e) {
        console.error(`Error in startmusic command: ${e.message}`);
        await conn.sendMessage(from, { text: "Failed to activate the music service." });
    }
});

// Command to deactivate the 24/7 song service
cmd({
    pattern: "stopmusic",
    desc: "Disable automatic song updates in this group",
    isGroup: true,
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (isAdmin || isBotOwner) {
            if (activeGroups[from]) {
                delete activeGroups[from];
                await conn.sendMessage(from, { text: "🛑 Automatic song updates deactivated." });

                // Stop the interval if no groups are active
                if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
                    clearInterval(activeGroups['interval']);
                    delete activeGroups['interval'];
                }
            } else {
                await conn.sendMessage(from, { text: "🛑 Automatic song updates are not active in this group." });
            }
        } else {
            await conn.sendMessage(from, { text: "🚫 This command can only be used by group admins or the bot owner." });
        }
    } catch (e) {
        console.error(`Error in stopmusic command: ${e.message}`);
        await conn.sendMessage(from, { text: "Failed to deactivate the music service." });
    }
});

// Command to check if the music service is active
cmd({
    pattern: "checkmusic",
    desc: "Check if the automatic song service is active in this group",
    isGroup: true,
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    if (activeGroups[from]) {
        await conn.sendMessage(from, { text: "🎵 The automatic song service is currently active in this group." });
    } else {
        await conn.sendMessage(from, { text: "🛑 The automatic song service is not active in this group." });
    }
});
