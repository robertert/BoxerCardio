const admin = require("firebase-admin");
const { logger } = require("firebase-functions/v1");
/** 
* @param {admin.firestore.Firestore} firestore The database storing
 *     the leaderboard.
*/
async function createScore(playerID, score, firestore, mode, date, group,name) {
  /**
   * This function assumes a minimum score of 0 and that value
   * is between min and max.
   * Returns the expected size of a bucket for a given score
   * so that bucket sizes stay constant, to avoid expensive
   * re-bucketing.
   * @param {number} value The new score.
   * @param {number} min The min of the previous range.
   * @param {number} max The max of the previous range. Must be greater than
   *     min.
   * @return {Object<string, number>} Returns an object containing the new min
   *     and max.
   */
  function bucket(value, min, max) {
    const bucketSize = (max - min) / 20;
    const bucketMin = Math.floor(value / bucketSize) * bucketSize;
    const bucketMax = bucketMin + bucketSize;
    return { min: bucketMin, max: bucketMax };
  }

  /**
   * A function used to store pending writes until all reads within a
   * transaction have completed.
   *
   * @callback PendingWrite
   * @param {admin.firestore.Transaction} transaction The transaction
   *     to be used for writes.
   * @returns {void}
   */

  /**
   * Recursively searches for the node to write the score to,
   * then writes the score and updates any counters along the way.
   * @param {number} id The user associated with the score.
   * @param {number} value The new score.
   * @param {admin.firestore.CollectionReference} coll The collection this
   *     value should be written to.
   * @param {Object<string, number>} range An object with properties min and
   *     max defining the range this score should be in. Ranges cannot overlap
   *     without causing problems. Use the bucket function above to determine a
   *     root range from constant values to ensure consistency.
   * @param {admin.firestore.Transaction} transaction The transaction used to
   *     ensure consistency during tree updates.
   * @param {Array<PendingWrite>} pendingWrites A series of writes that should
   *     occur once all reads within a transaction have completed.
   * @return {void} Write error/success is handled via the transaction object.
   */
  async function writeScoreToCollection(
    id,
    value,
    coll,
    range,
    transaction,
    pendingWrites
  ) {
    const snapshot = await transaction.get(coll);
    //logger.log("DOCS:")
    //snapshot.docs.forEach((doc)=>logger.log(doc.data()))
    //logger.log("DOCS END:")
    if (snapshot.empty) {
      // This is the first score to be inserted into this node.
      for (const write of pendingWrites) {
        //logger.log("UPDATING!");
        write(transaction);
      }
      const docRef = coll.doc();
      transaction.create(docRef, { exact: { score: value, user: id } });
      return;
    }

    const min = range.min;
    const max = range.max;

    for (const node of snapshot.docs) {
      const data = node.data();
      if (data.exact !== undefined) {
        // This node held an exact score.
        let newRange = bucket(value, min, max);
        let tempRange = bucket(data.exact.score, min, max);
        let same = true;
        if (newRange.min === tempRange.min && newRange.max === tempRange.max) {
          let docReference = node.ref;
          while (same) {
            // The scores belong in the same range, so we need to "demote" both
            // to a lower level of the tree and convert this node to a range.
            const rangeData = {
              range: newRange,
              count: 2,
            };
            //logger.log("range");
            transaction.set(docReference, rangeData);
            newRange = bucket(value, tempRange.min, tempRange.max);
            tempRange = bucket(data.exact.score, tempRange.min, tempRange.max);
            same =
              newRange.min === tempRange.min && newRange.max === tempRange.max;
            if (same) {
              docReference = docReference.collection("scores").doc();
            }
          }
          transaction.create(docReference.collection("scores").doc(), data);
          transaction.create(docReference.collection("scores").doc(), {
            exact: { score: value, user: id },
          });
          for (const write of pendingWrites) {
            try {
              //logger.log("UPDATING!");
              write(transaction);
            } catch (e) {
              throw e;
            }
          }
          return;
        } else {
          // The scores are in different ranges. Continue and try to find a
          // range that fits this score.
          continue;
        }
      }

      if (data.range.min <= value && data.range.max > value) {
        // The score belongs to this range that may have subvalues.
        // Increment the range's count in pendingWrites, since
        // subsequent recursion may incur more reads.
        const docReference = node.ref;
        const newCount = node.get("count") + 1;
        //logger.log({ name: node.data(), count: newCount });
        pendingWrites.push((t) => {
          try {
            // logger.log("START UPDATING!");
            t.update(docReference, { count: newCount });
          } catch (e) {
            throw e;
          }
          //logger.log("END UPDATING!")
        });
        const newRange = bucket(value, min, max);
        //logger.log("NEXT ITERATION")
        return writeScoreToCollection(
          id,
          value,
          docReference.collection("scores"),
          newRange,
          transaction,
          pendingWrites
        );
      }
    }
    // No appropriate range was found, create an `exact` value.
    transaction.create(coll.doc(), { exact: { score: value, user: id } });
    for (const write of pendingWrites) {
      try {
        //logger.log("UPDATING!");
        write(transaction);
      } catch (e) {
        logger.log("ERROR 2");
        throw e;
      }
    }
  }
  let mainDoc;
  if(group === "Everyone"){
    mainDoc = firestore.doc(`leaderboards/${mode}/dates/${date}`);
  }
  else{
    mainDoc = firestore.doc(`trainingGroups/${group}/leaderboards/${mode}/dates/${date}`);
  }
  
  if(!(await mainDoc.get()).exists){
    mainDoc.create({});
  }
  
  const scores = mainDoc.collection("scores");
  const players = mainDoc.collection("players");
  return firestore.runTransaction((transaction) => {
    return writeScoreToCollection(
      playerID,
      score,
      scores,
      { min: 0, max: 1000 },
      transaction,
      []
    ).then(() => {
      transaction.create(players.doc(playerID.toString()), {
        user: playerID,
        name: name,
        score: score,
      });
    });
  });
}
/**
 * Returns the rank and score of a player in the leaderboard.
 * @param {string} playerID The ID of the player associated with the score.
 * @param {admin.firestore.Firestore} firestore The database storing
 *     the leaderboard.
 * @return {Promise<Object<string, number>>} Returns a promise containing the
 *     player's rank and score.
 */
