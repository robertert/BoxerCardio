import { View, StyleSheet, Text, Alert } from "react-native";
import Colors from "../../constants/colors";
import { Pressable } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import TrainingGroup from "./TrainingGroups/TrainingGroup";
import { Platform } from "react-native";
import { db, post } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../store/user-context";
import { getDoc, doc } from "firebase/firestore";
import { ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";

function TrainingGroups() {
  
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const userCtx = useContext(UserContext);

  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const {t} = useTranslation();

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setIsLoading(true);
    try {
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      setTeams(data.data().trainingGroups);
      setIsLoading(false);
    } catch (e) {
      Alert.alert("Error",t("Error message"));
      console.log(e);
    }
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function addHandler() {
    navigation.navigate("training-group-form");
  }


  function trainingGroupRenderHandler(itemData) {
    const item = itemData.item;
    //console.log(item.membersNum);
    return (
      <TrainingGroup
        name={item.name}
        rank={item.rank}
        membersNum={item.membersNum}
        photoUrl={item.photoUrl}
        id={item.id}
      />
    );
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 15 },
          Platform.OS === "ios" && { height: 80 + insets.top },
        ]}
      >
        <Pressable onPress={goBackHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
        <Text style={styles.headerText}>{t("Your training teams")}</Text>
        <Pressable onPress={addHandler}>
          <FontAwesome6 name="add" size={38} color="white" />
        </Pressable>
      </View>
      <View style={styles.trainingGroupsContainer}>
        {!isLoading ? (
          <FlashList
            data={teams}
            renderItem={trainingGroupRenderHandler}
            keyExtractor={(item) => item.id}
            estimatedItemSize={80}
            refreshing={refresh}
            onRefresh={() => {
              setRefresh(true);
              try {
                setTeams([]);
                fetchTeams();
                setRefresh(false);
              } catch (e) {
                console.log(e);
              }
            }}
          />
        ) : (
          <ActivityIndicator
            size={"large"}
            color={Colors.accent500}
            style={{ marginTop: 20 }}
          />
        )}
      </View>
    </View>
  );
}

export default TrainingGroups;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  header: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerText: {
    color: Colors.primary100,
    fontSize: 23,
    fontWeight: "600",
  },
  trainingGroupsContainer: {
    flex: 1,
    marginTop: 20,
  },
});
