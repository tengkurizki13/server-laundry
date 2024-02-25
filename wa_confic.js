const {
    default: makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    isJidBroadcast,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const path = require('path'); 
const fs = require('fs').promises;
const log = (pino = require("pino"));
const { session } = { "session": "baileys_auth_info" };
const { Boom } = require("@hapi/boom");

// const server = require("http").createServer(app);
// const io = require("socket.io")(server);
const qrcode = require("qrcode");
const folderPath = path.join(__dirname, 'baileys_auth_info');


let sock;
let qr;
let soket;


async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
    let { version, isLatest } = await fetchLatestBaileysVersion();
    sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: log({ level: "silent" }),
        version,
        shouldIgnoreJid: jid => isJidBroadcast(jid),
    });
    sock.multi = true
    sock.ev.on('connection.update', async (update) => {
        //console.log(update);
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect.error).output.statusCode;
            if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
                updateQR("qrscanned")
                await fs.rmdir(folderPath, { recursive: true });
                sock.logout();
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log("Connection closed, reconnecting....");
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Connection Lost from Server, reconnecting...");
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                updateQR("qrscanned")
                await fs.rmdir(folderPath, { recursive: true });
                sock.logout();
                connectToWhatsApp();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`); 
                updateQR("qrscanned")
                await fs.rmdir(folderPath, { recursive: true });
                sock.logout();
                connectToWhatsApp();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...");
                connectToWhatsApp();
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut, Reconnecting...");
                connectToWhatsApp();
            } else {
                sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('opened connection');
            updateQR("connected");
            return;
        }
        if (update.qr) {
            qr = update.qr;
            updateQR("qr");
        }
        else if (qr = undefined) {
            updateQR("loading");
        }
        else {
            if (update.connection === "open") {
                updateQR("qrscanned");
                return;
            }
        }
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        //console.log(messages);
        if (type === "notify") {
            if (!messages[0].key.fromMe) {
                //tentukan jenis pesan berbentuk text                
                const pesan = messages[0].message.conversation;

                //nowa dari pengirim pesan sebagai id
                const noWa = messages[0].key.remoteJid;

                await sock.readMessages([messages[0].key]);

                //kecilkan semua pesan yang masuk lowercase 
                const pesanMasuk = pesan.toLowerCase();

                if (!messages[0].key.fromMe && pesanMasuk === "pickup_citra_jaya") {
                    await sock.sendMessage(noWa, { text: `Halo,
                    
Terima kasih atas kenginan anda untuk mengunakan fitur pick up ini silahkan share lok ya!
biaya per km = Rp.10.000
Salam hangat,


Tim laundry citra jaya` }, { quoted: messages[0] });
                }
            }
        }
    });
}


const setSocketIOInstance = (io) => {
    soket = io; 
};

// functions
const isConnected = () => {
    return (sock.user);
};

const fileSock = () => {
    return sock;
};

const kodeQr = () => {
    return qr;
};

const updateQR = (data) => {
    switch (data) {
        case "qr":
            qrcode.toDataURL(qr, (err, url) => {
                soket?.emit("qr", url);
                soket?.emit("log", "scan");
            });
            break;
        case "connected":
            soket?.emit("qrstatus", "../../assets/images.jpeg");
            soket?.emit("log", "connected");
            break;
        case "qrscanned":
            soket?.emit("qrstatus", "./assets/check.svg");
            soket?.emit("log", "QR Code Telah discan!");
            break;
        case "loading":
            soket?.emit("qrstatus", "./assets/loader.gif");
            soket?.emit("log", "Registering QR Code , please wait!");
            break;
        default:
            break;
    }
};






module.exports = {connectToWhatsApp,isConnected,fileSock,kodeQr,setSocketIOInstance,updateQR}

