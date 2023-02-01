#!/usr/bin/node




const http = require('http');

let http_server = http.createServer(function(request, result){
	console.log("alguien se conecta");
	result.write('ola k ase');
	result.end();
})

http_server.listen(8080);
