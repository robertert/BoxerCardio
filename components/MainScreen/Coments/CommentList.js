import Comment from "./Comment";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../../../constants/colors";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";

let responses = [];
let parentIdd, grandparentId;

function CommentList({ postId, parentId, id, onHide, onReply, level }) {
  const [isLoading, setIsLoading] = useState(true);
  //console.log(level);
  const {t} = useTranslation();

  function answerHideHandler() {
    onHide();
  }

  async function fetchRes() {
    let docPath;
    setIsLoading(true);
    docPath = `posts/${postId}/comments/${id}/responses`;
    const responsesFeched = await getDocs(
      query(collection(db, docPath), orderBy("createDate", "desc"))
    );
    responsesFeched.forEach((res) => {
      responses.push({ id: res.id, ...res.data() });
    });
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
              type={item.type}
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
        <Text style={styles.footerText}>{t("Hide answers")}</Text>
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
