import { View, Text, StyleSheet, FlatList } from "react-native";
import { auth } from "../firebaseConfig";
import Header from "../components/UI/Header";
import Colors, { DUMMY_LIST } from "../constants/colors";
import Post from "../components/Post";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "../firebaseConfig";
import { BottomSheet } from '@rneui/themed';
import {
  collection,
  getDocs,
  limit,
  startAfter,
  orderBy,
  query,
} from "firebase/firestore";
import { useState } from "react";
import Share from "../components/Share";
import { useNavigation } from "@react-navigation/native";
import GestureRecognizer from "react-native-swipe-gestures";


const LIMIT = 10;
let last;

function MainScreen() {
  const navigation = useNavigation();
  const [footer, setFooter] = useState(false);

  async function handler() {
    await auth.signOut();
  }

  function shareHandler() {
    setFooter(true);
    //animate showing
  }
  function closeShareHandler(){
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
    const posts = await getDocs(
      query(
        collection(db, "posts"),
        orderBy("userName"),
        startAfter(last ? last : 1),
        limit(0) //   ZMIENIĆ POŹNIEJ NA DOBRZE  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      )
    );
    last = posts.docs[posts.docs.length - 1];
    //console.log(last);
    let readyPosts = [];

    posts.forEach((post) => {
      readyPosts.push({ id: post.id, ...post.data() });
    });
    //console.log(readyPosts);
    return readyPosts;
  }

  function loadNextPage() {
    if (hasNextPage) {
      console.log("LOADING");
      fetchNextPage();
    }
  }

  const { data, fetchNextPage, isLoading, hasNextPage } = useInfiniteQuery({
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
      <FlashList
        data={DUMMY_LIST}
        renderItem={renderListHandler}
        keyExtractor={(item) => item.id}
        estimatedItemSize={330}
        onEndReachedThreshold={0.3}
        onEndReached={loadNextPage}
      />
      <GestureRecognizer onSwipeDown={closeShareHandler}>
      <BottomSheet isVisible={footer} scrollViewProps={{bounces: false, }} >
       <Share/>
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
});
