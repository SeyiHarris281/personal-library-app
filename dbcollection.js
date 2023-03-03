const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env['DB'];

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.on('connectionReady', ready => console.log('DB connection ready'));
//client.on('commandStarted', started => console.log(started));
//client.on('commandSucceeded', succeeded => console.log(succeeded));

module.exports = client.db().collection('books');

