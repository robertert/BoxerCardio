import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../../../constants/colors";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import { useState } from "react";

function TrainingGroup({ name, rank, membersNum, id }) {
  const navigation = useNavigation();
  const [image, setImage] = useState();

  useEffect(() => {
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
    fetchPhoto();
  }, []);

  function detailsHandler() {
    navigation.navigate("training-groups-details", { id: id });
  }

  return (
    <Pressable onPress={detailsHandler}>
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
