import { View, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useContext, useEffect, useState } from "react";
import Colors from "../../constants/colors";
import Post from "../MainScreen/Post";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { useTranslation } from "react-i18next";


function PostsDisplayDetails({route}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const {t} = useTranslation();

  const id = route.params.id;

  const userCtx = useContext(UserContext);
  useEffect(() => {
    initialfetchPosts();
  }, []);

  async function initialfetchPosts() {
    setIsFirstLoading(true);
    try {
      const posts = await getDocs(
        query(
          collection(db, `users/${id}/posts`),
          orderBy("createdAt"),
          limit(10)
        )
      );

      let readyPosts = [];

      const lastD = posts.docs[posts.docs.length - 1];
      setLastDoc(lastD);

      posts.forEach((post) => {
        readyPosts.push({ id: post.id, ...post.data() });
      });
      if (readyPosts.length === 10) {
        setHasNextPage(true);
      } else {
        setHasNextPage(false);
      }
      setPosts(readyPosts);
      setIsFirstLoading(false);
    } catch (e) {
      console.log(e);
      setIsError(true);
    }
  }
  async function loadNextPage() {
    if (hasNextPage) {
      setIsLoading(true);
      try {
        const posts = await getDocs(
          query(
            collection(db, "posts"),
            orderBy("userName"),
            startAfter(lastDoc),
            limit(10)
          )
        );
        const lastD = posts.docs[posts.docs.length - 1];
        setLastDoc(lastD);

        let readyPosts = [];

        posts.forEach((post) => {
          readyPosts.push({ id: post.id, ...post.data() });
        });
        if (readyPosts.length === 10) {
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
        setIsLoading(false);
        setPosts((prev) => [...prev, ...readyPosts]);
      } catch (e) {
        console.log(e);
        setIsError(true);
      }
    }
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function shareHandler() {}

  function renderPostHandler(itemData) {
    const item = itemData.item;
    return (
      <Post
        createDate={item.createdAt}
        description={item.description}
        likes={item.likes}
        likesNum={item.likesNum}
        commentsNum={item.commentsNum}
        name={item.userName}
        userId={item.userId}
        onShare={shareHandler}
        id={item.id}
      />
    );
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={goBackHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
      </View>
      {!isFirstLoading ? (
        <FlashList
          extraData={posts}
          data={posts}
          renderItem={renderPostHandler}
          keyExtractor={(item) => item.id}
          estimatedItemSize={330}
          onEndReachedThreshold={0.5}
          onEndReached={loadNextPage}
          refreshing={refresh}
          onRefresh={async () => {
            setIsError(false);
            setRefresh(true);
            await initialfetchPosts();
            setRefresh(false);
          }}
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
        <ActivityIndicator
          size="large"
          color={Colors.accent500}
          style={styles.loading}
        />
      )}
    </View>
  );
}

export default PostsDisplayDetails;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  loading: {
    marginTop: 30,
  },
  header: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
});
