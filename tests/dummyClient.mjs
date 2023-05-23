import { WebSocket } from "ws";

const wsClient = new WebSocket("ws://localhost:9001");

wsClient.on('open', ()=>{
//    wsClient.send('asdf');
//    wsClient.send('1234');
//    wsClient.send('!@#$');

    wsClient.send(JSON.stringify(['message', 'redeem', 'chicken salad']));
    wsClient.send(JSON.stringify({action:"message", text:"This is a cool message! salutations!"}));
});

wsClient.on('message', buffer=>{
    const yes = buffer.toString();
    console.log(yes);
});