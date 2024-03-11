import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import Divider from "../../UI/Divider";
import { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../../firebaseConfig";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import Colors from "../../../constants/colors";
import { useContext } from "react";
import { UserContext } from "../../../store/user-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, doc, runTransaction } from "firebase/firestore";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native-paper";

function AddNewMemberFormItem({
  item,
  viewProfile,
  teamId,
  teamName,
  teamShort,
  setResults,
}) {
  const [image, setImage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const userCtx = useContext(UserContext);

  const { t } = useTranslation();

  useEffect(() => {
    async function fetchPhoto() {
      try {
        const url = await getDownloadURL(
          ref(storage, `users/${item.id}/photo.jpg`)
        );
        setImage(url);
      } catch (e) {
        if (e.code === "storage/object-not-found") {
          try {
            const url = await getDownloadURL(
              ref(storage, `users/defaultPhoto.jpg`)
            );

            setImage(url);
          } catch (e) {
            console.log(e);
          }
        } else {
          console.log(e);
        }
      }
    }
    fetchPhoto();
  }, []);

  function viewProfileHandler() {
    viewProfile();
  }

  async function addMemberHandler() {
    setIsLoading(true);
    try {
      //SEND NOTIFICATION
      await addDoc(collection(db, `users/${item.id}/notifications`), {
        createTime: new Date(),
        type: "groupInvitation",
        groupId: teamId,
        groupName: teamName,
        groupShort: teamShort,
        userId: userCtx.id,
        name: userCtx.name,
        photoUrl: userCtx.photoUrl,
        text: `userCtx.name send you an invitation to teamName training group.`,
      });
      setIsLoading(false);
      setResults((prev) => prev.filter((pre) => pre.id !== item.id));
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.accent500} size={"small"} />
      </View>
    );
  }

  return (
    <View style={styles.resultContainer}>
      <View style={styles.userContainer}>
        <Pressable onPress={viewProfileHandler}>
          <Image style={styles.img} source={{ uri: image }} />
        </Pressable>
        <Pressable onPress={viewProfileHandler}>
          <Text style={styles.resultText}>{item.name}</Text>
        </Pressable>
      </View>
      <Pressable onPress={addMemberHandler}>
        <AntDesign name="plus" size={32} color="white" />
      </Pressable>
    </View>
  );
}

export default AddNewMemberFormItem;

const styles = StyleSheet.create({
  info: {
    width: 200,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    marginTop: 40,
  },
  infoText: {
    color: Colors.primary100,
    fontSize: 20,
    textAlign: "center",
  },
  infoTextRed: {
    color: Colors.accent500,
    fontSize: 20,
    textAlign: "center",
  },
  infoWraper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  loadingContainer: {
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginVertical: 5,
    borderColor: Colors.primary100_30,
    alignItems: "center",
    borderRadius: 25,
  },
  resultContainer: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Colors.primary100_30,
    alignItems: "center",
    borderRadius: 25,
  },
  resultText: {
    color: Colors.primary100,
    fontSize: 20,
  },
  img: {
    height: 46,
    width: 46,
    borderRadius: 23,
    marginRight: 20,
    marginLeft: 20,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeholder: {
    height: 32,
    width: 32,
  },
});
