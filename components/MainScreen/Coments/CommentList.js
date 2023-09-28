import Comment from "./Comment";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../../../constants/colors";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

let responses = [];
let parentIdd, grandparentId;

function CommentList({ postId, parentId, id, onHide, onReply, level }) {
  const [isLoading, setIsLoading] = useState(true);
  //console.log(level);
  function answerHideHandler() {
    onHide();
  }

  async function fetchRes() {
    let docPath;
    setIsLoading(true);
    docPath = `posts/${postId}/comments/${id}/responses`;
    const responsesFeched = await getDocs(collection(db, docPath));
    responsesFeched.forEach((res) => {
      responses.push({ id: res.id, ...res.data() });
    });
    //console.log(responses);
    setIsLoading(false);
    return responses;
  }

  useEffect(() => {
    responses = [];
    fetchRes();
    parentIdd = id;
    grandparentId = "";
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        responses.map((item) => {
          return (
            <Comment
              userId={item.userId}
              postId={postId}
              name={item.name}
              content={item.content}
              onReply={onReply}
              areResponses={item.areResponses}
              createDate={item.createDate}
              level={level}
              id={item.id}
              key={item.id}
              photoUrl={item.photoUrl}
              parentId={parentIdd}
              grandparentId={grandparentId}
            />
          );
        })
      )}
      <Pressable onPress={answerHideHandler}>
        <Text style={styles.footerText}>Hide answers</Text>
      </Pressable>
    </View>
  );
}

export default CommentList;

const styles = StyleSheet.create({
  footerText: {
    color: Colors.primary100_30,
    fontSize: 10,
    marginRight: 20,
    marginLeft: 30,
    marginTop: 10,
  },
});
