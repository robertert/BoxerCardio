import { Pressable, Text, View, StyleSheet, Image } from "react-native";
import Divider from "../UI/Divider";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../constants/colors";

function FriendDisplay({ item }) {
  const [image, setImage] = useState();

  const navigation = useNavigation();

  useEffect(() => {
    fetchPhoto();
  }, []);
  async function fetchPhoto() {
    try {
      const url = await getDownloadURL(
        ref(storage, `users/${item.id}/photo.jpg`)
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

  function viewProfileHandler() {
    navigation.navigate("friend-profile", { id: item.id });
  }

  return (
    <>
      <Pressable onPress={viewProfileHandler}>
        <View style={styles.friendContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <Text style={styles.friendText}>{item.name}</Text>
        </View>
      </Pressable>
      <Divider />
    </>
  );
}
export default FriendDisplay;

const styles = StyleSheet.create({
  friendContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 10,
    alignItems: "center",
    backgroundColor: Colors.primary500,
    borderRadius: 30,
  },
  friendText: {
    color: Colors.primary100,
    fontSize: 16,
    marginLeft: 15,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
});
