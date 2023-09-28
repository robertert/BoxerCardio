import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import Colors from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import {
  arrayUnion,
  deleteDoc,
  doc,
  increment,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";

function Notification({
  type,
  text,
  photoUrl,
  userId,
  id,
  groupId,
  name,
  groupName,
  groupPhotoUrl,
}) {
  const navigation = useNavigation();

  const [isVisible, setIsVisible] = useState(true);
  const [image, setImage] = useState();

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
  );
}

export default Notification;

const styles = StyleSheet.create({
  root: {
    marginTop: 35,
    flexDirection: "row",
    marginHorizontal: 20,
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
});
