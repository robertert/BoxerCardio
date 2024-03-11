import { Text, View, Image, StyleSheet } from "react-native";
import Colors from "../../constants/colors";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import { useState } from "react";

function LeaderboardItem({ userId, name, score, photoUrl, rank, type }) {
  const navigation = useNavigation();
  const [image, setImage] = useState();
  const [scr, setScr] = useState(score);

  function fetchScr() {
    if (type === "TIME") {
      if (score > 3600) {
        const hours = Math.floor(score / 3600);
        let min, sec;
        if (Math.floor((score % 3600) / 60) === 0) {
          min = "00";
        } else if (Math.floor((score % 3600) / 60) < 10) {
          min = `0${Math.floor((score % 3600) / 60)}`;
        } else {
          min = Math.floor((score % 3600) / 60);
        }
        if (score % 60 === 0) {
          sec = "00";
        } else if (score % 60 < 10) {
          sec = `0${score % 60}`;
        } else {
          sec = score % 60;
        }
        setScr(`${hours}:${min}:${sec}`);
      } else if (score > 60) {
        let min, sec;
        if (Math.floor((score % 3600) / 60) === 0) {
          min = "00";
        } else {
          min = Math.floor((score % 3600) / 60);
        }
        if (score % 60 === 0) {
          sec = "00";
        } else if (score % 60 < 10) {
          sec = `0${score % 60}`;
        } else {
          sec = score % 60;
        }
        setScr(`${min}:${sec}`);
      } else if (score > 0) {
        setScr(`00:${score}`);
      }
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
    fetchPhoto();
    fetchScr();
  }, []);

  function viewProfileHandler() {
    navigation.navigate("friend-profile", { id: userId });
  }

  return (
    <View style={styles.root}>
      <View style={styles.rankContainer}>
        <Text style={styles.text}>
          {rank}
          {!isNaN(rank) && "."}
        </Text>
      </View>
      <Pressable onPress={viewProfileHandler}>
        <View style={styles.userContainer}>
          <Image style={styles.img} source={{ uri: image }} />
          <Text style={styles.text}>{name}</Text>
        </View>
      </Pressable>
      <View style={styles.scoreContainer}>
        <Text style={styles.text}>{scr}</Text>
      </View>
    </View>
  );
}

export default LeaderboardItem;

const styles = StyleSheet.create({
  root: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: Colors.primary100,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  img: {
    height: 46,
    width: 46,
    borderRadius: 23,
    marginRight: 20,
  },
  userContainer: {
    marginLeft: 20,
    marginRight: 15,
    width: 170,
    flexDirection: "row",
    alignItems: "center",
  },
  scoreContainer: {
    width: 60,
    justifyContent: "center",
  },
  rankContainer: {
    width: 60,
  },
});
