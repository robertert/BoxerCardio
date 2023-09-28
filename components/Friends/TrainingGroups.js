import { View, StyleSheet, Text } from "react-native";
import Colors from "../../constants/colors";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const userCtx = useContext(UserContext);

  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh,setRefresh] = useState(false);

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
      console.log(e);
    }
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function addHandler() {
    navigation.navigate("training-group-form");
  }

  async function testHandler() {
    try {
      post("addNewScore", {
        userId: 1,
        score: 10,
      });
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
        <Text style={styles.headerText}>Your training teams</Text>
        <Pressable onPress={addHandler}>
          <Ionicons name="ios-add" size={42} color="white" />
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
            onRefresh={()=>{
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
    fontSize: 25,
    fontWeight: "600",
  },
  trainingGroupsContainer: {
    flex: 1,
    marginTop: 20,
  },
});
