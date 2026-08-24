/* Made by iSlammedMyKindle in 2023!
Here is a list of EventPub listeners that are created on the fly through key-value pairs
By doing this they can be mocked or actually get used by twurple. They are essentially one in the same.*/
import twitchEmitter from "./twitchEmitter.mjs";
import { listenerConfig } from "./configExport.mjs";

// This stuff is capitalized due due to matching up stuff easily on the event sub Listner object
const evtSubList = {};

// Create new functions dynamically that make use of the destructure syntax. This way we aren't for-looping for everything that we want to add and performance is quick
for (const listener in listenerConfig) {
  let paramDestruct = listenerConfig[listener].params.toString();

  evtSubList[listener] = {
    apiName: listenerConfig[listener].apiName,
    modParam: listenerConfig[listener].modParam,
    func: Function(
      "emitter",
      `return ({${paramDestruct}})=>{
            console.log("==${listener}==", ${paramDestruct});
            emitter.emit('${listener}',{${paramDestruct}, event:"${listener}"});
        }`,
    )(twitchEmitter),
  };
}

// Due to the msg.id thing, we can't really make this a dynamic one.
const twitchMsg = (channel, user, text, msg) => {

  console.log("==message==", channel, user, text);

  // Since emoji are being sent via map, the raw data needs to be translated back into a JSON object to transmit over WSS
  const emoteOffsets = [...msg.emoteOffsets.entries()].reduce((acc, value) => {
    // [ 'emotesv2_c032d7d60b3e41bf8b5582fb43c5bb37', [ '0-10', '18-28' ] ]
    acc[value[0]] = value[1];

    return acc;
  }, {});

  if (Object.keys(emoteOffsets).length)
    console.log("==emoteOffsets==", emoteOffsets);

  twitchEmitter.emit("message", {
    channel,
    user,
    text,
    emoteOffsets,
    id: msg.id,
    event: "message",
  });
};

export { evtSubList, twitchMsg };
