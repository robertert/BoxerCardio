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
} from "firebase/firestore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { Keyboard } from "react-native";
import { Alert } from "react-native";

let last = undefined;
const LIMIT = 10;

function Divider() {
  return <View style={styles.divider}></View>;
}

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
  const [comment, setComment] = useState("");

  const id = route.params.id;

  const userCtx = useContext(UserContext);

  useEffect(() => {
    last = undefined;
  }, []);

  ////// ALL HANDLERS ////////////////////////////////////////////////////////////////////

  function backHandler() {
    navigation.goBack();
  }

  function commentChangeHandler(enteredComment) {
    setComment(enteredComment);
  }

  async function submitCommentHandler() {
    if (comment.trim().length < 100) {      // GÓRNY LIMIT DŁUGOŚCI KOMENTARZY
      if (comment.trim().length > 5) {      // DOLNY LIMIT DŁUGOŚCI KOMENTARZY
        setComment("");
        setFirstLoading(true);
        if (replying) {
          if (replyPerson.parentId === "") {
            try {
              await addDoc(
                collection(
                  db,
                  `posts/${id}/comments/${replyPerson.id}/responses`
                ),
                {
                  name: userCtx.name,
                  photoUrl: userCtx.photoUrl,
                  content: comment,
                  createDate: new Date(),
                  areResponses: false,
                }
              );
              await updateDoc(
                doc(db, `posts/${id}/comments/${replyPerson.id}`),
                {
                  areResponses: true,
                }
              );
            } catch (e) {
              console.log(e);
            }
          } else {
            try {
              await addDoc(
                collection(
                  db,
                  `posts/${id}/comments/${replyPerson.parentId}/responses/${replyPerson.id}/responses`
                ),
                {
                  name: userCtx.name,
                  photoUrl: userCtx.photoUrl,
                  content: comment,
                  createDate: new Date(),
                  areResponses: false,
                }
              );
              await updateDoc(
                doc(
                  db,
                  `posts/${id}/comments/${replyPerson.parentId}/responses/${replyPerson.id}`
                ),
                {
                  areResponses: true,
                }
              );
            } catch (e) {
              console.log(e);
            }
          }
        } else {
          try {
            await addDoc(collection(db, `posts/${id}/comments`), {
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
        last = 1;
        await refetch();
        setFirstLoading(false);
        setReplying(false);
        Keyboard.dismiss();
      } else {
        alert("Your comment must have at least 5 characters");
      }
    } else {
      alert("Your comment can't have more that 105 characters")
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
    return (
      <Comment
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

  ///////  FETCHING COMMENTS  ///////////////////////////////////////////////////////////////////////////////

  async function fetchComments() {
    try {
      const comments = await getDocs(
        query(
          collection(db, `posts/${id}/comments`),
          orderBy("name"),
          startAfter(last ? last : 1),
          limit(10) //   ZMIENIĆ POŹNIEJ NA DOBRZE i setERRROT TEŻ  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        )
      );

      last = comments.docs[comments.docs.length - 1];
      let readyComments = [];

      comments.forEach((comment) => {
        //console.log(comment);
        readyComments.push({ id: comment.id, ...comment.data() });
      });
      //console.log(readyComments);
      setFirstLoading(false);
      return readyComments;
    } catch (error) {
      console.log(error);
      setIsErrorRender(false); //////// ZMIENIĆ POŹŃEJ
      return [];
    }
  }

  async function loadNextPage() {
    if (hasNextPage) {
      console.log("LOADING COM");
      setIsLoading(true);
      await fetchNextPage();
      setIsLoading(false);
    }
  }

  const { refetch, data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["comments"],
    queryFn: ({ pageParam = 1 }) => {
      return fetchComments(pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.length === LIMIT ? 1 : undefined;
      return nextPage;
    },
  });

  const flattenData = data?.pages.flat();

  //console.log(flattenData);

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
            source={require("../../assets/icon.png")}
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
            <MenuOption onSelect={() => alert("fasdfas")} text="Report" />
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
              data={flattenData}
              renderItem={renderCommentHandler}
              keyExtractor={(item) => item.id}
              onEndReached={loadNextPage}
              onEndReachedThreshold={0.5}
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
  divider: {
    backgroundColor: Colors.primary100_30,
    width: "100%",
    height: 1,
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