import { WebSocketServer } from "ws";

const wsServer = new WebSocketServer({ port: 9001 });
wsServer.on("connection", function(){
    console.log('stuff', arguments);

    arguments[0].on('message', function(){
        console.log('yes', arguments);
    });
});
