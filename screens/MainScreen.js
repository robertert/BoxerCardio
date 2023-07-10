import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { auth } from "../firebaseConfig";
import Header from "../components/UI/Header";
import Colors, { DUMMY_LIST } from "../constants/colors";
import Post from "../components/MainScreen/Post";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "../firebaseConfig";
import { BottomSheet } from "@rneui/themed";
import {
  collection,
  getDocs,
  limit,
  startAfter,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import Share from "../components/MainScreen/Share";
import GestureRecognizer from "react-native-swipe-gestures";
const LIMIT = 10;
let last; 
function MainScreen({ navigation }) {
  //przy ponownym nacisnieciu scroll to the top
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

  const [footer, setFooter] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isErrorRender, setIsErrorRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  async function handler() {
    await auth.signOut();
  }

  function shareHandler() {
    setFooter(true);
    //animate showing
  }
  function closeShareHandler() {
    setFooter(false);
    //animate disapearing
  }

  function renderListHandler(itemData) {
    return (
      <Post
        name={itemData.item.userName}
        onShare={shareHandler}
        id={itemData.item.id}
      />
    );
  }

  async function fetchPosts(pageParam) {
    try {
      const posts = await getDocs(
        query(
          collection(db, "posts"),
          orderBy("userName"),
          startAfter(last ? last : 1),
          limit(10) //   ZMIENIĆ POŹNIEJ NA DOBRZE i setERRROT TEŻ  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        )
      );
      last = posts.docs[posts.docs.length - 1];
      //console.log(last);
      let readyPosts = [];
      if (posts.empty && flattenData?.length === 0) {
        setIsEmpty(true);
      } else {
        setIsEmpty(false);
      }

      posts.forEach((post) => {
        readyPosts.push({ id: post.id, ...post.data() });
      });
      //console.log(readyPosts);
      return readyPosts;
    } catch (error) {
      console.log(error);
      setIsErrorRender(false); //////// ZMIENIĆ POŹŃEJ
      return [];
    }
  }

  async function loadNextPage() {
    if (hasNextPage) {
      console.log("LOADING");
      setIsLoading(true);
      await fetchNextPage();
      setIsLoading(false);
    }
  }

  const { data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
    queryKey: ["main-page"],
    queryFn: ({ pageParam = 1 }) => {
      return fetchPosts(pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.length === LIMIT ? last : undefined;
      return nextPage;
    },
  });

  const flattenData = data?.pages.flat();
  //console.log(flattenData);

  return (
    <View style={styles.root}>
      <Header settings={true} back={false} />
      {!isErrorRender ? (
        <FlashList
          ref={ref}
          data={flattenData}
          renderItem={renderListHandler}
          keyExtractor={(item) => item.id}
          estimatedItemSize={330}
          onEndReachedThreshold={0.5}
          onEndReached={loadNextPage}
          refreshing={refresh}
          onRefresh={async () => {
            try {
              await refetch();
              setRefresh(false);
            } catch (e) {
              console.log(e);
            }
          }}
          ListEmptyComponent={
            <Text style={styles.errorText}>
              You don't have any posts to see yet.
            </Text>
          }
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator
                size="large"
                color={Colors.accent500}
                style={styles.loading}
              />
            ) : (
              !isEmpty && (
                <View style={styles.footerContainer}>
                  <Text style={styles.footerTextTitle}>That's all</Text>
                  <Text style={styles.footerText}>
                    You've seen all the posts from last 3 days.
                  </Text>
                </View>
              )
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
