import { Text, View, Image, StyleSheet } from "react-native";
import Colors from "../../constants/colors";

function LeaderboardItem({ name, score, photoUrl, rank }) {
  return (
    <View style={styles.root}>
      <View style={styles.rankContainer}>
        <Text style={styles.text}>{rank}.</Text>
      </View>
      <View style={styles.userContainer}>
        <Image style={styles.img} source={require("../../assets/icon.png")} />
        <Text style={styles.text}>{name}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.text}>{score}</Text>
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
    justifyContent: "space-around",
  },
  text: {
    color: Colors.primary100,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  img: {
    height: 46,
    width: 46,
    borderRadius: 23,
    marginRight: 20,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreContainer: {
    width: 60,
    justifyContent: "center",
  },
  rankContainer: {
    width: 60,
  }
});
