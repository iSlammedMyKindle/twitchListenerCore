/* Made by iSlammedMyKindle in 2023!
Here is a list of EventPub listeners that are created on the fly through key-value pairs
By doing this they can be mocked or actually get used by twurple. They are essentially one in the same.*/
import twitchEmitter from "./twitchEmitter.mjs";

// This stuff is capitalized due due to matching up stuff easily on the event sub Listner object
const evtSubList = {
    // https://twurple.js.org/reference/eventsub-base/classes/EventSubChannelRedemptionAddEvent.html
    ChannelRedemptionAdd:function({rewardTitle, rewardCost, userName, userDisplayName}){
        console.log('==Redeem==', rewardTitle, rewardCost, userName, userDisplayName);
        twitchEmitter.emit('redeem', arguments[0]);
    },
    
    ChannelCheer:function(){
        twitchEmitter.emit('cheer', arguments[0]);
    }
};

export default evtSubList