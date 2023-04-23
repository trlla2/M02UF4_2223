#!/usr/bin/node
const http = require('http');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const qs = require('querystring');
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

function send_characters_items(response,url){
	let name = url[2].trim();
	if (name == ""){
		response.write("ERROR: url mal formada");
		response.end();

		return;
	}

	let collection = db.collection('characters');
	collection.find({"name":name}).toArray().then(character =>{
		if(character.length != 1){
			response.write("ERROR: el personaje"+ name +" no existe");
			response.end();
			return;
		}

		let id = character[0].id_character;

		let collection = db.collection('characters_items');
		collection.find({"id_character":id}).toArray().then(ids =>{
		if(ids.length == 0){
			response.write("[]");
			response.end();

			return;
		}
		let ids_items = [];
		ids.forEach(element =>{
			ids_items.push(element.id_item);
		});
		let collection = db.collection('items');
		collection.find({"id_item":{$in:ids_items}}).toArray().then(items => {
			response.write(JSON.stringify(items));
			response.end();

			return;
			});
		});
	});
}


function send_items (response){
	if (url.length >=3){
		send_characters_items (response,url);
		
		return;
	}
	let collection = db.collection('items');

	collection.find({}).toArray().then(items =>{ 
		let names = [];
		
		for (let i = 0; i < items.length; i++){
			names.push(items[i].name);
		}

		response.write(JSON.stringify(names));
		response.end();
	});
}

function send_weapons (response){
	let collection = db.collection('weapons');
	


	collection.find({}).toArray().then(weapons =>{ 
		let names = [];
		
		for (let i = 0; i < weapons.length; i++){
			names.push(weapons[i].name);
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
	console.log(url);


	collection.find({"name":url[2]}).project({_id:0,age:1}).toArray().then(character =>{
		console.log(characters);
		if(character.length ==0){
			response.write("ERROR: Edad erronea");
			response.end();
			return;
		}

		let data = {
			age: character[0].age
		}

		
		response.write(JSON.stringify(character[0]));
		response.end();
	});
}

function insert_character(request, response){
	if (request.method != "POST"){
		response.write("ERROR: Formulario no enviado");
		response.end();

		return;
	}
	let data = "";
	request.on('data', function(character_chunk){
		data += character_chunk;
	});

	request.on('end', function() {
		console.log(data);

		let info = qs.parse(data);

		console.log(info);

		let collection = db.collection("characters");
		
		if (info.name == undefined){
			response.write("ERROR: edad no definido");
			response.end();
			return;
		}
		
		let insert_info = {
			name: info.name,
			age: parseInt(info.age)
		};

		collection.insertOne(insert_info);
		
		response.write("Nuevo personaje "+insert_info.name+" insertado");

		response.end();
	});
	response.end();
}

function send_character(response, id){
	
	collection = db.collection('characters');
	
	collection.find({"id_character": Number(id) }).project({ _id:0 }).toArray()
		.then(character =>{
			response.write(JSON.stringify(character));
			response.end();
		});
}

let http_server = http.createServer(function(request, response){

	
	if (request.url == "/favicon.ico"){
		return;
	}
	let url = request.url.split("/");
	let ask = request.url.split("?");
	switch(url[1]){
		case "characters":
			send_characters(response);
			break;
		case "items":
			send_items(response, url);
			break;
		case "weapons":
			send_weapons(response);
			break;
		case "age":
			send_age(response, url);
			break;
		case "charcter_form":
			insert_character(request, response);
			break;
		default:
			if(ask[1]){
				let equal = ask[1].split("=");
				let id = equal[1];
				
				send_character(response, id);
				return;
			}
			
			fs.readFile("index.html", function(err, data){
				if (err){
					console.error(err);
					response.writeHead(404, {'Content-Type':'text/html'});
					response.write("ERROR 404: el archivo no esta en este castillo");
					response.end();
					
					return;
				}
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(data);
				response.end();
			});
	}

	console.log(request.url);

	//console.log(collection);	
	//console.log("alguien se conecta");
	//response.write('ola k ase');
	//response.end();
});

http_server.listen(8080);


