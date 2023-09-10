/* Made by iSlammedMyKindle in 2023!
Here is a list of EventPub listeners that are created on the fly through key-value pairs
By doing this they can be mocked or actually get used by twurple. They are essentially one in the same.*/
import twitchEmitter from "./twitchEmitter.mjs";

// This stuff is capitalized due due to matching up stuff easily on the event sub Listner object
const listenerConfig = {
    // https://twurple.js.org/reference/eventsub-base/classes/EventSubChannelRedemptionAddEvent.html
    ChannelRedemptionAdd: { short:"redeem", params:["rewardTitle", "rewardCost", "userName", "userDisplayName"] },
    ChannelCheer: { short:"cheer", params:["bits", "userName", "userDisplayName", "broadcasterName", "message"] },
}

const evtSubList = {};

// Create new functions dynamically that make use of the destructure syntax. This way we aren't for-looping for everything that we want to add and performance is quick
for(const i in listenerConfig){
    let short = listenerConfig[i].short;
    let paramDestruct = listenerConfig[i].params.toString();
    evtSubList[i] = Function('emitter', `return ({${paramDestruct}})=>{
        console.log("==${short}==", ${paramDestruct});
        emitter.emit('${short}',{${paramDestruct}, event:"${short}"});
    }`)(twitchEmitter);
}

// Due to the msg.id thing, we can't really make this a dynamic one.
const twitchMsg = (channel, user, text, msg)=>{
    console.log('==message==', channel, user, text);
    twitchEmitter.emit('message', { channel, user, text, id:msg.id, event: 'message' });
}

export {evtSubList, twitchMsg}