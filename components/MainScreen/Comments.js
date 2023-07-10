import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator
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
import { useEffect, useRef } from "react";
import { useState } from "react";
import {
  collection,
  getDocs,
  limit,
  startAfter,
  orderBy,
  query,
  addDoc,
} from "firebase/firestore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "../../firebaseConfig";


let last;
const LIMIT = 10;

function Divider() {
  return <View style={styles.divider}></View>;
}

function Comments({ route }) {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const commentInputRef = useRef();

  // Checking if keyboard is shown and the size of it
  const keyboard = useKeyboard();

  const [replying, setReplying] = useState(false);
  const [replyPerson, setRelplyPerson] = useState();
  const [isEmpty, setIsEmpty] = useState(false);
  const [isErrorRender, setIsErrorRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const id = route.params.id;

  function backHandler() {
    navigation.goBack();
  }

  function replyHandler(id, name) {
    commentInputRef.current.focus();
    setReplying(true);
    setRelplyPerson(name);
  }

  function replyCloseHandler() {
    setReplying(false);
  }

  function renderCommentHandler(itemData) {
    const item = itemData.item;
    return (
      <Comment
        name={item.name}
        content={item.content}
        responses={item.responses}
        onReply={replyHandler}
        level={1}
      />
    );
  }

  //
  //
  //fetching comments
  //
  //

  

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
      if (comments.empty && flattenData?.length === 0) {
        setIsEmpty(true);
      } else {
        setIsEmpty(false);
      }

      comments.forEach((comment) => {
        //console.log(comment);
        readyComments.push({ id: comment.id, ...comment.data() });
      });
      //console.log(readyComments);
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

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
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
      <View style={styles.postPreview}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.postImg}
        />
      </View>
      <Divider />
      <View
        style={[styles.listContainer, keyboard.keyboardShown && { flex: 3 }]}
      >
        {!isErrorRender ? (<FlatList
          data={flattenData}
          renderItem={renderCommentHandler}
          keyExtractor={(item) => item.id}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.errorText}>
              You don't have any posts to see yet.
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
      )}
      </View>
      {replying && (
        <View style={styles.replying}>
          <Text style={styles.replyingText}>Replying to {replyPerson}</Text>
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
        />
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
    height: 40,
    backgroundColor: Colors.primary400,
    marginHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  input: {
    color: Colors.primary100,
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
