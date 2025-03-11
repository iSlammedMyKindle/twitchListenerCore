// Until the module standard for json is here, I'm going to make this a module so that the general object is able to be exported.
// It's never written to, so we just need to read it
import { readFile } from "fs/promises";

const readJson = async str=>JSON.parse((await (await readFile(str))).toString())

const twitchConfig = await readJson(import.meta.dirname + "/configs/twitch.json");
Object.freeze(twitchConfig);

const listenerConfig = await readJson(import.meta.dirname + '/configs/listeners.json');
Object.freeze(listenerConfig);

export { twitchConfig, listenerConfig };