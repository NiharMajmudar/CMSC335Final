const http = require('http');
let fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser"); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');
const axios = require('axios')
const app = express();

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') });
app.use(express.static(__dirname));

if(process.argv.length != 3){
    process.stdout.write("Usage -> node sportBetsServer.js PORT_NUMBER_HERE\n");
    process.exit(1);
}

const portNumber = process.argv[2];

process.stdin.setEncoding("utf8"); /* encoding */

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;
const databaseAndCollection = {db: dbName, collection:collection};

const uri = `mongodb+srv://${userName}:${password}@cluster0.njiausk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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

app.get("/betHistory", async (request, response) => {
    try {
        await client.connect();
        const entries = await findBet(client, databaseAndCollection);
        let betstable = "<table border=\"1\"><tr><th>Name</th><th>Game ID</th><th>Team To Win</th><th>Bet Amount</th></tr>";
        entries.forEach(entry => {
            let curr = "";
            curr += "<tr><td>";
            curr += entry['name'];
            curr += "</td><td>";
            curr += entry['game'];
            curr += "</td><td>";
            curr += entry['team'];
            curr += "</td><td>";
            curr += entry['bet'];
            curr += "</td></tr>";
            betstable += curr;
        });
        betstable += "</table>"
        variables = {priorBets: betstable}
        response.render("betHistory", variables);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

async function findBet(client, databaseAndCollection) {
    const cursor = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find({});
    const result = await cursor.toArray();
    return result;
}

async function insertBet(client, databaseAndCollection, bet) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(bet);

    console.log(`Bet entry created with id ${result.insertedId}`);
}
/* Nihar's Part */
app.get("/todaysBets", async (request, response) => {
    const apiKey = '16bfdfc27321c2c5c873016bd22cf0ba'
    const daysFrom = 2;
    // const sports_keys = [{'key': 'americanfootball_nfl', 'title': 'NFL'},
    //  {'key': 'basketball_nba', 'title': 'NBA'}, 
    //  {'key': 'basketball_ncaab', 'title': 'NCAAB'}];
    // let sportKey = sports_keys[0]['key'];
    let scores = await axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/scores`, {
        params: {
            apiKey,
            daysFrom,
        }
    })
    .then(response => {
        return response.data;
    
    })
    .catch(error => {
        console.log('There was an error with your request');
    })
    let table = "<table border=\"1\"><tr><th>Home</th><th>Points</th><th>Away</th><th>Points</th></tr>";
    scores.forEach(score => {
        curr_score = score['scores'];
        if (curr_score == null) {
            return;
        }
        let array_scores = [];
        let curr = "";
        curr_score.forEach(team => {
            array_scores.push(team['name']);
            array_scores.push(team['score']);
        });
        curr += "<tr><td>";
        curr += array_scores[0];
        curr += "</td><td>";
        curr += array_scores[1];
        curr += "</td><td>";
        curr += array_scores[2];
        curr += "</td><td>";
        curr += array_scores[3];
        curr += "</td></tr>";
        table += curr;
    });
    table += "</table>"
    variables = {scoreTable: table};
    response.render("todaysBets", variables);
});
