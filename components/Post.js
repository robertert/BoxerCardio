import { View, StyleSheet, Text, Image, Pressable } from "react-native";
import Colors from "../constants/colors";
import { Entypo } from "@expo/vector-icons";
import { useState } from "react";

function Post({ name }) {

    const [info,setInfo] = useState(false);

    function infoHandler(){
        setInfo(true);
    }

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View style={styles.left}>
          <Image source={require("../assets/icon.png")} style={styles.image} />
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.right}>
          <Pressable onPress={infoHandler}>
            <Entypo name="dots-three-vertical" size={30} color="white" />
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>
        {info && <View style={styles.info}></View>}
      </View>
      <View style={styles.footer}></View>
    </View>
  );
}

export default Post;

const styles = StyleSheet.create({
  root: {
    height: 330,
    width: "86%",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 10,
    zIndex: 2,
  },
  head: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    
  },
  content: {
    flex: 4,
    backgroundColor: Colors.primary400,
    borderRadius: 20,
    alignItems: "flex-end",
  },
  footer: {
    borderRadius: 25,
    flex: 1,
    backgroundColor: Colors.accent500_80,
  },
  name: {
    marginHorizontal: 10,
    color: Colors.primary100,
    fontSize: 23,
  },
  image: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
  },
  info:{
    width: 200,
    height: 300,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
  }
});
