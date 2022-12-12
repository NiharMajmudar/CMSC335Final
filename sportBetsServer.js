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