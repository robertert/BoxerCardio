const helpers = require("./functions-helpers.js");
const { logger } = require("firebase-functions/v1");
const admin = require("firebase-admin");

const modes = [
  "100P",
  "FREESTYLE",
  "3 MIN",
  "SPEED",
  "REACTION",
  "3 MIN T",
  "100 P T",
];

/**
 * @param {admin.firestore.Firestore} firestore
 * @param {Object <string,any>} results
 * @param {number} playerID
 */

async function checkRank(results, playerID, firestore) {
  const year = new Date().getFullYear().toString();
  const month = (new Date().getMonth() + 1).toString();
  const day = new Date().getDate().toString();

  const dayMonthYear = year + ":" + month + ":" + day;
  const monthYear = year + ":" + month;

  const achivements = [];
  //YEAR
  for (const mode of modes) {
    const rank = (
      await helpers.readRank(playerID, firestore, mode, year, "Everyone")
    ).rank;
    if (rank != undefined) {
      if (rank != 0) {
        if (rank === 1) {
          //logger.log("TOP 1");
          achivements.push("TOP1YEAR");
        }
        if (rank <= 10) {
          //logger.log("TOP 10");
          achivements.push("TOP10YEAR");
        }
        if (rank <= 100) {
          //logger.log("TOP 100");
          achivements.push("TOP100YEAR");
        }
      }
    }
  }
  //MONTH
  for (const mode of modes) {
    const rank = (
      await helpers.readRank(playerID, firestore, mode, monthYear, "Everyone")
    ).rank;
    if (rank != undefined) {
      if (rank != 0) {
        if (rank === 1) {
          //logger.log("TOP 1");
          achivements.push("TOP1MONTH");
        }
        if (rank <= 10) {
          //logger.log("TOP 10");
          achivements.push("TOP10MONTH");
        }
      }
    }
  }
  //DAY
  for (const mode of modes) {
    const rank = (
      await helpers.readRank(
        playerID,
        firestore,
        mode,
        dayMonthYear,
        "Everyone"
      )
    ).rank;
    if (rank != undefined) {
      if (rank != 0) {
        if (rank === 1) {
          //logger.log("TOP 1");
          achivements.push("TOP1DAY");
        }
      }
    }
  }
  return achivements;
}
/**
 * @param {admin.firestore.Firestore} firestore
 * @param {Object <string,any>} results
 * @param {number} playerID
 */
async function checkStats(results, playerID, firestore) {
  const achivements = [];
  const stats = await firestore.doc(`users/${playerID}/stats/AllTime`).get();
  if (stats.exists) {
    const punches = stats.data().punches ? stats.data().punches : 0;
    const timeSpent = stats.data().timeSpent ? stats.data().timeSpent : 0;
    const sessionsNum = stats.data().sessionsNum ? stats.data().sessionsNum : 0;
    if (punches >= 1000) {
      achivements.push("1000PUNCHES");
    }
    if(punches >= 2500){
        achivements.push("2500PUNCHES");
    }
    if(punches >= 10000){
        achivements.push("10000PUNCHES");
    }
    if(timeSpent >= 3600 * 10){
        achivements.push("10HOURS");
    }
    if(timeSpent >= 3600 * 25){
        achivements.push("25HOURS");
    }
    if(timeSpent >= 3600 * 100){
        achivements.push("100HOURS");
    }
    if(timeSpent >= 3600 * 250){
        achivements.push("250HOURS");
    }
    if(sessionsNum >= 10){
        achivements.push("10SESSIONS");
    }
    if(sessionsNum >= 25){
        achivements.push("25SESSIONS");
    }
    if(sessionsNum >= 100){
        achivements.push("100SESSIONS");
    }
    if(sessionsNum >= 250){
        achivements.push("250SESSIONS");
    }
    if(sessionsNum >= 1000){
        achivements.push("1000SESSIONS");
    }
    return achivements;
  }
}

module.exports = { checkRank, checkStats };
