import { WebSocket } from "ws";

// If being tested on a local machine, you'll need this environment variable to be set for testing HTTPS (leave uncommented, comment out otherwise)
// https://medium.com/@paul.pietzko/trust-self-signed-certificates-5a79d409da9b
// https://stackoverflow.com/questions/36428809/nodejs-depth-zero-self-signed-cert#68997046
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// To only test http, remove the extra "s" in wss
const wsClient = new WebSocket("wss://localhost:9001");

wsClient.on('open', () => {
    wsClient.send(JSON.stringify(['message', 'redeem', 'chicken salad']));
});

wsClient.on('message', buffer => {
    const yes = buffer.toString();
    console.log(yes);
});

const sendText = (text, replyTo) => wsClient.send(JSON.stringify({ action: "message", text, replyTo }));
const ping = () => wsClient.send(JSON.stringify({ action: 'ping' }));

export { sendText, ping };