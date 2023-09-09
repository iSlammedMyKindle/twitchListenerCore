import { WebSocketServer } from "ws";
import twitchEmitter from "./twitchEmitter.mjs";
import config from "./configExport.mjs";

/*Client connections - store these here to remove listeners that arne't required anymore upon disconnect
{
    "<wsaddress>":{
        "message":evt=>{},
        "redeem":evt=>{}
    }
}
*/
const connections = new Map();

const listeners = {
    'message': (evt, targetWs)=>targetWs.send(JSON.stringify(evt)),
    'redeem': (evt, targetWs)=>targetWs.send(JSON.stringify({title:evt.rewardTitle, userName: evt.userName, displayName:evt.userDisplayName, rewardCost: evt.rewardCost})),
    'cheer': (evt, targetWs)=>targetWs.send(JSON.stringify({ userDisplayName: evt.userDisplayName, userName: evt.userName, broadcasterName: evt.broadcasterName, bits: evt.bits, message: evt.message}))
}

const clientMsg = (ws, m)=>{
    if(!m.toString()){
        console.warn('Received empty message from ws client...?');
        return;
    }

    const resJson = JSON.parse(m.toString());

    if(Array.isArray(resJson)){
        const accepted = [];
        const rejected = [];
        for(const listener of resJson){
            if(listeners[listener]){
                let newListener = evt=>listeners[listener](evt, ws);
    
                connections.get(ws)[listener] = newListener;
                twitchEmitter.on(listener, newListener);
                accepted.push(listener);
            }
            else rejected.push(listener);
        }

        ws.send(JSON.stringify({ accepted, rejected }));
    }
    else{
        // This is an object; it probably has a thing
        // Not scalable by any means - if I want to perform more actions than this, it would definitely be worth putting these into functions
        if(resJson.action == 'message'){
            /*Say something back in the twitch channel, it's not documented, but you can use a message ID to reply back to a message (replyTo).
            The other method is a message object, which doesn't make sense with this core atm.*/
            const msgParams = [config.twitch_auth.channels[0], resJson.text, {replyTo:resJson.replyTo}];
            chatClient.say(...msgParams).then(e=>{
                console.log('client:', ...msgParams);
            }, e=>{
                console.error('Failed to send client message -_-', e);
            });

            console.log(config.twitch_auth.channels[0] + ":", resJson.text);
        }
    }
}

const connectionClose = ws=>{
    //Remove all listeners associated with this connection
    const existingConnections = connections.get(ws);
    for(const i in existingConnections) twitchEmitter.off(i, existingConnections[i]);

    //Delete this webSocket connection from the list
    connections.delete(ws);
    console.log('ws client disconnected');
}

const newConnection = ws=>{
    //Set the connection to a unique object that can be queried later for deletion;
    console.log("Connected to a new ws client");
    connections.set(ws, {});

    ws.on('message', m=>clientMsg(ws, m));
    ws.on('close', ()=>connectionClose(ws));
}

//The websocket server is responsible for handling multiple connections. It's down here so we can reach the config file
new WebSocketServer({ port: config.ws?.port || 9001 }).on("connection", newConnection);