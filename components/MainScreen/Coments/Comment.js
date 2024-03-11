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
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

function Comment({
  type,
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
  const [type1, setType1] = useState(type);
  const [commentImage, setCommentImage] = useState();
  const [time, setTime] = useState("just now");

  const {t} = useTranslation();

  useEffect(() => {
    if (!type) {
      setType1("text");
    }
    if (type === "image") {
      fetchCommentPhoto();
    }
    if (areResponses) {
      setIsResponse(true);
    }
    if (level >= 3) {
      setIsResponse(false);
      setShowReply(false);
    }
    async function fetchCommentPhoto() {
      setIsLoading(true);
      try {
        const url = await getDownloadURL(ref(storage, `comments/${id}.jpg`));
        setCommentImage(url);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
        if (e.code === "storage/object-not-found") {
          try {
            const url = await getDownloadURL(
              ref(storage, `posts/defaultPhoto.jpg`)
            );

            setCommentImage(url);
            setIsLoading(false);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
    async function fetchPhoto() {
      setIsLoading(true);
      try {
        const url = await getDownloadURL(
          ref(storage, `users/${userId}/photo.jpg`)
        );
        setImage(url);
        setIsLoading(false);
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
    function fetchTime() {
      const creationDate = createDate.toDate();
      const timeDifference =
        (new Date().getTime() - creationDate.getTime()) / 1000;
      if (timeDifference < 60) {
        setTime(t("just now"));
      } else if (timeDifference >= 60 && timeDifference / 60 < 60) {
        const mins = Math.floor(timeDifference / 60);
        if (mins === 1) {
          setTime(t(`minute ago`,{postProcess: 'interval', count: 1}));
        } else {
          setTime(t(`minute ago`,{postProcess: 'interval', count: mins}));
        }
      } else if (timeDifference / 60 >= 60 && timeDifference / (60 * 60) < 24) {
        const hours = Math.floor(timeDifference / (60 * 60));
        if (hours === 1) {
          setTime(t(`hour ago`,{postProcess: 'interval', count: 1}));
        } else {
          console.log(t(`hour ago`,{postProcess: 'interval', count: hours}));
          setTime(t(`hour ago`,{postProcess: 'interval', count: hours}));
        }
      } else if (
        timeDifference / (60 * 60) >= 24 &&
        timeDifference / (60 * 60 * 24) < 2
      ) {
        setTime(t("yesterday"));
      } else if (
        timeDifference / (60 * 60 * 24) >= 2 &&
        timeDifference / (60 * 60 * 24) < 7
      ) {
        const days = Math.floor(timeDifference / (60 * 60 * 24));
        setTime(t(`days ago`,{postProcess: 'interval', count: days}));
      } else if (
        timeDifference / (60 * 60 * 24) >= 7 &&
        timeDifference / (60 * 60 * 24) < 30
      ) {
        const weeks = Math.floor(timeDifference / (60 * 60 * 24 * 7));
        if (weeks === 1) {
          setTime(t(`week ago`,{postProcess: 'interval', count: 1}));
        } else {
          setTime(t(`week ago`,{postProcess: 'interval', count: weeks}));
        }
      } else if (
        timeDifference / (60 * 60 * 24) >= 30 &&
        timeDifference / (60 * 60 * 24) < 365
      ) {
        const months = Math.floor(timeDifference / (60 * 60 * 24 * 30));
        if (months === 1) {
          setTime(t(`month ago`,{postProcess: 'interval', count: 1}))
        } else {
          setTime(t(`month ago`,{postProcess: 'interval', count: months}));
        }
      } else {
        const years = Math.floor(timeDifference / (60 * 60 * 24 * 365));
        if (years === 1) {
          setTime(t(`year ago`,{postProcess: 'interval', count: 1}));
        } else {
          setTime(t(`year ago`,{postProcess: 'interval', count: years}));

        }
      }
    }
    fetchTime();
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
              <View style={styles.topContainer}>
                <Pressable onPress={viewProfileHandler}>
                  <Text style={styles.userName}>{name}</Text>
                </Pressable>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              {type1 === "text" && (
                <Text style={styles.content}>{content.trim()}</Text>
              )}
              {type1 === "image" && (
                <Image
                  style={styles.commentImage}
                  source={{ uri: commentImage }}
                />
              )}
              <View style={styles.footer}>
                {isResponse && !showResponse && (
                  <Pressable onPress={answerShowHandler}>
                    <Text style={styles.footerText}>{t("Show answers")}</Text>
                  </Pressable>
                )}
                {showReply && (
                  <Pressable onPress={replyHandler}>
                    <Text style={styles.footerText}>{t("Reply")}</Text>
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
  image: {
    height: 150,
    width: 150,
    borderRadius: 20,
  },
  commentImage: {
    marginTop: 20,
    height: 200,
    width: 200,
    borderRadius: 20,
  },
  topContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  timeText: {
    marginLeft: 10,
    color: Colors.primary100_30,
    fontSize: 10,
    fontWeight: "600",
  },
});
