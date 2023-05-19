/*Made by iSlammedMyKindle in 2023!
A central point to where listeners from twitch get sent in real time through websockets.
Multiple items can be subscribed to these evnets, and upon event trigger, all these subscribed items will react in real time.*/

import { authenticateTwitch } from "kindle-twitch-oauth";
import { ApiClient } from "@twurple/api/lib";
import { RefreshingAuthProvider } from "@twurple/auth/lib";
import { WebSocketServer } from "ws";
import { EventEmitter } from "node:events";
import { BasicPubSubClient } from "@twurple/pubsub/lib";
import fs from 'fs';

async function fetchToken(config = {}, tokensDir = './tokens.json'){
    if(await fs.stat(tokensDir))
        return JSON.parse(await fs.readFile(tokensDir, 'utf-8'));

    else{
        let response = await authenticateTwitch(config.twitch_auth, config.https);

        //When we get the response, we also write it to the tokens file
        fs.writeFile(JSON.stringify(response), 'utf-8');
        return response;
    }
}


// Authenticate and login to twitch
// Figure out if we have a token saved - if not, create a new one by authenticating twitch
const config = JSON.parse(await fs.readFile('./config.json', 'utf-8'))
var tokenData = await fetchToken(config);

// https://twurple.js.org/reference/pubsub/classes/BasicPubSubClient.html#listen
// For each thing you're listening to, you'll need to place your token inside the .listen function

const authProvider = new RefreshingAuthProvider({
    clientId: config.twitch.client_id,
    clientSecret: config.twitch.client_secret,
    onRefresh: newTokenData=>{
        tokenData = newTokenData;
        fs.writeFile('./tokens.json', JSON.stringify(newTokenData), 'utf-8');
    }
});

//One refreshing auth provider should give us the client for everything

//Messages client - for every message in chat, ping it back to the events


//Channel points (pubSub)