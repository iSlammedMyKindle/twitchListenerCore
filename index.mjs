/*Made by iSlammedMyKindle in 2023!
A central point to where listeners from twitch get sent in real time through websockets.
Multiple items can be subscribed to these evnets, and upon event trigger, all these subscribed items will react in real time.*/

import { authenticateTwitch } from "kindle-twitch-oauth";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider, getTokenInfo } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { evtSubList, twitchMsg } from "./listeners.mjs";
import { readFile, writeFile, access } from "fs/promises";
import { twitchConfig as config, twitchConfig } from "./configExport.mjs";
import twitchEmitter from "./twitchEmitter.mjs";
import { createServer } from "http";
import otp from "otp";
import "./wsServer.mjs";

async function fetchToken(config = {}, tokensDir = './tokens.json'){
    try{
        if(config.newToken) throw new Error('Getting a new token on purpose');

        await access(tokensDir);

        console.log('Found '+tokensDir+'! Using that to login');
        return JSON.parse((await readFile(tokensDir)).toString());
    }
    catch(e){
        const response = await authenticateTwitch(config.twitch_auth, config.https);

        //When we get the response, we also write it to the tokens file
        writeFile(tokensDir, JSON.stringify(response));
        return response;
    }
}

// Authenticate and login to twitch
// Figure out if we have a token saved - if not, create a new one by authenticating twitch
var tokenData;
var evtSub;
var chatClient;

async function init(newToken = false){
    tokenData = await fetchToken({...config, newToken});
    // Stop the original eventSub listener
    evtSub?.stop();
    chatClient?.quit();

    // https://twurple.js.org/reference/pubsub/classes/BasicPubSubClient.html#listen
    // For each thing you're listening to, you'll need to place your token inside the .listen function
    const authProvider = new RefreshingAuthProvider({
        clientId: config.twitch_auth.client_id,
        clientSecret: config.twitch_auth.client_secret,
    });
    
    authProvider.onRefresh(async function(userId, newTokenData){
        tokenData = newTokenData;
        return await writeFile('./tokens.json', JSON.stringify(newTokenData), 'utf-8');
    });
    
    //One refreshing auth provider should give us the client for everything
    
    //Api client - used to grab specific things not directly related to the current action (specific user ID is required to get things going here in order to detect channel point redeems)
    const apiClient = new ApiClient({ authProvider });
    
    authProvider.addUser((await (getTokenInfo(tokenData.accessToken, config.twitch_auth.clientId))).userId, tokenData, ['chat', 'channel']);
    
    //Messages client - for every message in chat, ping it back to the events
    chatClient = new ChatClient({ authProvider, channels:config.twitch_auth.channels });
    chatClient.onMessage(twitchMsg);
    chatClient.connect();
    
    // EventSub
    // Channel points
    const targetChannel = await apiClient.users.getUserByName(config.twitch_auth.channels[0]);
    
    evtSub = new EventSubWsListener({ apiClient });
    
    // Load the listeners for EventSub:
    for(var key in evtSubList)
        evtSub["on"+(evtSubList[key].apiName)](targetChannel.id, ...(evtSubList[key].modParam ? [targetChannel.id, evtSubList[key].func] : [evtSubList[key].func]));
    
    evtSub.start();
    console.log("Everything connected!");
}

// twitchEmitter is custom so it can be separate from the twurple itself.
twitchEmitter.on('clientmsg', (channel, text, replyTo)=>{
    chatClient.say(channel, text, replyTo).then(
        e=>console.log('client:', channel, text, replyTo), 
        e=>console.error('Failed to send client message -_-', e)
    );
});

init();

// This server here is made to reach out in case the core decides to die. One request and it will re-fetch the token upon browser prompt
// setup otp authentication via get parameters
const otpInstance = otp.parse(twitchConfig.otp);
const refreshServer = createServer((req, res)=>{
    console.log(new URLSearchParams(req.search).get('otp'), otpInstance.totp());
    if(new URLSearchParams(req.url.split('?')[1]).get('otp') != otpInstance.totp()){
        res.statusCode = 404;
        res.end();
        return;
    }

    // If the code is correct, initiate a server reboot, but don't disconnect existing clients
    console.log('Restart requested, re-running init()');
    res.statusCode = 200;
    res.write('restarting!');
    res.end();

    init(true);
});

refreshServer.listen('9100');