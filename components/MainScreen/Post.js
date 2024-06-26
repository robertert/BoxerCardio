import { View, StyleSheet, Text, Image, Pressable, Alert } from "react-native";
import Colors from "../../constants/colors";
import { Entypo } from "@expo/vector-icons";
import { useContext, useState } from "react";
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
import { db, storage } from "../../firebaseConfig";
import {
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { UserContext } from "../../store/user-context";
import { useEffect } from "react";
import Divider from "../UI/Divider";
import { getDownloadURL, ref } from "firebase/storage";
import { useTranslation } from "react-i18next";

function Post({
  name,
  onShare,
  id,
  userId,
  likesNum,
  commentsNum,
  likes,
  description,
  createDate,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeNum, setLikeNum] = useState(0);
  const [commentNum, setCommentNum] = useState(0);
  const [image, setImage] = useState();
  const [postImage, setPostImage] = useState();
  const [desc, setDesc] = useState(description);
  const [showMore, setShowMore] = useState("Show more");
  const [isVisibleMore, setIsVisibleMore] = useState(false);
  const [showDesc, setShowDesc] = useState(true);
  const [time, setTime] = useState("");
  const [isRemove,setIsRemove] = useState(false);

  const userCtx = useContext(UserContext);
  const navigation = useNavigation();

  const { t } = useTranslation();

  async function fetchIsRemove(){
    const data = await getDoc(doc(db,`users/${userCtx.id}`));
    if(data.data().friends.filter((friend)=>friend.id === userId).length!=0){
      setIsRemove(true);
    }
  }

  async function removeFriendHandler() {
    try {
      await runTransaction(db, async (transaction) => {
        const data = await transaction.get(doc(db, `users/${userCtx.id}`));
        const data1 = await transaction.get(doc(db, `users/${userId}`));

        const friends = data
          .data()
          .friends.filter((friend) => friend.id !== userId);
        const friends1 = data1
          .data()
          .friends.filter((friend) => friend.id !== userCtx.id);

        transaction.update(doc(db, `users/${userCtx.id}`), {
          friends: friends,
        });
        transaction.update(doc(db, `users/${userId}`), {
          friends: friends1,
        });
      });
    } catch (e) {
      Alert.alert("Error", t("Error message"));
      console.log(e);
    }
  }

  useEffect(() => {
    async function fetchFooter() {
      if (description === undefined || description === "") {
        setShowDesc(false);
      } else if (description.length > 36) {
        setDesc(description.substring(0, 36));
        setIsVisibleMore(true);
      }
      setLikeNum(likesNum);
      setCommentNum(commentsNum);
      if (likes.filter((like) => like.id === userCtx.id).length !== 0) {
        setIsLiked(true);
      }
    }
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
    async function fetchPostImage() {
      try {
        const url = await getDownloadURL(ref(storage, `posts/${id}/photo.jpg`));
        setPostImage(url);
      } catch (e) {
        if (e.code === "storage/object-not-found") {
          try {
            const url = await getDownloadURL(
              ref(storage, `posts/defaultPhoto.jpg`)
            );

            setPostImage(url);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
    function fetchTime() {
      const creationDate = createDate?.toDate();
      const timeDifference =
        (new Date().getTime() - creationDate?.getTime()) / 1000;
      if (isNaN(timeDifference)) {
        setTime("");
        return;
      }
      if (timeDifference < 60) {
        setTime(t("just now"));
      } else if (timeDifference >= 60 && timeDifference / 60 < 60) {
        const mins = Math.floor(timeDifference / 60);
        if (mins === 1) {
          setTime(t(`minute ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`minute ago`, { postProcess: "interval", count: mins }));
        }
      } else if (timeDifference / 60 >= 60 && timeDifference / (60 * 60) < 24) {
        const hours = Math.floor(timeDifference / (60 * 60));
        if (hours === 1) {
          setTime(t(`hour ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`hour ago`, { postProcess: "interval", count: hours }));
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
        setTime(t(`days ago`, { postProcess: "interval", count: days }));
      } else if (
        timeDifference / (60 * 60 * 24) >= 7 &&
        timeDifference / (60 * 60 * 24) < 30
      ) {
        const weeks = Math.floor(timeDifference / (60 * 60 * 24 * 7));
        if (weeks === 1) {
          setTime(t(`week ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`week ago`, { postProcess: "interval", count: weeks }));
        }
      } else if (
        timeDifference / (60 * 60 * 24) >= 30 &&
        timeDifference / (60 * 60 * 24) < 365
      ) {
        const months = Math.floor(timeDifference / (60 * 60 * 24 * 30));
        if (months === 1) {
          setTime(t(`month ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`month ago`, { postProcess: "interval", count: months }));
        }
      } else {
        const years = Math.floor(timeDifference / (60 * 60 * 24 * 365));
        if (years === 1) {
          setTime(t(`year ago`, { postProcess: "interval", count: 1 }));
        } else {
          setTime(t(`year ago`, { postProcess: "interval", count: years }));
        }
      }
    }
    fetchTime();
    fetchPostImage();
    fetchPhoto();
    fetchFooter();
    fetchIsRemove();
  }, []);

  function viewProfileHandler() {
    if (navigation.getParent()) {
      navigation.getParent().navigate("friend-profile", { id: userId });
    }
  }

  async function likeHandler() {
    if (!isLiked) {
      setLikeNum((prev) => prev + 1);
      await updateDoc(doc(db, `posts/${id}`), {
        likesNum: increment(1),
        likes: arrayUnion({
          id: userCtx.id,
          name: userCtx.name,
          photoUrl: userCtx.photoUrl,
        }),
      });
    } else {
      setLikeNum((prev) => prev - 1);
      await updateDoc(doc(db, `posts/${id}`), {
        likesNum: increment(-1),
        likes: arrayRemove({
          id: userCtx.id,
          name: userCtx.name,
          photoUrl: userCtx.photoUrl,
        }),
      });
    }
    setIsLiked((prev) => !prev);
  }
  function commentHandler() {
    if (!navigation.getParent()) {
      navigation.navigate("comment", { id: id, userId: userId });
    } else {
      navigation.getParent().navigate("comment", { id: id, userId: userId });
    }
  }

  function shareHandler() {
    onShare();
  }

  function showMoreHandler() {
    if (showMore === t("Show more")) {
      setDesc(description);
      setShowMore(t("Show less"));
    } else {
      setDesc(description.substring(0, 36).concat("..."));
      setShowMore(t("Show more"));
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Pressable onPress={viewProfileHandler}>
          <View style={styles.left}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.name}>{name}</Text>
          </View>
        </Pressable>
        <View style={styles.right}>
          <Menu>
            <MenuTrigger>
              <Entypo name="dots-three-vertical" size={30} color="white" />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: styles.info,
                optionText: styles.infoText,
                optionsWrapper: styles.infoWraper,
              }}
            >
              {navigation.getParent() && (
                <>
                  <MenuOption
                    onSelect={viewProfileHandler}
                    text={t("View profile")}
                  />
                  <Divider />
                </>
              )}
              {isRemove && (
                <MenuOption
                  onSelect={removeFriendHandler}
                  text={t("Remove friend")}
                />
              )}
            </MenuOptions>
          </Menu>
        </View>
      </View>
      <View style={styles.content}>
        <Image style={styles.postImage} source={{ uri: postImage }} />
      </View>
      <View style={styles.footer}>
        <View style={styles.topFooter}>
          <View style={styles.footerNumContainer}>
            <Pressable onPress={likeHandler}>
              <AntDesign
                name={!isLiked ? "hearto" : "heart"}
                size={32}
                color="white"
              />
            </Pressable>
            <Pressable>
              <Text style={styles.footerNum}>{likeNum}</Text>
            </Pressable>
          </View>
          <View style={styles.footerNumContainer}>
            <Pressable onPress={commentHandler}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={32}
                color="white"
              />
            </Pressable>
            <Pressable onPress={commentHandler}>
              <Text style={styles.footerNum}>{commentNum}</Text>
            </Pressable>
          </View>
          <View style={styles.footerContainer}>
            <Pressable onPress={shareHandler}>
              <Feather name="share" size={32} color="white" />
            </Pressable>
          </View>
        </View>
        {showDesc && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{desc}</Text>
            {isVisibleMore && (
              <Pressable onPress={showMoreHandler}>
                <Text
                  style={[
                    styles.descriptionText,
                    { color: Colors.primary100_30 },
                  ]}
                >
                  {t(showMore)}
                </Text>
              </Pressable>
            )}
          </View>
        )}
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </View>
  );
}

export default Post;

const styles = StyleSheet.create({
  root: {
    width: "86%",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 12,
    zIndex: 2,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    backgroundColor: Colors.primary400,
    borderRadius: 20,
    alignItems: "flex-end",
  },
  footer: {
    borderRadius: 25,
    backgroundColor: Colors.accent500_80,
    paddingVertical: 10,
  },
  topFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  descriptionContainer: {
    marginTop: 10,
    marginHorizontal: 20,
  },
  descriptionText: {
    color: Colors.primary100,
    fontSize: 16,
    fontWeight: "600",
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
  footerNum: {
    color: Colors.primary100,
    fontSize: 25,
    fontWeight: "bold",
  },
  footerNumContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "33%",
    marginLeft: 20,
  },
  footerContainer: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  postImage: {
    height: 200,
    width: "100%",
    borderRadius: 20,
  },
  timeText: {
    marginTop: 10,
    marginLeft: 25,
    color: Colors.primary100_30,
    fontSize: 10,
    fontWeight: "600",
  },
});
