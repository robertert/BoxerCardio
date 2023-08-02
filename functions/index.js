// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");
// const redis = require('redis');
 require('dotenv').config();

var admin = require("firebase-admin");
var serviceAccount = require("./auth.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
/*
 const REDISHOST = process.env.REDISHOST || 'localhost';
 const REDISPORT = process.env.REDISPORT || 6379;


const redisClient = redis.createClient({
   password: process.env.REDIS_PASSWORD,
   socket: {
      host: 'redis-13341.c304.europe-west1-2.gce.cloud.redislabs.com',
       port: 13341
   }
 });
redisClient.on('error', err => console.error('ERR:REDIS:', err));
redisClient.connect();
*/
exports.addNewScore = onCall((req)=>{
    const userId = req.data.userId;
    const score = req.data.score;
    const mode = req.data.mode;
    const date = req.data.date;
    const dayMonthYear = date;
    const monthYear = date;
    const year = date;
  /*
    try {
      // redisClient.zAdd("main-leaderboard",userId,score);
      const test = "test";
      //day
      db.collection(`leaderboard/day/${dayMonthYear}/${mode}`).doc(userId).set({
        score: score,
      },{merge: true});
      //month
      db.collection(`leaderboard/month/${monthYear}/${mode}`).doc(userId).set({
        score: score,
      },{merge: true});
      //year
      db.collection(`leaderboard/year/${year}/${mode}`).doc(userId).set({
        score: score,
      },{merge: true});

      return db;

    } catch (e) {
      return e;
    }
    */
})

exports.getLeaderboard = onCall(async (req)=>{
    
})


