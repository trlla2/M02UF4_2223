#!/usr/bin/node




const http = require('http');
const { MongoClient } = require('mongodb');
//or as a module:
//import  { MongoClient } from 'mongodb'

//conection url 
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

//database name
const dbName = 'abascal';

let db;

async function db_connect() {
	//use conection method to conect to the server
	await client.connect();
	console.log('Connected successfully to sever');
	db = client.db(dbName);
	//const collection = db.collection('characters');

	//the following code examples can be paste here...



	return 'Conectandonos a la base de datos de mongoDB ';
}

db_connect()
	.then(info => console.log(info))
	.catch(msg => console.error(msg));

function send_characters (response){
	let collection = db.collection('characters');
	


	collection.find({}).toArray().then(characters =>{ 
		let names = [];
		
		for (let i = 0; i < characters.length; i++){
			names.push(characters[i].name);
		}

		response.write(JSON.stringify(names));
		response.end();
	});
}
function send_age(response, url){
	if (url.length <3){
		response.write("ERROR:Edad erronia");
		response.end();
		return;
	}
	let collection = db.collection('characters');
	
	collection.find({"name":url[2]}).toArray().then(character =>{:w
			let data = {
				age: character[0].age
			}

		
		response.write(JSON.stringify(name));
		response.end();
	});
}


let http_server = http.createServer(function(request, response){

	
	if (request.url == "/favicon.ico"){
		return;
	}
	let url = request.url.split("/");
	
	switch(url[1]){
		case "characters":
			send_characters(response);
			break;
		case "age":
			send_age(response, url);
			break;
		default:
			response.write("Pagina defaut");
			resonse.end();
	}

	console.log(request.url);

	//console.log(collection);	
	//console.log("alguien se conecta");
	//response.write('ola k ase');
	//response.end();
});

http_server.listen(8080);


