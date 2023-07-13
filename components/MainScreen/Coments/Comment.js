import { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, Pressable } from "react-native";
import Colors from "../../../constants/colors";
import CommentList from "./CommentList";
import CommentList2 from "./CommentList2";

function Comment({
  postId,
  parentId,
  content,
  id,
  name,
  photoUrl,
  areResponses,
  createDate,
  onReply,
  level,
  grandparentId,
}) {
  const [isResponse, setIsResponse] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [showReply, setShowReply] = useState(true);

  useEffect(() => {
    if (areResponses) {
      setIsResponse(true);
    }
    if (level >= 3) {
      setIsResponse(false);
      setShowReply(false);
    }
  }, []);

  function replyHandler() {
    if (level == 1) {
      onReply({ id: id, name: name }, "");
    } else {
      onReply({ id: id, name: name }, parentId);
    }
  }
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
            {isResponse && !showResponse && (
              <Pressable onPress={answerShowHandler}>
                <Text style={styles.footerText}>Show answers</Text>
              </Pressable>
            )}
            {showReply && (
              <Pressable onPress={replyHandler}>
                <Text style={styles.footerText}>Reply</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
      {showResponse && (
        <View style={[styles.responses, level >= 2 && { marginLeft: 0 }]}>
          {level === 1 ? (
            <CommentList
              postId={postId}
              id={id}
              parentId={parentId}
              onHide={answerHideHandler}
              onReply={onReply}
              level={2}
            />
          ) : (
            <CommentList2
              postId={postId}
              id={id}
              parentId={parentId}
              onHide={answerHideHandler}
              onReply={onReply}
              level={3}
            />
          )}
        </View>
      )}
    </View>
  );
}

export default Comment;

const styles = StyleSheet.create({
  root: {
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
