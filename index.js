'use strict';

const http = require('http');
const WebSocketServer = require("websocket").server;
const robot = require("robotjs");
const os = require("os");
const qrcode = require('qrcode-terminal');

const port = 8765;

robot.setMouseDelay(0);
var myIP = "127.0.0.1";
const ifaces = os.networkInterfaces();
var dflag = false;
Object.keys(ifaces).forEach((ifname) => {
	for (var i = 0; i < ifaces[ifname].length; i++) {
		if('IPv4' == ifaces[ifname][i]['family'] && !ifaces[ifname][i]['internal']){
			myIP = ifaces[ifname][i]['address'];
		}
	};
});

const httpserver = http.createServer((request, response) => {
	response.writeHead(404);
	response.end();
});
httpserver.listen(port, () => {
	console.log("ws://" + myIP + ":" + port +"  を入力するか、アプリ内からQRコードを読み込んでください");
	qrcode.generate("ws://" + myIP + ":" + port);
});

const wsServer = new WebSocketServer({
	httpServer: httpserver,
	autoAcceptConnections: false
});
const MouseMove = (x, y) => {
	let mouse = robot.getMousePos();
	robot.moveMouse(mouse.x - x, mouse.y - y);
};

wsServer.on('request', (request) => {
	let connection = request.accept();
	console.log((new Date()) + 'Connected.');
	connection.on('message', (msg) => {
		if (msg.type === 'utf8') {
			if(msg.utf8Data === 'cd'){
				robot.mouseToggle("down");
        dflag = true;
			}else if(msg.utf8Data === 'cu'){
				robot.mouseToggle("up");
        dflag = false;
			}else{
				let msgt = msg.utf8Data.split(',');
				if(msgt[0] === 'p'){
					MouseMove(msgt[1], msgt[2]);
				}else if(msgt[0] === 'm'){
					robot.scrollMouse(0, -msgt[2]);
				}
			}
		}
	});
	connection.on('close', (reasonCode, description) => {
		console.log((new Date()) + connection.remoteAddress + ' disconnected.');
    if(dflag){
      dflag = false;
      robot.mouseToggle("up");
    }
	});
});



