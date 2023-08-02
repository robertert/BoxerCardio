import { View, StyleSheet, Text } from "react-native";
import Colors from "../../constants/colors";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import TrainingGroup from "./TrainingGroups/TrainingGroup";
import { Platform } from "react-native";
import { post } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

function TrainingGroups() {
  const DUMMY_TEAMS = [
    {
      id: 1,
      name: "TEAMNAME",
      photoUrl: "url",
      rank: 1,
      members: 10,
    },
    {
      id: 2,
      name: "TEAMNAME",
      photoUrl: "url",
      rank: 3,
      members: 30,
    },
    {
      id: 3,
      name: "TEAMNAME",
      photoUrl: "url",
      rank: 15,
      members: 25,
    },
  ];

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  function goBackHandler() {
    navigation.goBack();
  }

  function addHandler() {
    navigation.navigate("training-group-form");
  }

  async function testHandler() {
    try {
      post("addNewScore",{
        userId: 1,
        score: 10,
      })
    } catch (e) {
      console.log("ERROR");
      console.log(e);
    }
   
  }

  function trainingGroupRenderHandler(itemData) {
    const item = itemData.item;
    return (
      <TrainingGroup
        name={item.name}
        rank={item.rank}
        members={item.members}
        photoUrl={item.photoUrl}
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
        <Text style={styles.headerText}>Your training teams</Text>
        <Pressable onPress={addHandler}>
          <Ionicons name="ios-add" size={42} color="white" />
        </Pressable>
      </View>
      <View style={styles.trainingGroupsContainer}>
        <FlashList
          data={DUMMY_TEAMS}
          renderItem={trainingGroupRenderHandler}
          keyExtractor={(item) => item.id}
          estimatedItemSize={80}
        />
      </View>
      <Pressable onPress={testHandler}>
        <View style={{ height: 40, width: 60, backgroundColor: "red" }}></View>
      </Pressable>
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
    fontSize: 25,
    fontWeight: "600",
  },
  trainingGroupsContainer: {
    flex: 1,
    marginTop: 20,
  },
});
