import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import Colors from "../../constants/colors";
import { FlashList } from "@shopify/flash-list";
import PostDisplay from "./PostDisplay";

const DUMMY_POSTS = [
  {
    id: 1,
    miniatureUrl: "url",
    score: 12,
    mode: "3MIN",
    createdAt: new Date(),
  },
  {
    id: 2,
    miniatureUrl: "url",
    score: "1:25",
    mode: "100PUNCH",
    createdAt: new Date(),
  },
  {
    id: 3,
    miniatureUrl: "url",
    score: 114,
    mode: "FREESTYLE",
    createdAt: new Date(),
  },
];

function PostsDisplay() {

    function renderPostHandler(itemData){
        const item = itemData.item;
        return <PostDisplay id={item.id}/>
    }

  return (
    <View style={styles.root}>
      <FlashList
        data={DUMMY_POSTS}
        renderItem={renderPostHandler}
        keyExtractor={(item) => item.id}
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
