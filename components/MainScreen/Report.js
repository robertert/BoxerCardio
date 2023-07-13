import { View, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
function Report() {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  function backHandler() {
    navigation.goBack();
  }

  return (
    <View style={styles.root}>
    <Pressable onPress={backHandler}>
      <View style={styles.back}></View>
    </Pressable>
    

    </View>
  );
}

export default Report;

const styles = StyleSheet.create({
  back: {
    marginTop: 100,
    height: 30,
    width: 100,
    backgroundColor: "black",
  },
});
