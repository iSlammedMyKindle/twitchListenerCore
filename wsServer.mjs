import { WebSocketServer } from "ws";
import twitchEmitter from "./twitchEmitter.mjs";
import { twitchConfig as config } from "./configExport.mjs";

/*Client connections - store these here to remove listeners that arne't required anymore upon disconnect
{
    "<wsaddress>":{
        "message":evt=>{},
        "redeem":evt=>{}
    }
}
*/
const connections = new Map();

// TODO: get rid of this and replace it with the list of listeners from the config to make this dynamic
const listeners = ['message', 'redeem', 'cheer', 'follow', 'sub'];
const eventSend = (evtObj, targetWs)=>targetWs.send(JSON.stringify(evtObj));

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
            if(listeners.indexOf(listener) > -1){
                let newListener = evt=>eventSend(evt, ws);
    
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
            twitchEmitter.emit('clientmsg', config.twitch_auth.channels[0], resJson.text, {replyTo:resJson.replyTo});

            console.log(config.twitch_auth.channels[0] + ":", resJson.text);
        }
        else if(resJson.action == 'ping'){
            ws.send(JSON.stringify({ event: 'pong' }));
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