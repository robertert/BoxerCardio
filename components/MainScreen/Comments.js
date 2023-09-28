import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import Colors, { DUMMY_COMENTS } from "../../constants/colors";
import Comment from "./Coments/Comment";
import { useKeyboard } from "@react-native-community/hooks";
import { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import {
  collection,
  getDocs,
  limit,
  startAfter,
  orderBy,
  query,
  addDoc,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { Keyboard } from "react-native";
import Divider from "../UI/Divider";
import { getDownloadURL, ref } from "firebase/storage";

const LIMIT = 10;

function Comments({ route }) {
  /////// HOOKS AND INITIALIZATION ///////////////////////////////////////////////////////

  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const commentInputRef = useRef();

  const keyboard = useKeyboard();

  const [replying, setReplying] = useState(false);
  const [replyPerson, setRelplyPerson] = useState({
    name: "",
    id: "",
    parentId: "",
  });
  const [isErrorRender, setIsErrorRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoading, setFirstLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState();
  const [comment, setComment] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [commentData, setCommentData] = useState([]);
  const [isNextPage, setIsNextPage] = useState(false);
  const [image,setImage] = useState();

  const id = route.params.id;
  const userId = route.params.userId;

  const userCtx = useContext(UserContext);

  ////// ALL HANDLERS ////////////////////////////////////////////////////////////////////

  function backHandler() {
    navigation.goBack();
  }

  function commentChangeHandler(enteredComment) {
    setComment(enteredComment);
  }

  function viewProfileHandler() {
    navigation.navigate("friend-profile", { id: userId });
  }

  async function submitCommentHandler() {
    if (comment.trim().length < 100) {
      // GÓRNY LIMIT DŁUGOŚCI KOMENTARZY
      if (comment.trim().length > 0) {
        // DOLNY LIMIT DŁUGOŚCI KOMENTARZY
        setComment("");
        await updateDoc(doc(db, `posts/${id}`), {
          commentsNum: increment(1),
        });
        if (replying) {
          if (replyPerson.parentId === "") {
            try {
              await Promise.all([
                addDoc(
                  collection(
                    db,
                    `posts/${id}/comments/${replyPerson.id}/responses`
                  ),
                  {
                    userId: userCtx.id,
                    name: userCtx.name,
                    photoUrl: userCtx.photoUrl,
                    content: comment,
                    createDate: new Date(),
                    areResponses: false,
                  }
                ),
                updateDoc(doc(db, `posts/${id}/comments/${replyPerson.id}`), {
                  areResponses: true,
                }),
              ]);
            } catch (e) {
              console.log(e);
            }
          } else {
            try {
              await Promise.all([
                updateDoc(
                  doc(
                    db,
                    `posts/${id}/comments/${replyPerson.parentId}/responses/${replyPerson.id}`
                  ),
                  {
                    areResponses: true,
                  }
                ),
                addDoc(
                  collection(
                    db,
                    `posts/${id}/comments/${replyPerson.parentId}/responses/${replyPerson.id}/responses`
                  ),
                  {
                    userId: userCtx.id,
                    name: userCtx.name,
                    photoUrl: userCtx.photoUrl,
                    content: comment,
                    createDate: new Date(),
                    areResponses: false,
                  }
                ),
              ]);
            } catch (e) {
              console.log(e);
            }
          }
        } else {
          try {
            await addDoc(collection(db, `posts/${id}/comments`), {
              userId: userCtx.id,
              name: userCtx.name,
              photoUrl: userCtx.photoUrl,
              content: comment,
              createDate: new Date(),
              areResponses: false,
            });
          } catch (e) {
            console.log(e);
          }
        }
        setFirstLoading(true);
        setCommentData([]);
        await initialFetch();
        setFirstLoading(false);
        setReplying(false);
        Keyboard.dismiss();
      } else {
        alert("Your comment must have at least 1 characters");
      }
    } else {
      alert("Your comment can't have more that 105 characters");
    }
  }

  function replyHandler({ id, name }, parentId) {
    commentInputRef.current.focus();
    setComment(`@${name} `);
    setReplying(true);
    setRelplyPerson({ name: name, id: id, parentId: parentId });
  }

  function replyCloseHandler() {
    setReplying(false);
  }

  function renderCommentHandler(itemData) {
    const item = itemData.item;
    //console.log(item.areResponses);
    return (
      <Comment
        userId={item.userId}
        postId={id}
        name={item.name}
        content={item.content}
        areResponses={item.areResponses}
        createDate={item.createDate}
        onReply={replyHandler}
        level={1}
        photoUrl={item.photoUrl}
        id={item.id}
        key={item.id}
        parentId=""
        grandparentId=""
      />
    );
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

  ///////  FETCHING COMMENTS  ///////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    initialFetch();
    fetchPhoto();
  }, []);

  async function initialFetch() {
    try {
      const comments = await getDocs(
        query(
          collection(db, `posts/${id}/comments`),
          orderBy("name"),
          limit(10) //   ZMIENIĆ POŹNIEJ NA DOBRZE i setERRROT TEŻ  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        )
      );

      const lastD = comments.docs[comments.docs.length - 1];
      setLastDoc(lastD);

      let readyComments = [];
      comments.forEach((comment) => {
        //console.log(comment.data().areResponses);
        readyComments.push({ id: comment.id, ...comment.data() });
      });
      //console.log(readyComments);
      setFirstLoading(false);

      if (readyComments.length === 10) {
        setIsNextPage(true);
      } else {
        setIsNextPage(false);
      }

      setCommentData([...readyComments]);

      return true;
    } catch (error) {
      console.log(error);
      setIsErrorRender(false); //////// ZMIENIĆ POŹŃEJ
      return [];
    }
  }

  async function nextFetch() {
    if (isNextPage) {
      setIsLoading(true);
      try {
        const comments = await getDocs(
          query(
            collection(db, `posts/${id}/comments`),
            orderBy("name"),
            startAfter(lastDoc),
            limit(10) //   ZMIENIĆ POŹNIEJ NA DOBRZE i setERRROT TEŻ  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          )
        );

        const lastD = comments.docs[comments.docs.length - 1];
        setLastDoc(lastD);

        let readyComments = [];

        comments.forEach((comment) => {
          readyComments.push({ id: comment.id, ...comment.data() });
        });

        setIsLoading(false);
        if (readyComments.length === 10) {
          setIsNextPage(true);
        } else {
          setIsNextPage(false);
        }

        setCommentData((prev) => [...prev, ...readyComments]);

        return true;
      } catch (error) {
        console.log(error);
        setIsErrorRender(true); //////// ZMIENIĆ POŹŃEJ
        return [];
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////

  return (
    <View
      style={[
        styles.root,
        keyboard.keyboardShown &&
          Platform.OS === "ios" && { paddingBottom: keyboard.keyboardHeight },
      ]}
    >
      <View style={[styles.top, { marginTop: insets.top + 10 }]}>
        <Pressable onPress={backHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
        <View style={styles.user}>
          <Image
            source={{uri: image}}
            style={styles.userImage}
          />
          <Text style={styles.userName}>Mankowska</Text>
        </View>
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
      {!Keyboard.isVisible() && (
        <View style={styles.postPreview}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.postImg}
          />
        </View>
      )}
      <Divider />
      <View
        style={[styles.listContainer, keyboard.keyboardShown && { flex: 3 }]}
      >
        {!isFirstLoading ? (
          !isErrorRender ? (
            <FlatList
              extraData={commentData}
              data={commentData}
              renderItem={renderCommentHandler}
              keyExtractor={(item) => item.id}
              onEndReached={nextFetch}
              onEndReachedThreshold={0.5}
              refreshing={refresh}
              onRefresh={async () => {
                try {
                  setIsErrorRender(false);
                  setCommentData([]);
                  setFirstLoading(true);
                  await initialFetch();
                  setFirstLoading(false);
                  setRefresh(false);
                } catch (e) {
                  setIsErrorRender(true);
                  console.log(e);
                }
              }}
              ListEmptyComponent={
                <Text style={styles.errorText}>
                  There aren't any comments yet. Be the first to comment!
                </Text>
              }
              ListFooterComponent={
                isLoading && (
                  <ActivityIndicator
                    size="large"
                    color={Colors.accent500}
                    style={styles.loading}
                  />
                )
              }
            />
          ) : (
            <View style={styles.footerContainer}>
              <Text style={styles.footerTextTitle}>Error</Text>
              <Text style={styles.footerText}>
                There was an error while loading. Please check your internet
                conection or try again later.
              </Text>
            </View>
          )
        ) : (
          <ActivityIndicator
            size="large"
            color={Colors.accent500}
            style={styles.loading}
          />
        )}
      </View>
      {replying && (
        <View style={styles.replying}>
          <Text style={styles.replyingText}>
            Replying to {replyPerson.name}
          </Text>
          <Pressable onPress={replyCloseHandler}>
            <AntDesign name="close" size={24} color="white" />
          </Pressable>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            marginBottom:
              Platform.OS === "android" ? insets.bottom + 16 : insets.bottom,
          },
        ]}
      >
        <TextInput
          ref={commentInputRef}
          style={styles.input}
          placeholder="Add your comment here"
          value={comment}
          onChangeText={commentChangeHandler}
          multiline={true}
        />
        <Pressable onPress={submitCommentHandler}>
          <Text style={styles.submitText}>Publish</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default Comments;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    flexDirection: "column",
    marginBottom: 0,
  },
  top: {
    flex: 1,
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  user: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    marginHorizontal: 10,
    color: Colors.primary100,
    fontSize: 23,
  },

  userImage: {
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
  postPreview: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  postImg: {
    height: 120,
    width: 200,
    borderRadius: 20,
  },
  listContainer: {
    flex: 8,
    marginTop: 30,
    marginHorizontal: 15,
  },
  inputContainer: {
    backgroundColor: Colors.primary400,
    marginHorizontal: 20,
    borderRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 10,
    minHeight: 40,
    maxHeight: 70,
    paddingVertical: 10,
  },
  input: {
    width: "75%",
    color: Colors.primary100,
  },
  submitText: {
    color: Colors.accent500,
    fontSize: 15,
    fontWeight: "bold",
  },
  replying: {
    height: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary500,
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  replyingText: {
    color: Colors.primary100_30,
  },
  errorText: {
    marginVertical: 20,
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 25,
    marginTop: "50%",
  },
  footerContainer: {
    height: 200,
    width: "100%",
    flexDirection: "column",
    padding: 25,
    marginTop: "5%",
  },
  footerText: {
    color: Colors.primary100,
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    marginHorizontal: "10%",
  },
  footerTextTitle: {
    color: Colors.primary100,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },
  loading: {
    marginTop: 30,
  },
});
