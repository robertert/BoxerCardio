import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Colors from "../../../constants/colors";
import CommentList from "./CommentList";
import CommentList2 from "./CommentList2";
import { useNavigation } from "@react-navigation/native";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../../firebaseConfig";

function Comment({
  userId,
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
  const [image, setImage] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (areResponses) {
      setIsResponse(true);
    }
    if (level >= 3) {
      setIsResponse(false);
      setShowReply(false);
    }
    async function fetchPhoto() {
      setIsLoading(true);
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
            setIsLoading(false);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
    fetchPhoto();
  }, []);

  const navigation = useNavigation();

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
  function viewProfileHandler() {
    navigation.navigate("friend-profile", { id: userId });
  }

  return (
    <View style={styles.root}>
      {!isLoading ? (
        <>
          <View style={styles.main}>
            <Pressable onPress={viewProfileHandler}>
              <Image source={{ uri: image }} style={styles.userPhoto} />
            </Pressable>
            <View style={styles.textContainer}>
              <Pressable onPress={viewProfileHandler}>
                <Text style={styles.userName}>{name}</Text>
              </Pressable>
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
        </>
      ) : (
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size="small"
          color={Colors.accent500}
        />
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
