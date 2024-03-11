import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import Colors from "../../constants/colors";
import { FlashList } from "@shopify/flash-list";
import PostDisplay from "./PostDisplay";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../store/user-context";


function PostsDisplay({userId}) {

  const [posts,setPosts] = useState([]);

  const userCtx = useContext(UserContext);

  async function fetchPosts() {
    const data = await getDoc(doc(db, `users/${userId}`));
    const postsPreview = data.data().postsPreview;
    setPosts(postsPreview);
  }

  useEffect(()=>{
    fetchPosts();
  },[])

  function renderPostHandler(itemData) {
    console.log(item);
    const item = itemData.item;
    return <PostDisplay id={item} userId={userId} />;
  }

  return (
    <View style={styles.root}>
      <FlashList
        data={posts}
        renderItem={renderPostHandler}
        keyExtractor={(item) => item}
        estimatedItemSize={100}
      />
    </View>
  );
}

export default PostsDisplay;

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flex: 1,
    backgroundColor: Colors.primary700,
  },
});
