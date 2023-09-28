import { View, StyleSheet, Text, Image, Pressable } from "react-native";
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
} from "firebase/firestore";
import { UserContext } from "../../store/user-context";
import { useEffect } from "react";
import Divider from "../UI/Divider";
import { getDownloadURL, ref } from "firebase/storage";

function Post({ name, onShare, id, userId, likesNum, commentsNum, likes }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeNum, setLikeNum] = useState(0);
  const [commentNum, setCommentNum] = useState(0);
  const [image, setImage] = useState();
  const [postImage, setPostImage] = useState();

  const userCtx = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchNums() {
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
        console.log(e);
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
    fetchPostImage();
    fetchPhoto();
    fetchNums();
  }, []);

  function viewProfileHandler() {
    navigation.getParent().navigate("friend-profile", { id: userId });
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
    navigation.getParent().navigate("comment", { id: id, userId: userId });
  }

  function shareHandler() {
    onShare();
  }
  let test = "This is the description. This is the";
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
              <MenuOption onSelect={viewProfileHandler} text="View profile" />
              <Divider />
              <MenuOption
                onSelect={() => alert(`Removed friends`)}
                text="Remove friend"
              />
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
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}></Text>
        </View>
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
});
