import { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, Pressable } from "react-native";
import Colors from "../../../constants/colors";
import CommentList from "./CommentList";

function Comment({ content, id, name, photoUrl, responses }) {
  const [isResponse, setIsResponse] = useState(false);
  const [showResponse,setShowResponse] = useState(false);
  useEffect(() => {
    if (responses) {
      setIsResponse(responses?.length !== 0);
    } 
  }, []);

  function replyHandler() {}
  function answerShowHandler() {
    setShowResponse(true);
  }
  function answerHideHandler() {
    setShowResponse(false);
  }

  return (
    <View style={styles.root}>
      <View style={styles.main}>
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.userPhoto}
        />
        <View style={styles.textContainer}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.content}>{content}</Text>
          <View style={styles.footer}>
            {(isResponse&&!showResponse) && (
              <Pressable onPress={answerShowHandler}>
                <Text style={styles.footerText}>Show answers</Text>
              </Pressable>
            )}
            <Pressable onPress={replyHandler}>
              <Text style={styles.footerText}>Reply</Text>
            </Pressable>
          </View>
        </View>
      </View>
      {showResponse && (
        <View style={styles.responses}>
          <CommentList responses={responses} onHide={answerHideHandler}/>
        </View>
      )}
    </View>
  );
}

export default Comment;

const styles = StyleSheet.create({
  root: {
    width: "100%",
    marginHorizontal: 20,
    flexDirection: "column",
    marginTop: 15,
  },
  main: {
    flexDirection: "row",
  },
  userPhoto: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  textContainer: {
    marginHorizontal: 10,
  },
  userName: {
    color: Colors.primary100,
    fontSize: 14,
    fontWeight: 700,
  },
  content: {
    color: Colors.primary100,
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    marginTop: 7,
  },
  footerText: {
    color: Colors.primary100_30,
    fontSize: 10,
    marginRight: 20,
  },
  responses: {
    marginLeft: 30,
  },
});
