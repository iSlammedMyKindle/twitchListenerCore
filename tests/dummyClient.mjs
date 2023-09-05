import { WebSocket } from "ws";

const wsClient = new WebSocket("ws://localhost:9001");

wsClient.on('open', ()=>{
    wsClient.send(JSON.stringify(['message', 'redeem', 'chicken salad']));
});

wsClient.on('message', buffer=>{
    const yes = buffer.toString();
    console.log(yes);
});

const sendText = (text, replyTo)=>wsClient.send(JSON.stringify({action:"message", text, replyTo}))

export { sendText };