import { View, Text, StyleSheet, FlatList } from "react-native";
import { auth } from "../firebaseConfig";
import Header from "../components/UI/Header";
import Colors from "../constants/colors";
import { DUMMY_LIST } from "../constants/colors";
import Post from "../components/Post";

function MainScreen() {
  async function handler() {
    await auth.signOut();
  }

  function renderListHandler(itemData) {
    return <Post name={itemData.item.name} />;
  }

  return (
    <View style={styles.root}>
      <Header settings={true} back={false} />
      <FlatList
        data={DUMMY_LIST}
        renderItem={renderListHandler}
        keyExtractor={(item) => item.id}
      />
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
