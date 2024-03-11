import { View, StyleSheet, Pressable, Text, Alert } from "react-native";
import Colors from "../constants/colors";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useContext, useState } from "react";
import { UserContext } from "../store/user-context";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAchievements } from "../store/achivement-context";

function NfcScreen() {
  const [id, setId] = useState(1);
  const [desc, setDesc] = useState("");
  const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);

  const userCtx = useContext(UserContext);

  const { t } = useTranslation();

  const { unlockAchievement } = useAchievements();

  async function checkAchivements() {
    try {
      const achievements = await axios.post(
        "https://us-central1-boxerapp-beb5c.cloudfunctions.net/checkAchivements",
        {
          data: {
            playerID: userCtx.id,
            results: {
              mode: "100P",
              score: 500,
              time: 100,
            },
          },
        }
      );
      unlockAchievement(achievements.data);

      const pendingWrites = [];
      try {
        await runTransaction(db, async (transaction) => {
          for (const achive of achievements.data) {
            const data = await getDocs(
              query(collection(db, `achivements`), where("short", "==", achive))
            );
            const achievementData = {
              id: data.docs[0].id,
              ...data.docs[0].data(),
            };
            const fetchData = (
              await transaction.get(doc(db, `users/${userCtx.id}`))
            ).data().achivements;
            const userData = fetchData ? fetchData : [];
            if (
              !(
                userData.filter((achive) => achive.id === achievementData.id)
                  .length > 0
              )
            ) {
              pendingWrites.push((t) => {
                t.update(doc(db, `users/${userCtx.id}`), {
                  achivements: arrayUnion(achievementData),
                });
              });
            }
          }
          for (const write of pendingWrites) {
            write(transaction);
          }
        });
      } catch (e) {
        console.log(e);
        Alert.alert("Error", t("Error message"));
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
  }

  function connectHandler() {
    //createPost();
    checkAchivements();
  }

  async function createPost() {
    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString();
    const day = new Date().getDate().toString();

    const dayMonthYear = year + ":" + month + ":" + day;
    const monthYear = year + ":" + month;
    const promises = [];
    try {
      const machineData = await getDoc(doc(db, `machines/${id}`));
      const data = machineData.data().current
        ? machineData.data().current
        : undefined;
      if (Object.keys(data).length === 0) {
        //NOT READY YET
        return;
      }
      const userData = await getDoc(doc(db, `users/${userCtx.id}`));
      const mode = data.mode;
      const score = data.score;

      //EVERYONE/////////////////////////////////////////////////////////////////////
      //
      //DAY
      //
      const mainDoc = await getDoc(
        doc(
          db,
          `leaderboards/${mode}/dates/${dayMonthYear}/players/${userCtx.id}`
        )
      );
      if (!mainDoc.exists()) {
        promises.push(
          axios.post(
            "https://us-central1-boxerapp-beb5c.cloudfunctions.net/addScore",
            {
              data: {
                playerID: userCtx.id,
                name: userCtx.name,
                score: score,
                date: dayMonthYear,
                mode: mode,
                group: "Everyone",
              },
            }
          )
        );
        //console.log(result.status);
        //console.log(result.data);
      } else if (mainDoc.data().score < score) {
        promises.push(
          axios.post(
            "https://us-central1-boxerapp-beb5c.cloudfunctions.net/updateScore",
            {
              data: {
                playerID: userCtx.id,
                name: userCtx.name,
                score: score,
                date: dayMonthYear,
                mode: mode,
                group: "Everyone",
              },
            }
          )
        );
        //console.log(result.status);
        //console.log(result.data);
      }
      //
      //MONTH
      //
      const mainDoc2 = await getDoc(
        doc(db, `leaderboards/${mode}/dates/${monthYear}/players/${userCtx.id}`)
      );
      if (!mainDoc2.exists()) {
        promises.push(
          axios.post(
            "https://us-central1-boxerapp-beb5c.cloudfunctions.net/addScore",
            {
              data: {
                playerID: userCtx.id,
                name: userCtx.name,
                score: score,
                date: monthYear,
                mode: mode,
                group: "Everyone",
              },
            }
          )
        );
        //console.log(result.status);
        //console.log(result.data);
      } else if (mainDoc2.data().score < score) {
        promises.push(
          axios.post(
            "https://us-central1-boxerapp-beb5c.cloudfunctions.net/updateScore",
            {
              data: {
                playerID: userCtx.id,
                name: userCtx.name,
                score: score,
                date: monthYear,
                mode: mode,
                group: "Everyone",
              },
            }
          )
        );
        //console.log(result.status);
        //console.log(result.data);
      }
      //
      //YEAR
      //
      const mainDoc3 = await getDoc(
        doc(db, `leaderboards/${mode}/dates/${year}/players/${userCtx.id}`)
      );
      if (!mainDoc3.exists()) {
        promises.push(
          axios.post(
            "https://us-central1-boxerapp-beb5c.cloudfunctions.net/addScore",
            {
              data: {
                playerID: userCtx.id,
                name: userCtx.name,
                score: score,
                date: year,
                mode: mode,
                group: "Everyone",
              },
            }
          )
        );
        //console.log(result.status);
        //console.log(result.data);
      } else if (mainDoc3.data().score < score) {
        promises.push(
          axios.post(
            "https://us-central1-boxerapp-beb5c.cloudfunctions.net/updateScore",
            {
              data: {
                playerID: userCtx.id,
                name: userCtx.name,
                score: score,
                date: year,
                mode: mode,
                group: "Everyone",
              },
            }
          )
        );
        //console.log(result.status);
        //console.log(result.data);
      }

      //TRAINING GROUP////////////////////////////////////////////////////////////////

      for (team of userData.data().trainingGroups) {
        //
        //DAY
        //
        const mainDoc = await getDoc(
          doc(
            db,
            `trainingGroups/${team.id}/leaderboards/${mode}/dates/${dayMonthYear}/players/${userCtx.id}`
          )
        );
        if (!mainDoc.exists()) {
          promises.push(
            axios.post(
              "https://us-central1-boxerapp-beb5c.cloudfunctions.net/addScore",
              {
                data: {
                  playerID: userCtx.id,
                  name: userCtx.name,
                  score: score,
                  date: dayMonthYear,
                  mode: mode,
                  group: team.id,
                },
              }
            )
          );
          //console.log(result.status);
          //console.log(result.data);
        } else if (mainDoc.data().score < score) {
          promises.push(
            axios.post(
              "https://us-central1-boxerapp-beb5c.cloudfunctions.net/updateScore",
              {
                data: {
                  playerID: userCtx.id,
                  name: userCtx.name,
                  score: score,
                  date: dayMonthYear,
                  mode: mode,
                  group: team.id,
                },
              }
            )
          );
          //console.log(result.status);
          //console.log(result.data);
        }
        //
        //MONTH
        //
        const mainDoc2 = await getDoc(
          doc(
            db,
            `trainingGroups/${team.id}/leaderboards/${mode}/dates/${monthYear}/players/${userCtx.id}`
          )
        );
        if (!mainDoc2.exists()) {
          promises.push(
            axios.post(
              "https://us-central1-boxerapp-beb5c.cloudfunctions.net/addScore",
              {
                data: {
                  playerID: userCtx.id,
                  name: userCtx.name,
                  score: score,
                  date: monthYear,
                  mode: mode,
                  group: team.id,
                },
              }
            )
          );
          //console.log(result.status);
          //console.log(result.data);
        } else if (mainDoc2.data().score < score) {
          promises.push(
            axios.post(
              "https://us-central1-boxerapp-beb5c.cloudfunctions.net/updateScore",
              {
                data: {
                  playerID: userCtx.id,
                  name: userCtx.name,
                  score: score,
                  date: monthYear,
                  mode: mode,
                  group: team.id,
                },
              }
            )
          );
          //console.log(result.status);
          //console.log(result.data);
        }
        //
        //YEAR
        //
        const mainDoc3 = await getDoc(
          doc(
            db,
            `trainingGroups/${team.id}/leaderboards/${mode}/dates/${year}/players/${userCtx.id}`
          )
        );
        if (!mainDoc3.exists()) {
          promises.push(
            axios.post(
              "https://us-central1-boxerapp-beb5c.cloudfunctions.net/addScore",
              {
                data: {
                  playerID: userCtx.id,
                  name: userCtx.name,
                  score: score,
                  date: year,
                  mode: mode,
                  group: team.id,
                },
              }
            )
          );
          //console.log(result.status);
          //console.log(result.data);
        } else if (mainDoc3.data().score < score) {
          promises.push(
            axios.post(
              "https://us-central1-boxerapp-beb5c.cloudfunctions.net/updateScore",
              {
                data: {
                  playerID: userCtx.id,
                  name: userCtx.name,
                  score: score,
                  date: year,
                  mode: mode,
                  group: team.id,
                },
              }
            )
          );
          //console.log(result.status);
          //console.log(result.data);
        }
      }
      await Promise.all(promises);
      ///////!!!!!!!!!! SPRAWDZIC CZEMU DODAJE UNDEFINED W LEADERBOARDS //////////////
      //DODAC STATYSTYKI ALLTIME + 3
      const res = await runTransaction(db, async (transaction) => {
        let pendingWrites = [];
        pendingWrites.push((t) => {
          t.set(doc(db, `posts/${uid}`), {
            userId: userCtx.id,
            userName: userCtx.name,
            likes: [],
            likesNum: 0,
            commentsNum: 0,
            description: desc,
            createdAt: new Date(),
            score: score,
            mode: mode,
            machineId: id,
          });
          t.set(doc(db, `users/${userCtx.id}/posts/${uid}`), {
            userId: userCtx.id,
            userName: userCtx.name,
            likes: [],
            likesNum: 0,
            commentsNum: 0,
            description: desc,
            createdAt: new Date(),
            score: score,
            mode: mode,
            machineId: id,
          });
          const postsPreview = userData.data().postsPreview
            ? userData.data().postsPreview
            : [];
          t.update(doc(db, `users/${userCtx.id}`), {
            postsPreview: [uid, ...postsPreview],
          });
        });

        ///ALL TIME STATS /////////////////////////////////////////////////////////////
        const userStatsAllTime = await transaction.get(
          doc(db, `users/${userCtx.id}/stats/AllTime`)
        );
        const newStats = userStatsAllTime.data() ? userStatsAllTime.data() : {};
        if (!userStatsAllTime.exists()) {
          pendingWrites.push((t) => {
            t.set(doc(db, `users/${userCtx.id}/stats/AllTime`), {});
          });
        }
        const timeSpent = newStats.timeSpent
          ? userStatsAllTime.data().timeSpent
          : 0;
        const punches = newStats.punches ? userStatsAllTime.data().punches : 0;
        const sessionsNum = newStats.sessionsNum
          ? userStatsAllTime.data().sessionsNum
          : 0;
        const highScore = newStats[mode]?.Highest
          ? userStatsAllTime.data()[mode].Highest
          : 0;
        const avarageScore = newStats[mode]?.Avarage
          ? userStatsAllTime.data()[mode].Avarage
          : 0;

        newStats.timeSpent = timeSpent + data.time;
        newStats.punches = punches + data.punches;
        newStats.sessionsNum = sessionsNum + 1;
        newStats[mode] = { Highest: highScore, Avarage: avarageScore };
        if (score > highScore) newStats[mode].Highest = score;
        newStats[mode].Avarage =
          (avarageScore * sessionsNum + score) / (sessionsNum + 1);

        pendingWrites.push((t) => {
          t.update(doc(db, `users/${userCtx.id}/stats/AllTime`), {
            ...newStats,
          });
        });
        ///YEAR ////////////////////////////////////////////////////
        const userStatsYear = await transaction.get(
          doc(db, `users/${userCtx.id}/stats/${year}`)
        );
        const newStatsYear = userStatsYear.data() ? userStatsYear.data() : {};
        if (!userStatsYear.exists()) {
          pendingWrites.push((t) => {
            t.set(doc(db, `users/${userCtx.id}/stats/${year}`), {});
          });
        }
        const timeSpentY = newStatsYear?.timeSpent
          ? userStatsYear.data().timeSpent
          : 0;
        const punchesY = newStatsYear?.punches
          ? userStatsYear.data().punches
          : 0;
        const sessionsNumY = newStatsYear?.sessionsNum
          ? userStatsYear.data().sessionsNum
          : 0;
        const highScoreY = newStatsYear[mode]?.Highest
          ? userStatsYear.data()[mode].Highest
          : 0;
        const avarageScoreY = newStatsYear[mode]?.Avarage
          ? userStatsYear.data()[mode].Avarage
          : 0;

        newStatsYear.timeSpent = timeSpentY + data.time;
        newStatsYear.punches = punchesY + data.punches;
        newStatsYear.sessionsNum = sessionsNumY + 1;
        newStatsYear[mode] = { Highest: highScoreY, Avarage: avarageScoreY };
        if (score > highScoreY) newStatsYear[mode].Highest = score;
        newStatsYear[mode].Avarage =
          (avarageScoreY * sessionsNumY + score) / (sessionsNumY + 1);

        pendingWrites.push((t) => {
          t.update(doc(db, `users/${userCtx.id}/stats/${year}`), {
            ...newStatsYear,
          });
        });
        //MONTH///////////////////////////////////////////////////
        const userStatsMonth = await transaction.get(
          doc(db, `users/${userCtx.id}/stats/${monthYear}`)
        );
        const newStatsMonth = userStatsYear.data() ? userStatsMonth.data() : {};
        if (!userStatsMonth.exists()) {
          pendingWrites.push((t) => {
            t.set(doc(db, `users/${userCtx.id}/stats/${monthYear}`), {});
          });
        }
        const timeSpentM = newStatsMonth?.timeSpent
          ? newStatsMonth.timeSpent
          : 0;
        const punchesM = newStatsMonth?.punches ? newStatsMonth.punches : 0;
        const sessionsNumM = newStatsMonth?.sessionsNum
          ? newStatsMonth.sessionsNum
          : 0;
        const highScoreM = newStatsMonth[mode]?.Highest
          ? newStatsMonth[mode].Highest
          : 0;
        const avarageScoreM = newStatsMonth[mode]?.Avarage
          ? newStatsMonth[mode].Avarage
          : 0;

        newStatsMonth.timeSpent = timeSpentM + data.time;
        newStatsMonth.punches = punchesM + data.punches;
        newStatsMonth.sessionsNum = sessionsNumM + 1;
        newStatsMonth[mode] = { Highest: highScoreM, Avarage: avarageScoreM };
        if (score > highScoreM) newStatsMonth[mode].Highest = score;
        newStatsMonth[mode].Avarage =
          (avarageScoreM * sessionsNumM + score) / (sessionsNumM + 1);

        pendingWrites.push((t) => {
          t.update(doc(db, `users/${userCtx.id}/stats/${monthYear}`), {
            ...newStatsMonth,
          });
        });
        //DAY////////////////////////////////////////////////////////////////////
        const userStatsDay = await transaction.get(
          doc(db, `users/${userCtx.id}/stats/${dayMonthYear}`)
        );
        const newStatsDay = userStatsDay.data() ? userStatsDay.data() : {};
        if (!userStatsDay.exists()) {
          pendingWrites.push((t) => {
            t.set(doc(db, `users/${userCtx.id}/stats/${dayMonthYear}`), {});
          });
        }
        const timeSpentD = newStatsDay?.timeSpent ? newStatsDay.timeSpent : 0;
        const punchesD = newStatsDay?.punches ? newStatsDay.punches : 0;
        const sessionsNumD = newStatsDay?.sessionsNum
          ? newStatsDay.sessionsNum
          : 0;
        const highScoreD = newStatsDay[mode]?.Highest
          ? newStatsDay[mode].Highest
          : 0;
        const avarageScoreD = newStatsDay[mode]?.Avarage
          ? newStatsDay.data()[mode].Avarage
          : 0;

        newStatsDay.timeSpent = timeSpentD + data.time;
        newStatsDay.punches = punchesD + data.punches;
        newStatsDay.sessionsNum = sessionsNumD + 1;
        newStatsDay[mode] = { Highest: highScoreD, Avarage: avarageScoreD };
        if (score > highScoreD) newStatsDay[mode].Highest = score;
        newStatsDay[mode].Avarage =
          (avarageScoreD * sessionsNumM + score) / (sessionsNumD + 1);

        pendingWrites.push((t) => {
          t.update(doc(db, `users/${userCtx.id}/stats/${dayMonthYear}`), {
            ...newStatsDay,
          });
        });

        //SPRAWDZIC ACHIVEMENTY
        pendingWrites.push((t) => {
          t.update(doc(db, `machines/${id}`), {
            current: {},
            old: [data, ...machineData.data().old],
          });
        });
        for (write of pendingWrites) {
          write(transaction);
        }

        //console.log("return");
        return;
      });
    } catch (e) {
      Alert.alert("Error", t("Error message"));
      console.log(e);
    }
  }

  return (
    <View style={styles.root}>
      <Pressable onPress={connectHandler}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>{t("Connect")}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default NfcScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    shadowColor: "black",
    shadowOffset: { height: 2, width: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 15,
    height: 150,
    width: 150,
    borderRadius: 75,
    backgroundColor: Colors.accent500,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.primary100,
    fontSize: 30,
    fontWeight: "bold",
  },
});
