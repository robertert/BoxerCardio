// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { logger } = require("firebase-functions");
const { onCall } = require("firebase-functions/v2/https");

// The Firebase Admin SDK to access Firestore.

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const helpers = require("./functions-helpers.js");
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
  //const scores = [{user: utils.newUserID(), score: 701,}];
  const rand = utils.randomScore();
  const scores = [];
  for (let i = 0; i < 10; i++) {
    scores.push({
      user: utils.newUserID(),
      score: utils.randomScore(),
    });
  }
  //logger.log(rand);
  // This is done synchronously to avoid lock contention when using
  // transactions.
  Promise.all(
    scores.map(async (score) => {
      await helpers.createScore(score.user, score.score, admin.firestore());
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
    const user = req.body.data.playerID;
    const score = req.body.data.score;
    helpers.createScore(user, score, admin.firestore()).then((result) => {
      res.json({ result: `Score created: ${result}` });
    });
  });
});

exports.updateScore = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const user = req.body.data.playerID;
    const score = req.body.data.score;
    const firestore = admin.firestore();
    await helpers.deleteScore(user, firestore);
    await helpers.createScore(user, score, firestore);
    res.send("Updated");
  });
});

exports.getRank = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => {
    const user = req.body.data.playerID;
    const firestore = admin.firestore();
    helpers.readRank(user, firestore).then((result) => {
      res.json({ result: `Rank: ${result.rank}`, res: result });
    });
  });
});
