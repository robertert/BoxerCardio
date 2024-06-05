import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { auth } from "../firebaseConfig";
import Header from "../components/UI/Header";
import Colors from "../constants/colors";
import Post from "../components/MainScreen/Post";
import { FlashList } from "@shopify/flash-list";
import { db } from "../firebaseConfig";
import { BottomSheet } from "@rneui/themed";
import {
  collection,
  getDocs,
  limit,
  startAfter,
  orderBy,
  query,
  getDoc,
  doc,
  where,
} from "firebase/firestore";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Share from "../components/MainScreen/Share";
import GestureRecognizer from "react-native-swipe-gestures";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { UserContext } from "../store/user-context";

function MainScreen({ navigation, route }) {
  //  przy ponownym nacisnieciu scroll to the top //////////////////////////////////////////
  const ref = useRef();
  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", (e) => {
      e.preventDefault();
      if (ref.current) {
        ref.current.scrollToIndex({ animated: true, index: 0 });
      }
    });
    return unsubscribe;
  }, [navigation]);

  /////// HOOKS AND INITIALIZATION ///////////////////////////////////////////////////////

  const [footer, setFooter] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isErrorRender, setIsErrorRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState();
  const [posts, setPosts] = useState([]);
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [index, setIndex] = useState(0);

  const { t } = useTranslation();

  const userCtx = useContext(UserContext);

  const id = route.params.id;

  ////// ALL HANDLERS ////////////////////////////////////////////////////////////////////

  function shareHandler() {
    setFooter(true);
    //animate showing
  }
  function closeShareHandler() {
    setFooter(false);
    //animate disapearing
  }
  function renderListHandler(itemData) {
    const item = itemData.item;
    return (
      <Post
        createDate={item.createdAt}
        description={item.description}
        likes={item.likes}
        likesNum={item.likesNum}
        commentsNum={item.commentsNum}
        userId={item.userId}
        name={item.userName}
        onShare={shareHandler}
        id={item.id}
      />
    );
  }

  ////// FETCHING POSTS ///////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    initialFetchPosts();
  }, []);

  async function initialFetchPosts() {
    setLastDoc({});
    setIsFirstLoading(true);
    try {
      let prePosts = [];
      const data = await getDoc(doc(db, `users/${id}`));
      const friends = data.data()?.friends;
      const date3DaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000);
      for (const friend of friends) {
        const friendData = await getDocs(
          query(
            collection(db, `users/${friend.id}/posts`)
            //where("createdAt", ">", date3DaysAgo)
          )
        );
        prePosts.push(
          ...friendData.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          })
        );
      }
      const userData = await getDocs(
        query(
          collection(db, `users/${id}/posts`)
          //where("createdAt", ">", date3DaysAgo)
        )
      );
      prePosts.push(
        ...userData.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        })
      );
      prePosts.sort((item1, item2) => {
        return item2.createdAt - item1.createdAt;
      }),
      setAllPosts(prePosts);
      let current = [];
      for (let i = 0; i < 5; i++) {
        current.push(prePosts[i]);
      }
      setPosts(current);
      setIndex(4);
      setIsFirstLoading(false);
      /*
      const posts = await getDocs(
        query(collection(db, "posts"), orderBy("userName"), limit(10))
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
      setIsFirstLoading(false);
      setPosts([...readyPosts]);
      */
    } catch (e) {
      console.log(e);
      setIsErrorRender(true);
    }
  }

  async function loadNextPage() {
    let current = [];
    for (let i = index + 1; i < index + 6; i++) {
      if (i <= allPosts.length - 1) {
        current.push(allPosts[i]);
      }
    }
    setPosts((prev) => [...prev, ...current]);
    setIndex((prev) => prev + 5);
    /*
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
      } catch (error) {
        console.log(error);
        setIsErrorRender(true);
      }
    }
    */
  }

  useFocusEffect(
    useCallback(() => {
      if (userCtx.mainPageRender) {
        initialFetchPosts();
      }
      userCtx.changeMain(false);
    }, [userCtx.mainPageRender])
  );

  ///////////////////////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.root}>
      <Header settings={true} back={false} />
      {!isFirstLoading ? (
        <FlatList
          ref={ref}
          extraData={posts}
          data={posts}
          renderItem={renderListHandler}
          keyExtractor={(item) => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={loadNextPage}
          refreshing={refresh}
          onRefresh={async () => {
            try {
              setIsErrorRender(false);
              setRefresh(true);
              setPosts([]);
              initialFetchPosts();
              setRefresh(false);
            } catch (e) {
              console.log(e);
              setIsErrorRender(true);
            }
          }}
          ListEmptyComponent={
            <Text style={styles.errorText}>
              {t("You don't have any posts to see yet.")}
            </Text>
          }
          ListFooterComponent={
            !isErrorRender ? (
              isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={Colors.accent500}
                  style={styles.loading}
                />
              ) : (
                <View style={styles.footerContainer}>
                  <Text style={styles.footerTextTitle}>{t("That's all")}</Text>
                  <Text style={styles.footerText}>
                    {t("You've seen all the posts from last 3 days.")}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.footerContainer}>
                <Text style={styles.footerTextTitle}>Error</Text>
                <Text style={styles.footerText}>{t("Error message")}</Text>
              </View>
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
      <GestureRecognizer onSwipeDown={closeShareHandler}>
        <BottomSheet isVisible={footer} scrollViewProps={{ bounces: false }}>
          <Share />
        </BottomSheet>
      </GestureRecognizer>
    </View>
  );
}

export default MainScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
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