async function readRank(playerID, firestore, mode, date, group) {
  // ZROBIC TAK ŻEBY BRALO Z BODY REQUESTA A NIE Z RECZNIE WPISYWANIE I ZOBACZYC CO SIE DZIEJE JAK JEST EVEN

  //const players = await firestore.doc(`users/${playerID}`).get();
  let mainDoc;
  if(group === "Everyone" || group === "Friends"){
    mainDoc = firestore.doc(`leaderboards/${mode}/dates/${date}`);
  }
  else{
    mainDoc = firestore.doc(`trainingGroups/${group}/leaderboards/${mode}/dates/${date}`);
  }
  const players = await mainDoc
    .collection("players")
    .where("user", "==", playerID)
    .get();
  if (players.empty) {
    //throw Error(`Player not found in leaderboard: ${playerID}`);
    return {rank: 0};
  }
  const player = players.docs[0].data();
  const score = player.score;

  const scores = mainDoc.collection("scores");

  /**
   * Recursively finds a player score in a collection.
   * @param {string} id The player's ID, since some players may be tied.
   * @param {number} value The player's score.
   * @param {admin.firestore.CollectionReference} coll The collection to
   *     search.
   * @param {number} currentCount The current count of players ahead of the
   *     player.
   * @return {Promise<number>} The rank of the player (the number of players
   *     ahead of them plus one).
   */
  async function findPlayerScoreInCollection(id, value, coll, currentCount) {
    const snapshot = await coll.get();
    let found = false;
    for (const doc of snapshot.docs) {
      if (doc.get("exact") !== undefined) {
        // This is an exact score. If it matches the score we're looking
        // for, return. Otherwise, check if it should be counted.
        const exact = doc.data().exact;
        if (exact.score === value) {
          if (exact.user === id) {
            // Score found.
            found = true;
            currentCount++;
          } else {
            // The player is tied with another. In this case, don't increment
            // the count.
            continue;
          }
        } else if (exact.score > value) {
          // Increment count
          currentCount++;
          continue;
        } else {
          // Do nothing
          continue;
        }
      } else {
        // This is a range. If it matches the score we're looking for,
        // search the range recursively, otherwise, check if it should be
        // counted.
        const range = doc.data().range;
        const count = doc.get("count");
        if (range.min > value) {
          // The range is greater than the score, so add it to the rank
          // count.
          currentCount += count;
          continue;
        } else if (range.max <= value) {
          // do nothing
          continue;
        } else {
          const subcollection = doc.ref.collection("scores");
          currentCount = await findPlayerScoreInCollection(
            id,
            value,
            subcollection,
            currentCount
          );
          found = true;
        }
      }
    }
    // There was no range containing the score.
    if (found) {
      return currentCount;
    }
    return {rank: 0};
  }

  const rank = await findPlayerScoreInCollection(playerID, score, scores, 0);
  return {
    user: playerID,
    rank: rank,
    score: score,
  };
}

