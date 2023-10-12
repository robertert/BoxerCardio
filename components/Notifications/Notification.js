import { View, Text, Image, StyleSheet, Pressable } from "react-native";
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
import { ListItem } from "@rneui/themed";
import { MaterialIcons } from "@expo/vector-icons";
import Swipeable from "react-native-swipeable";

function Notification({
  type,
  text,
  userId,
  userName,
  id,
  groupId,
  name,
  groupName,
  groupPhotoUrl,
  createDate,
}) {
  const navigation = useNavigation();

  const [isVisible, setIsVisible] = useState(true);
  const [image, setImage] = useState();
  const [time, setTime] = useState("");

  const userCtx = useContext(UserContext);

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
      if (timeDifference < 60) {
        setTime("just now");
      } else if (timeDifference >= 60 && timeDifference / 60 < 60) {
        const mins = Math.floor(timeDifference / 60);
        if (mins === 1) {
          setTime(`1 minute ago`);
        } else {
          setTime(`${mins} minutes ago`);
        }
      } else if (timeDifference / 60 >= 60 && timeDifference / (60 * 60) < 24) {
        const hours = Math.floor(timeDifference / (60 * 60));
        if (hours === 1) {
          setTime(`1 hour ago`);
        } else {
          setTime(`${hours} hours ago`);
        }
      } else if (
        timeDifference / (60 * 60) >= 24 &&
        timeDifference / (60 * 60 * 24) < 2
      ) {
        setTime("yesterday");
      } else if (
        timeDifference / (60 * 60 * 24) >= 2 &&
        timeDifference / (60 * 60 * 24) < 7
      ) {
        const days = Math.floor(timeDifference / (60 * 60 * 24));
        setTime(`${days} days ago`);
      } else if (
        timeDifference / (60 * 60 * 24) >= 7 &&
        timeDifference / (60 * 60 * 24) < 30
      ) {
        const weeks = Math.floor(timeDifference / (60 * 60 * 24 * 7));
        if (weeks === 1) {
          setTime("1 week ago");
        } else {
          setTime(`${weeks} weeks ago`);
        }
      } else if (
        timeDifference / (60 * 60 * 24) >= 30 &&
        timeDifference / (60 * 60 * 24) < 365
      ) {
        const months = Math.floor(timeDifference / (60 * 60 * 24 * 30));
        if (months === 1) {
          setTime("1 months ago");
        } else {
          setTime(`${months} month ago`);
        }
      } else {
        const years = Math.floor(timeDifference / (60 * 60 * 24 * 365));
        if (years === 1) {
          setTime("1 year ago");
        } else {
          setTime(`${years} years ago`);
        }
      }
    }
    fetchTime();
    fetchPhoto();
  }, []);

  async function acceptHandler() {
    try {
      if (type === "groupInvitation") {
        await runTransaction(db, async (transaction) => {
          const data = await transaction.get(
            doc(db, `trainingGroups/${groupId}`)
          );
          const preData = data.data();

          const userData = await transaction.get(
            doc(db, `users/${userCtx.id}`)
          );
          const prevUserData = userData.data();
          transaction.update(doc(db, `trainingGroups/${groupId}`), {
            members: [
              ...preData.members,
              {
                id: userCtx.id,
                name: name,
                photoUrl: photoUrl,
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
                membersNum: preData.membersNum + 1,
                rank: 1,
                photoUrl: groupPhotoUrl,
              },
            ],
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
          data1.data().friends.forEach((friend)=>{
            if(friend.id === userCtx.id){
              console.log("TEST");
              czy=true;
            }
          })
          if(czy)return;
          transaction.update(doc(db, `users/${userCtx.id}`), {
            friends: [
              ...data.data().friends,
              {
                id: userId,
                name: name,
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
            incoming: arrayRemove(userCtx.id),
          });
          transaction.delete(
            doc(db, `users/${userCtx.id}/notifications/${id}`)
          );
        });
        setIsVisible(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function denyHandler() {
    try {
      await deleteDoc(doc(db, `users/${userId}/notifications/${id}`));
    } catch (e) {
      console.log(e);
    }
    setIsVisible(false);
  }

  function viewProfileHandler() {
    navigation.navigate("friend-profile", { id: userId });
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
                  <Text style={styles.buttonText}>Accept</Text>
                </View>
              </Pressable>
              <Pressable onPress={denyHandler}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Deny</Text>
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
