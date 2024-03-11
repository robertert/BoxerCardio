import { View, Text, Image, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors, { LISTA_SKROTOW } from "../../../constants/colors";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../../firebaseConfig";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";
import { UserContext } from "../../../store/user-context";
import { ActivityIndicator } from "react-native-paper";

function TrainingGroup({ name, id }) {
  const navigation = useNavigation();
  const [image, setImage] = useState();
  const [membersNum, setMembersNum] = useState(0);
  const [rank, setRank] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { t } = useTranslation();

  const userCtx = useContext(UserContext);

  const date = new Date();

  async function fetchPhoto() {
    try {
      const url = await getDownloadURL(
        ref(storage, `trainingGroups/${id}/photo.jpg`)
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

  async function fetchData() {
    try {
      const data = await getDoc(doc(db, `trainingGroups/${id}`));
      const rank = await axios.post(
        "https://us-central1-boxerapp-beb5c.cloudfunctions.net/getRank",
        {
          data: {
            playerID: userCtx.id,
            group: id,
            mode: data.data().settings.displayedMode
              ? data.data().settings.displayedMode
              : "100P",
            date: date.getFullYear(),
          },
        }
      );
      setRank(rank.data.rank);
      setMembersNum(data.data().membersNum);
      await fetchPhoto();
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      Alert.alert(t("Error message"));
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function detailsHandler() {
    navigation.navigate("training-groups-details", { id: id });
  }

  return (
    <Pressable onPress={detailsHandler}>
      {isLoading ? (
        <ActivityIndicator
          color={Colors.accent500}
          size="small"
          style={{ marginVertical: 10 }}
        />
      ) : (
        <View style={styles.root}>
          <Image style={styles.image} source={{ uri: image }} />
          <View style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{name}</Text>
            <View style={styles.groupDetails}>
              <View style={styles.detailsSubcontainer}>
                <Ionicons name="person" size={24} color="white" />
                <Text style={styles.groupDetailsText}>{membersNum}</Text>
              </View>
              <View style={styles.detailsSubcontainer}>
                <MaterialCommunityIcons name="podium" size={24} color="white" />
                <Text style={styles.groupDetailsText}>{rank}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default TrainingGroup;

const styles = StyleSheet.create({
  root: {
    marginVertical: 10,
    height: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 15,
    marginRight: 10,
  },
  groupContainer: {
    flex: 1,
    backgroundColor: Colors.primary400,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  groupDetails: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  groupTitle: {
    color: Colors.primary100,
    fontSize: 20,
    fontFamily: "RubikMono",
  },
  groupDetailsText: {
    marginHorizontal: 10,
    color: Colors.primary100,
    fontSize: 20,
    fontWeight: "800",
  },
  detailsSubcontainer: {
    width: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
