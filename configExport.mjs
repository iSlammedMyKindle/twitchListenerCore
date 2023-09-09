// Until the module standard for json is here, I'm going to make this a module so that the general object is able to be exported.
// It's never written to, so we just need to read it

const config = JSON.parse((await (await import("fs/promises")).readFile("./config.json")).toString());
Object.freeze(config);

export default config;