/* Made by iSlammedMyKindle in 2023!
This is a much more sophisticated mock, it's designed so that 100% of the inputs are coming from
`node` command interactive terminal. The goal is to export the cruicial components, and have manual imput for everything
Even with this mock file, it could be exported for pre-defined variables outside the scope of this raw implementation, such as fake rewards or pre-made chat messages.
This is purely an interface for that sort of thing

usage:
* run node at the root of the project folder
* {evtSubList, twitchMsg} = await import("./tests/mock.mjs");*/

import "../wsServer.mjs"
export {evtSubList, twitchMsg} from "../listeners.mjs";