/*Made by iSlammedMyKindle in 2023!
A central point to where listeners from twitch get sent in real time through websockets.
Multiple items can be subscribed to these evnets, and upon event trigger, all these subscribed items will react in real time.*/

import { authenticateTwitch } from "kindle-twitch-oauth";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider, getTokenInfo } from "@twurple/auth";
import { WebSocketServer } from "ws";
import { EventEmitter } from "node:events";
import { PubSubClient } from "@twurple/pubsub";
import { ChatClient } from "@twurple/chat";
import fs from 'fs';

// Either I'm confused or promises for reading the file isn't working like in twitchToDiscord
function readJson(path){
    return new Promise((res,rej)=>{
        fs.readFile(path, 'utf-8', (err, data)=>{
            if(err) rej(err);
            res(JSON.parse(data));
        })
    });
}

async function fetchToken(config = {}, tokensDir = './tokens.json'){
    try{
        fs.statSync(tokensDir);

        console.log('Found '+tokensDir+'! Using that to login');
        return readJson(tokensDir);
    }
    catch(e){
        const response = await authenticateTwitch(config.twitch_auth, config.https);

        //When we get the response, we also write it to the tokens file
        fs.writeFile(tokensDir, JSON.stringify(response), 'utf-8', ()=>{});
        return response;
    }
}

// Authenticate and login to twitch
// Figure out if we have a token saved - if not, create a new one by authenticating twitch
const config = await readJson('./config.json');
var tokenData = await fetchToken(config);

// https://twurple.js.org/reference/pubsub/classes/BasicPubSubClient.html#listen
// For each thing you're listening to, you'll need to place your token inside the .listen function

const authProvider = new RefreshingAuthProvider({
    clientId: config.twitch_auth.client_id,
    clientSecret: config.twitch_auth.client_secret,
    onRefresh: newTokenData=>{
        tokenData = newTokenData;
        fs.writeFile('./tokens.json', JSON.stringify(newTokenData), 'utf-8', ()=>{});
    }
});

//One refreshing auth provider should give us the client for everything

//Api client - used to grab specific things not directly related to the current action (specific user ID is required to get things going here in order to detect channel point redeems)
const apiClient = new ApiClient({ authProvider });

authProvider.addUser((await (getTokenInfo(tokenData.accessToken, config.twitch_auth.clientId))).userId, tokenData,['chat', 'channel']);

//Messages client - for every message in chat, ping it back to the events
// const chatClient = new ChatClient({ authProvider, channels:config.twitch_auth.channels });
// chatClient.connect();

//Channel points (pubSub)

//THIS AUTHPROVIDER PARAMETER WAS FREAKEN UNDOCUMENTED ...oof
const pubSub = new PubSubClient({ authProvider });
const targetChannel = await apiClient.users.getUserByName(config.twitch_auth.channels[0]);

pubSub.onRedemption(targetChannel.id, m=>{
    console.log('yay!', m);
});