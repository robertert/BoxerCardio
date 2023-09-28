import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useContext } from "react";
import { UserContext } from "../../../store/user-context";

function TrainingGroupSettings() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const userCtx = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({});

  async function saveSettingsHandler() {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, `users/${userCtx.id}`), {
        settings: settings,
      });
    } catch (e) {
      console.log(e);
    }
  }
  function goBackHandler() {
    navigation.goBack();
  }
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={goBackHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
      </View>
      <Pressable></Pressable>
    </View>
  );
}

export default TrainingGroupSettings;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    alignItems: "center",
  },
  header: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
});
