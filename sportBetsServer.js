const http = require('http');
let fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser"); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');
const app = express();

require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 
app.use(express.static(__dirname));

const portNumber = process.env.portNumber || 5000;

process.stdin.setEncoding("utf8"); /* encoding */

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;
const databaseAndCollection = {db: dbName, collection:collection};

const uri = `mongodb+srv://${userName}:${password}@cluster0.1hptff1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.listen(portNumber);

console.log(`Server is listening on the port ${portNumber}`);
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

app.post("/processBet", async (request, response) => {
    try {
        await client.connect();
        let bet = {name: request.body.name, email: request.body.email, game: request.body.game, team: request.body.team, bet: request.body.bet}
        await insertBet(client, databaseAndCollection, bet);
        response.render("processBet", bet);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.get("/todaysBets", (request, response) => {
    response.render("todaysBets");
});

app.get("/betHistory", (request, response) => {
    response.render("betHistory");
});

async function insertBet(client, databaseAndCollection, bet) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(bet);

    console.log(`Bet entry created with id ${result.insertedId}`);
}