/* Made by iSlammedMyKindle in 2023!
Here is a list of EventPub listeners that are created on the fly through key-value pairs
By doing this they can be mocked or actually get used by twurple. They are essentially one in the same.*/
import twitchEmitter from "./twitchEmitter.mjs";
import { listenerConfig } from "./configExport.mjs";

// This stuff is capitalized due due to matching up stuff easily on the event sub Listner object
const evtSubList = {};

// Create new functions dynamically that make use of the destructure syntax. This way we aren't for-looping for everything that we want to add and performance is quick
for(const listener in listenerConfig){
    let paramDestruct = listenerConfig[listener].params.toString();

    evtSubList[listener] = {
        apiName: listenerConfig[listener].apiName,
        modParam: listenerConfig[listener].modParam,
        func: Function('emitter', `return ({${paramDestruct}})=>{
            console.log("==${listener}==", ${paramDestruct});
            emitter.emit('${listener}',{${paramDestruct}, event:"${listener}"});
        }`)(twitchEmitter)
    };
}

// Due to the msg.id thing, we can't really make this a dynamic one.
const twitchMsg = (channel, user, text, msg)=>{
    console.log('==message==', channel, user, text);
    twitchEmitter.emit('message', { channel, user, text, id:msg.id, event: 'message' });
}

export {evtSubList, twitchMsg}