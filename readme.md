# twitchListenerCore

`twitchListenerCore` is a multi-client websocket event emitter for twitch. It's designed to take in standard events through twitch's eventSub (via twurple), and send them to multiple applications connected to this core. This way there doesn't need to be an api key for each thing being built, therefore fewer resources and less instances of twurple need to be made.

Some examples of this core being used are: tGem, textToSpeechTLCModule, and the avatar on the iSlammedMyKindle twitch channel.

## Usage

Fill out the `twitch.example.json` file with the application info that was made on the dev.twitch.tv dashboard. Rename it to `twitch.json`

Launch the application through `node index.mjs` and authenticate with twitch.

You can connect the core through a websocket connection on port `9001`.

To start listening to things through the listener core, your connected application needs to tell the core what you want to listen to. Send a JSON array after the connection to describe your intents: `["message", "redeem", "cheer"]`

If you want to add more listeners, they can be created in `./configs/listeners.json`. You can discover more through the [twurple documentation](https://twurple.js.org/reference/eventsub-ws/classes/EventSubWsListener.html). Right now the listener core only goes as deep as primitives, it will likely parse objects into JSON if you list those variables, I haven't tested this though.

### OTP

If twitchListenerCore dies (it no longer listens to twitch), you can reboot it using an OTP 6-digit key. This allows all clients to remain connected while re-connecting to twitch. To make a 6-digit key, run `node` in the console and execute the following:

```js
require('otp').parse();
```

it will give you a `secret`, e.g `VD7[...]G3SVI=`. Make something like the following in a QR-code to get a 6-digit code in something like authy: `oauth://totp/twitchListenerCore?secret=VD7[...]G3SVI=`

Finally, when the server is running, make a call to the server on port `9100`

`http://localhost:9100?otp=123456`

Where `123456` is the 6-digit code that the authenticator application gives you.

## Mocking

You can use the mock server (`./tests/mockServer.mjs`) to test the listeners without connecting to twitch. The exported listeners are in their rawest form, so executing them requires arguments on your end.

This model can allow for other services besides twitch to use the core. The mock for testing is an example of the most barebones implementation of the listeners.

### Setup

Run `node` and inside the interactive terminal, run `{evtSubList, twitchMsg} = await import('./tests/mockServer.mjs')`, you'll then be able to run the event functions directly and send events to clients of the mock

`evtSubList.redeem.func({ rewardTitle: 'sample redeem', rewardCost: 250, userName: 'islammedmykindle,', userDisplayName: 'iSlammedMyKindle'})`