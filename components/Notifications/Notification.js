import { View, Text, Image, StyleSheet, Pressable, Alert } from "react-native";
import Colors from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native-paper";

function Notification({
  type,
  gotText,
  userId,
  userName,
  id,
  groupId,
  name,
  groupName,
  groupShort,
  createDate,
}) {
  const navigation = useNavigation();

  const [isVisible, setIsVisible] = useState(true);
  const [image, setImage] = useState();
  const [time, setTime] = useState("");
  const [text, setText] = useState(gotText);
  const [isLoading, setIsLoading] = useState(false);

  const userCtx = useContext(UserContext);

  const { t } = useTranslation();

  function translateText() {
    if (type === "groupInvitation") {
      setText(t(gotText, { userName: userName, teamName: groupName }));
    } else if (type === "friendInvitation") {
      setText(t(gotText, { name: userName }));
    }
  }

  useEffect(() => {
    async function fetchPhoto() {
      try {
        const url = await getDownloadURL(
          ref(storage, `users/${userId}/photo.jpg`)
        );
        setImage(url);
      } catch (e) {
        console.log(e);
        if (e.code === "storage/object-not-found") {
          try {
            const url = await getDownloadURL(
              ref(storage, `users/defaultPhoto.jpg`)
            );

            setImage(url);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
    function fetchTime() {
      const creationDate = createDate?.toDate();
      const timeDifference =
        (new Date().getTime() - creationDate?.getTime()) / 1000;
      if (isNaN(timeDifference)) {
        setTime("");
        return;
      }
      if (timeDifference < 60) {
        setTime(t("just now"));
      } else if (timeDifference >= 60 && timeDifference / 60 < 60) {
        const mins = Math.floor(timeDifference / 60);
        if (mins === 1) {
          setTime(t(`minute ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`minute ago`, { postProcess: "interval", count: mins }));
        }
      } else if (timeDifference / 60 >= 60 && timeDifference / (60 * 60) < 24) {
        const hours = Math.floor(timeDifference / (60 * 60));
        if (hours === 1) {
          setTime(t(`hour ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`hour ago`, { postProcess: "interval", count: hours }));
        }
      } else if (
        timeDifference / (60 * 60) >= 24 &&
        timeDifference / (60 * 60 * 24) < 2
      ) {
        setTime(t("yesterday"));
      } else if (
        timeDifference / (60 * 60 * 24) >= 2 &&
        timeDifference / (60 * 60 * 24) < 7
      ) {
        const days = Math.floor(timeDifference / (60 * 60 * 24));
        setTime(t(`days ago`, { postProcess: "interval", count: days }));
      } else if (
        timeDifference / (60 * 60 * 24) >= 7 &&
        timeDifference / (60 * 60 * 24) < 30
      ) {
        const weeks = Math.floor(timeDifference / (60 * 60 * 24 * 7));
        if (weeks === 1) {
          setTime(t(`week ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`week ago`, { postProcess: "interval", count: weeks }));
        }
      } else if (
        timeDifference / (60 * 60 * 24) >= 30 &&
        timeDifference / (60 * 60 * 24) < 365
      ) {
        const months = Math.floor(timeDifference / (60 * 60 * 24 * 30));
        if (months === 1) {
          setTime(t(`month ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`month ago`, { postProcess: "interval", count: months }));
        }
      } else {
        const years = Math.floor(timeDifference / (60 * 60 * 24 * 365));
        if (years === 1) {
          setTime(t(`year ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`year ago`, { postProcess: "interval", count: years }));
        }
      }
    }
    fetchTime();
    fetchPhoto();
    translateText();
  }, []);

  async function acceptHandler() {
    setIsLoading(true);
    try {
      if (type === "groupInvitation") {
        const data = await getDoc(doc(db, `users/${userCtx.id}`));
        if (
          data.data().trainingGroups.filter((group) => group.id === groupId)
            .length > 0
        ) {
          deleteDoc(doc(db, `users/${userCtx.id}/notifications/${id}`));
          setIsVisible(false);
          return;
        }
        await runTransaction(db, async (transaction) => {
          const data = await transaction.get(
            doc(db, `trainingGroups/${groupId}`)
          );
          const preData = data.data();

          const userData = await transaction.get(
            doc(db, `users/${userCtx.id}`)
          );
          const prevUserData = userData.data();
          let readyPermissions;
          if (preData.settings.isAllowedMembersInvitations) {
            readyPermissions = [
              ...prevUserData.permissions,
              { id: groupId, type: "invitations" },
            ];
          } else {
            readyPermissions = prevUserData.permissions;
          }
          //WEJSC DO TEAMU Z DRUGEIGO KONTA I ZOBACZĆ CZY DODAŁO PERMISSIONS
          transaction.update(doc(db, `trainingGroups/${groupId}`), {
            members: [
              ...preData.members,
              {
                id: userCtx.id,
                name: userCtx.name,
                isOwner: false,
              },
            ],
            membersNum: preData.membersNum + 1,
          });
          transaction.update(doc(db, `users/${userCtx.id}`), {
            trainingGroups: [
              ...prevUserData.trainingGroups,
              {
                id: groupId,
                name: groupName,
                tag: groupShort.slice(0, 4),
              },
            ],
            permissions: readyPermissions,
          });
          transaction.delete(
            doc(db, `users/${userCtx.id}/notifications/${id}`)
          );
        });
        setIsVisible(false);
      } else if (type === "friendInvitation") {
        await runTransaction(db, async (transaction) => {
          const data = await transaction.get(doc(db, `users/${userCtx.id}`));
          const data1 = await transaction.get(doc(db, `users/${userId}`));

          let czy = false;
          data1.data().friends.forEach((friend) => {
            if (friend.id === userCtx.id) {
              czy = true;
            }
          });
          if (czy) return;
          transaction.update(doc(db, `users/${userCtx.id}`), {
            friends: [
              ...data.data().friends,
              {
                id: userId,
                name: userName,
              },
            ],
          });
          transaction.update(doc(db, `users/${userId}`), {
            friends: [
              ...data1.data().friends,
              {
                id: userCtx.id,
                name: userCtx.name,
              },
            ],
          });
          transaction.update(doc(db, `users/${userCtx.id}`), {
            incoming: arrayRemove(userId),
          });
          transaction.update(doc(db, `users/${userId}`), {
            pending: arrayRemove(userCtx.id),
          });
          transaction.delete(
            doc(db, `users/${userCtx.id}/notifications/${id}`)
          );
        });
        setIsLoading(false);
        setIsVisible(false);
      }
    } catch (e) {
      Alert.alert("Error", t("Error message"));
      console.log(e);
    }
  }

  async function denyHandler() {
    try {
      await deleteDoc(doc(db, `users/${userCtx.id}/notifications/${id}`));
    } catch (e) {
      console.log(e);
    }
    setIsVisible(false);
  }

  function viewProfileHandler() {
    navigation.navigate("friend-profile", { id: userId });
  }

  if (isLoading) {
    return (
      <View style={[styles.root, !isVisible && { display: "none" }]}>
        <ActivityIndicator size={"small"} color={Colors.accent500} />
      </View>
    );
  }

  return (
    <View style={[styles.root, !isVisible && { display: "none" }]}>
      <View style={styles.inner}>
        <Pressable onPress={viewProfileHandler}>
          <Image style={styles.image} source={{ uri: image }} />
        </Pressable>
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{text}</Text>
          {type !== "info" && (
            <View style={styles.buttonsContainer}>
              <Pressable onPress={acceptHandler}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>{t("Accept")}</Text>
                </View>
              </Pressable>
              <Pressable onPress={denyHandler}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>{t("Deny")}</Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.timeText}>{time}</Text>
    </View>
  );
}

export default Notification;

const styles = StyleSheet.create({
  root: {
    marginTop: 35,
    marginHorizontal: 20,
  },
  inner: {
    flexDirection: "row",
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  contentContainer: {
    width: 290,
  },
  contentText: {
    marginVertical: 5,
    marginHorizontal: 10,
    fontSize: 12,
    color: Colors.primary100,
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    height: 15,
    width: 90,
    backgroundColor: Colors.accent300,
    borderRadius: 7,
    shadowColor: "black",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 20,
  },
  buttonText: {
    color: Colors.primary100,
    fontSize: 11,
  },
  swipeableContainer: {
    minHeight: "100%",
    backgroundColor: Colors.accent500,
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  swipeableText: {
    marginRight: 10,
    color: Colors.primary100,
    fontSize: 23,
    fontWeight: "800",
  },
  timeText: {
    marginTop: 5,
    marginLeft: 5,
    color: Colors.primary100_30,
    fontSize: 10,
    fontWeight: "600",
  },
});
