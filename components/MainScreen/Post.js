import { View, StyleSheet, Text, Image, Pressable } from "react-native";
import Colors from "../../constants/colors";
import { Entypo } from "@expo/vector-icons";
import { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import { useNavigation } from "@react-navigation/native";

function Divider() {
  return (
    <View style={styles.divider}>
    </View>
  );
}

function Post({ name,onShare,id }) {
  const [isLiked, setIsLiked] = useState(false);
  const navigation = useNavigation();

  function likeHandler() {
    setIsLiked((prev) => !prev);
  }
  function commentHandler() {
    navigation.getParent().navigate('comment',{id: id});
  }
  function shareHandler() {
    onShare();
  }

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View style={styles.left}>
          <Image source={require("../../assets/icon.png")} style={styles.image} />
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.right}>
          <Menu>
            <MenuTrigger>
              <Entypo name="dots-three-vertical" size={30} color="white" />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: styles.info,
                optionText: styles.infoText,
                optionsWrapper: styles.infoWraper
              }}
            >
              <MenuOption onSelect={()=>navigation.getParent().navigate('report')} text="Report" />
              <Divider/>
              <MenuOption onSelect={() => alert(`Removed friends`)} text="Remove friend" />
            </MenuOptions>
          </Menu>
        </View>
      </View>
      <View style={styles.content}></View>
      <View style={styles.footer}>
        <Pressable onPress={likeHandler}>
          <AntDesign
            name={!isLiked ? "hearto" : "heart"}
            size={32}
            color="white"
          />
        </Pressable>
        <Pressable onPress={commentHandler}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={32}
            color="white"
          />
        </Pressable>
        <Pressable onPress={shareHandler}>
          <Feather name="share" size={32} color="white" />
        </Pressable>
      </View>
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
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
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
  info: {
    width: 200,
    height: 100,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    marginTop: 40,
  },
  infoText: {
    color: Colors.primary100,
    fontSize: 20,
    textAlign: "center",
  },
  infoWraper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  divider:{
    backgroundColor: Colors.primary100_30,
    width: "100%",
    height : 1,
  },
});
