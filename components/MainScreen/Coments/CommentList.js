import Comment from "./Comment";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../../../constants/colors";

function CommentList({ responses, onHide }) {
  function answerHideHandler() {
    onHide();
  }

  return (
    <View style={{ flex: 1 }}>
      {responses.map((item) => {
        return (
          <Comment name={item.name} content={item.content} responses={item.responses} />
        );
      })}
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
