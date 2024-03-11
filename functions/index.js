// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { logger } = require("firebase-functions");
const { onCall } = require("firebase-functions/v2/https");

// The Firebase Admin SDK to access Firestore.

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const helpers = require("./functions-helpers.js");
const achivements = require("./achivements.js");
const utils = require("./utils.js");

var serviceAccount = require("./auth.json");

const cors = require("cors")({
  origin: true,
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.addNewScore = onCall((req) => {
  const userId = req.data.userId;
  const score = req.data.score;
  const mode = req.data.mode;
  const date = req.data.date;
  const dayMonthYear = date;
  const monthYear = date;
  const year = date;
});

exports.getLeaderboard = onCall(async (req) => {});

// Adds 10 random scores.
exports.addScores = functions.https.onRequest(async (req, res) => {
  const scores = [];
  for (let i = 0; i < 10; i++) {
    scores.push({
      user: utils.newUserID(),
      score: utils.randomScore(),
      name: "bobo",
      date: "2024",
      mode: "100P",
      group: "Everyone",
    });
  }
  // This is done synchronously to avoid lock contention when using
  // transactions.
  Promise.all(
    scores.map(async (score) => {
      await helpers.createScore(
        score.user,
        score.name,
        score.score,
        admin.firestore(),
        score.mode,
        score.date,
        score.group
      );
    })
  ).then((results) => {
    res.json({
      result: "Added scores",
      writes: results,
    });
    res.end();
  });
});

exports.addScore = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => {
    const name = req.body.data.name;
    const user = req.body.data.playerID;
    const score = req.body.data.score;
    const mode = req.body.data.mode;
    const date = req.body.data.date;
    const group = req.body.data.group;
    //DODAC MODE DATE I MIEJSE(TRAINING GORUP/EVERYONE)
    helpers
      .createScore(user, score, admin.firestore(), mode, date, group, name)
      .then((result) => {
        res.json({ result: `Score created: ${result}` });
      });
  });
});

exports.updateScore = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const name = req.body.data.name;
    const user = req.body.data.playerID;
    const score = req.body.data.score;
    const mode = req.body.data.mode;
    const date = req.body.data.date;
    const group = req.body.data.group;
    const firestore = admin.firestore();
    await helpers.deleteScore(user, firestore, mode, date, group);
    await helpers.createScore(user, score, firestore, mode, date, group, name);
    res.send("Updated");
  });
});

exports.getRank = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => {
    const user = req.body.data.playerID;
    const mode = req.body.data.mode;
    const date = req.body.data.date;
    const group = req.body.data.group;
    const firestore = admin.firestore();
    helpers.readRank(user, firestore, mode, date, group).then((result) => {
      res.send({ rank: result.rank });
    });
  });
});

exports.checkAchivements = functions.https.onRequest(async (req, res) => {
  const results = req.body.data.results;
  const firestore = admin.firestore();
  const playerID = req.body.data.playerID;
  const rankAchivements = await achivements.checkRank(results, playerID, firestore);
  const statsAchivements = await achivements.checkStats(results,playerID,firestore);
  res.send([...rankAchivements,...statsAchivements]);
});
