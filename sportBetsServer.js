const http = require('http');
let fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser"); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');
const app = express();

require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

if(process.argv.length != 3){
    process.stdout.write("Usage -> node sportBetsServer.js PORT_NUMBER_HERE\n");
    process.exit(1);
}

let portNumber = process.argv[2];

process.stdin.setEncoding("utf8"); /* encoding */

app.listen(portNumber);

console.log(`Web server is running at http://localhost:${portNumber}`);
process.stdout.write("Type stop to shutdown the server: ");

process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  
        } else {
            process.stdout.write(`Invalid command: ${command}\n`);
		}
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});



app.set("views", path.resolve(__dirname, "templates")); //Main path for serving pages is in the templates folder
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:false})); //Allows processing of request.body for POST

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/enterBets", (request, response) => {
    response.render("enterBets");
});

app.get("/todaysBets", (request, response) => {
    response.render("todaysBets");
});

app.get("/betHistory", (request, response) => {
    response.render("betHistory");
});