/**
 * Updates the score of a player in the leaderboard.
 * @param {string} playerID The ID of the player associated with the score.
 * @param {admin.firestore.Firestore} firestore The database storing
 *     the leaderboard.
 * @return {Promise<admin.firestore.WriteResult | Error>} Returns a promise
 *     that resolves when the write completes.
 */
async function deleteScore(playerID, firestore, mode, date, group) {
  //const players = await firestore.doc(`users/${playerID}`).get();
  let mainDoc;
  if(group === "Everyone"){
    mainDoc = firestore.doc(`leaderboards/${mode}/dates/${date}`);
  }
  else{
    mainDoc = firestore.doc(`trainingGroups/${group}/leaderboards/${mode}/dates/${date}`);
  }
  const players = await mainDoc
    .collection("players")
    .where("user", "==", playerID)
    .get();
  if (players.empty) {
    throw Error(`Player not found in leaderboard: ${playerID}`);
  }
  const player = players.docs[0].data();
  const score = player.score;
  const scores = mainDoc.collection("scores");

  /**
   * Recursively finds a player score in a collection.
   * @param {string} id The player's ID, since some players may be tied.
   * @param {number} value The player's score.
   * @param {admin.firestore.CollectionReference} coll The collection to
   *     search.
   * @param {number} currentCount The current count of players ahead of the
   *     player.
   * * @param {admin.firestore.DocumentReference} parentDoc
   * @return {Promise<number>} The rank of the player (the number of players
   *     ahead of them plus one).
   */
  async function findPlayerScoreInCollection(
    id,
    value,
    coll,
    currentCount,
    parentDoc
  ) {
    const snapshot = await coll.get();
    for (const doc of snapshot.docs) {
      if (doc.get("exact") !== undefined) {
        // This is an exact score. If it matches the score we're looking
        // for, return. Otherwise, check if it should be counted.
        const exact = doc.data().exact;
        if (exact.score === value) {
          if (exact.user === id) {
            // Score found.
            try {
              const result = await firestore.runTransaction(
                async (transaction) => {
                  let pendingWrites = [];
                  let parent = parentDoc;
                  while (parent != null) {
                    const data = (await transaction.get(parent)).data();
                    const parnt = parent;
                    if (data.count != 2) {
                      pendingWrites.push((t) => {
                        t.update(parnt, {
                          count: data.count - 1,
                        });
                      });
                    } else {
                      const list = (
                        await transaction.get(parentDoc.collection("scores"))
                      ).docs.filter((dok) => dok.data().exact.user != id);
                      pendingWrites.push((t) => {
                        t.create(parnt.parent.doc(), list[0].data());
                        t.delete(parnt);
                      });
                      pendingWrites.push((t) => {
                        t.delete(list[0].ref);
                      });
                    }

                    parent = parent.parent.parent;
                  }

                  for (const write of pendingWrites) {
                    write(transaction);
                  }
                  transaction.delete(doc.ref);
                  transaction.delete(players.docs[0].ref)
                }
              );
              return result;
            } catch (e) {
              logger.log("TEST");
              throw e;
            }
          } else {
            // The player is tied with another. In this case, don't increment
            // the count.
            continue;
          }
        } else if (exact.score > value) {
          // Increment count
          currentCount++;
          continue;
        } else {
          // Do nothing
          continue;
        }
      } else {
        // This is a range. If it matches the score we're looking for,
        // search the range recursively, otherwise, check if it should be
        // counted.
        const range = doc.data().range;
        const count = doc.get("count");
        if (range.min > value) {
          // The range is greater than the score, so add it to the rank
          // count.
          currentCount += count;
          continue;
        } else if (range.max <= value) {
          // do nothing
          continue;
        } else {
          const subcollection = doc.ref.collection("scores");
          return findPlayerScoreInCollection(
            id,
            value,
            subcollection,
            currentCount,
            doc.ref
          );
        }
      }
    }
    // There was no range containing the score.
    throw Error(`Range not found for score: ${value}`);
  }

  const rank = await findPlayerScoreInCollection(
    playerID,
    score,
    scores,
    0,
    null
  );
  return {
    user: playerID,
    rank: rank,
    score: score,
  };
}

module.exports = { createScore, readRank, deleteScore };
