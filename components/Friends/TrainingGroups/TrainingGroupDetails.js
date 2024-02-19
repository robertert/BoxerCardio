import { ActivityIndicator, Pressable } from "react-native";
import { Text, View, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors, { DUMMY_LEADERBOARD } from "../../../constants/colors";
import { useContext, useEffect, useState } from "react";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
  renderers,
} from "react-native-popup-menu";
import Divider from "../../UI/Divider";
import { ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import LeaderboardItem from "../LeaderboardItem";
import { Dialog } from "@rneui/themed";
import {
  arrayRemove,
  doc,
  getDoc,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { UserContext } from "../../../store/user-context";
import { SettingsContext } from "../../../store/settings-context";

const { Popover } = renderers;

const DUMMY_TEAM = {
  id: 2141235123,
  tag: "BOBO",
  name: "bobobo",
  photoUrl: "URL",
  members: [
    {
      id: 1,
      name: "Robert",
      photoUrl: "url",
    },
  ],
};

function AddNewMember() {
  const navigation = useNavigation();

  function addHandler() {
    navigation.navigate("add-new-member-form", { teamId: DUMMY_TEAM.id });
  }
  return (
    <Pressable onPress={addHandler}>
      <View style={styles.footerContainer}>
        <AntDesign name="plus" size={30} color="white" />
        <Text style={styles.footerText}>Add new member</Text>
      </View>
    </Pressable>
  );
}

function TrainingGroupDetails({ route }) {
  const id = route.params.id;

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const [mode, setMode] = useState("FREESTYLE");
  const [timeRange, setTimeRange] = useState("Today");
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [isAllowedInvitations, setIsAllowedInvitations] = useState();
  const [isVisible, setIsVisible] = useState(false);

  const [team, setTeam] = useState({});

  const userCtx = useContext(UserContext);
  const settingsCtx = useContext(SettingsContext);

  useEffect(() => {
    fetchDetails();
  }, []);

  useEffect(() => {
    if (isVisible)
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
  }, [isVisible]);

  async function fetchDetails() {
    setIsLoading(true);
    const data = await getDoc(doc(db, `trainingGroups/${id}`));
    setTeam({ id: data.id, ...data.data() });
    setIsAllowedInvitations(data.data().settings.isAllowedMembersInvitations);
    setIsOwner(
      settingsCtx.permissions.filter(
        (perm) => perm.id === data.id && perm.type === "owner"
      ).length > 0
    );
    setIsLoading(false);
  }

  function toggleIsVisible() {
    setIsDialogVisible((prev) => !prev);
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function renderLeaderboardHandler(itemData) {
    const item = itemData.item;
    return (
      <LeaderboardItem
        rank={item.rank}
        name={item.name}
        score={item.score}
        userId={item.id}
      />
    );
  }

  function settingsSelectHandler() {
    navigation.navigate("training-group-settings", {
      settings: team.settings,
      id: team.id,
    });
  }

  function shareSelectHandler() {
    //DO ZROBIENIA
  }

  function addNewMemberSelectHandler() {
    navigation.navigate("add-new-member-form", {
      teamId: team.id,
      teamName: team.name,
    });
  }

  function statsSelectHandler() {
    navigation.navigate("training-group-stats", { teamId: team.id });
  }

  function quitSelectHandler() {
    toggleIsVisible();
  }

  function membersListHandler() {
    navigation.navigate("member-list", {
      teamId: team.id,
      teamName: team.name,
      isOwner: isOwner,
      members: team.members,
    });
  }
  async function quitTrainingGroupHandler() {
    toggleIsVisible();
    //usunac z dzisiejszych tabeli
    await runTransaction(db, async (transaction) => {
      const data = await transaction.get(doc(db, `users/${userCtx.id}`));
      const prevData = data.data();
      const readyTrainingGroups = prevData.trainingGroups.filter(
        (group) => group.id !== id
      );
      const readyPermissions = prevData.permissions.filter(
        (perm) => perm.id !== id && perm.type !== "invitations"
      );
      const groupData = await transaction.get(doc(db, `trainingGroups/${id}`));
      const prevGroupData = groupData.data();
      const readyMembers = prevGroupData.members.filter(
        (memb) => memb.id !== userCtx.id
      );

      if (readyMembers.length === 0) {
        transaction.delete(doc(db, `trainingGroups/${id}`));
      } else {
        if (
          prevData.permissions.filter(
            (perm) => perm.id === id && perm.type === "owner"
          ).length > 0
        ) {
          setIsVisible(true);
          return;
        }
        transaction.update(doc(db, `trainingGroups/${id}`), {
          membersNum: prevGroupData.membersNum - 1,
          members: readyMembers,
        });
      }
      // SPRAWDZIC CZY DZIAŁA WYCHODZENIE Z TEAMU I USUWANIE Z TEAMU
      
      transaction.update(doc(db, `users/${userCtx.id}`), {
        trainingGroups: readyTrainingGroups,
        permissions: readyPermissions,
      });
      navigation.goBack();
    });
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
        <Menu>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={30} color="white" />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: styles.info,
              optionText: styles.infoText,
              optionsWrapper: styles.infoWraper,
            }}
          >
            <MenuOption onSelect={membersListHandler} text="Members list" />
            <Divider />
            {isOwner && (
              <>
                <MenuOption onSelect={settingsSelectHandler} text="Settings" />
                <Divider />
              </>
            )}
            <MenuOption onSelect={shareSelectHandler} text="Share" />
            <Divider />
            {(isAllowedInvitations || isOwner) && (
              <>
                <MenuOption
                  onSelect={addNewMemberSelectHandler}
                  text="Add new member"
                />
                <Divider />
              </>
            )}
            <MenuOption onSelect={statsSelectHandler} text="Stats" />
            <Divider />
            <MenuOption
              onSelect={quitSelectHandler}
              text="Quit this training team"
              customStyles={{
                optionText: {
                  color: Colors.accent500,
                  fontSize: 20,
                  textAlign: "center",
                },
              }}
            />
          </MenuOptions>
        </Menu>
      </View>

      {isLoading ? (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size={"large"} color={Colors.accent500} />
        </View>
      ) : (
        <>
          <View style={styles.mainContainer}>
            <Image
              style={styles.image}
              source={require("../../../assets/icon.png")}
            />
            <Text style={styles.tag}>{team.tag}</Text>
            <Text style={styles.name}>{team.name}</Text>
          </View>
          <View style={styles.pickerContainer}>
            <View style={styles.outherPickerContainer}>
              <Menu
                renderer={Popover}
                rendererProps={{
                  placement: "bottom",
                  anchorStyle: { display: "none" },
                }}
              >
                <MenuTrigger>
                  <View style={styles.innerPickerContainer}>
                    <Text style={styles.pickerText}>{mode}</Text>
                    <AntDesign name="down" size={10} color="white" />
                  </View>
                </MenuTrigger>
                <MenuOptions
                  customStyles={{
                    optionsContainer: styles.infoS,
                    optionText: styles.infoTextS,
                    optionsWrapper: styles.infoWraperS,
                  }}
                >
                  <ScrollView style={{ maxHeight: 300 }}>
                    <MenuOption
                      onSelect={() => setMode("FREESTYLE")}
                      text="FREESTYLE MODE"
                    />
                    <Divider />
                    <MenuOption
                      onSelect={() => setMode("3 MIN")}
                      text="3 MINUTE ROUND"
                    />
                    <Divider />
                    <MenuOption
                      onSelect={() => setMode("100 P")}
                      text="100 PUNCH"
                    />
                    <Divider />
                    <MenuOption
                      onSelect={() => setMode("SPEED")}
                      text="SPEED TEST"
                    />
                    <Divider />
                    <MenuOption
                      onSelect={() => setMode("REACTION")}
                      text="REACTION TIME"
                    />
                    <Divider />
                    <MenuOption
                      onSelect={() => setMode("3 MIN T")}
                      text="3 MINUTE ROUND TURBO MODE"
                    />
                    <Divider />
                    <MenuOption
                      onSelect={() => setMode("100 P T")}
                      text="100 PUNCH TURBO MODE"
                    />
                  </ScrollView>
                </MenuOptions>
              </Menu>
            </View>
            <View style={styles.outherPickerContainer}>
              <Menu
                renderer={Popover}
                rendererProps={{
                  placement: "bottom",
                  anchorStyle: { display: "none" },
                }}
              >
                <MenuTrigger>
                  <View style={styles.innerPickerContainer}>
                    <Text style={styles.pickerText}>{timeRange}</Text>
                    <AntDesign name="down" size={10} color="white" />
                  </View>
                </MenuTrigger>
                <MenuOptions
                  customStyles={{
                    optionsContainer: styles.infoS,
                    optionText: styles.infoTextS,
                    optionsWrapper: styles.infoWraperS,
                  }}
                >
                  <MenuOption
                    onSelect={() => setTimeRange("Month")}
                    text="This month"
                  />
                  <Divider />
                  <MenuOption
                    onSelect={() => setTimeRange("Week")}
                    text="This week"
                  />
                  <Divider />
                  <MenuOption
                    onSelect={() => setTimeRange("Today")}
                    text="Today"
                  />
                </MenuOptions>
              </Menu>
            </View>
          </View>
          <View style={styles.leaderboardContainer}>
            <FlashList
              data={DUMMY_LEADERBOARD}
              renderItem={renderLeaderboardHandler}
              keyExtractor={(item) => item.rank}
              estimatedItemSize={50}
              ListFooterComponent={AddNewMember}
            />
          </View>
          <Dialog
            isVisible={isDialogVisible}
            onBackdropPress={toggleIsVisible}
            overlayStyle={styles.dialogContainer}
          >
            <Dialog.Title title="Warning" titleStyle={styles.dialogTitle} />
            <Text style={styles.dialogText}>
              {" "}
              Are you sure you want to quit this training team?
            </Text>
            <Dialog.Actions>
              <Pressable onPress={quitTrainingGroupHandler}>
                <Text style={styles.dialogOptionRed}>Yes I'm sure</Text>
              </Pressable>
              <Pressable onPress={toggleIsVisible}>
                <Text style={styles.dialogOption}>Cancel</Text>
              </Pressable>
            </Dialog.Actions>
          </Dialog>
          <Dialog
            isVisible={isVisible}
            onBackdropPress={() => setIsVisible((prev) => !prev)}
            overlayStyle={styles.dialogContainer}
          >
            <Dialog.Title
              title="Warning"
              titleStyle={[styles.dialogTitle, { textAlign: "center" }]}
            />
            <Text style={[styles.dialogText, { textAlign: "center" }]}>
              {" "}
              You can't quit this training group because you are an owner.
              Before you quit you neet to give someone else leadership.
            </Text>
          </Dialog>
        </>
      )}
    </View>
  );
}

export default TrainingGroupDetails;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.primary700,
  },
  header: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  info: {
    width: 200,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    marginTop: 40,
  },
  infoText: {
    color: Colors.primary100,
    fontSize: 20,
    textAlign: "center",
  },
  infoWraper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  mainContainer: {
    alignItems: "center",
  },
  image: {
    height: 150,
    width: 260,
    borderRadius: 50,
  },
  tag: {
    color: "white",
    fontSize: 25,
    fontFamily: "RubikMono",
    marginTop: 25,
    marginBottom: 20,
    textAlign: "center",
  },
  name: {
    textAlign: "center",
    color: "white",
    fontSize: 40,
    fontFamily: "RubikMono",
  },
  pickerContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "85%",
    backgroundColor: Colors.primary400,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  pickerText: {
    color: Colors.primary100,
    fontSize: 15,
    fontWeight: "700",
  },
  outherPickerContainer: {
    marginVertical: 5,
    marginHorizontal: 3,
    height: 37,
    borderRadius: 15,
    flex: 1,
    backgroundColor: Colors.accent500_80,
    alignItems: "center",
    justifyContent: "center",
  },
  innerPickerContainer: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  infoS: {
    width: 140,
    backgroundColor: Colors.primary700,
    borderRadius: 20,
    marginTop: 10,
  },
  infoTextS: {
    color: Colors.primary100,
    fontSize: 15,
    textAlign: "center",
  },
  infoWraperS: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  leaderboardContainer: {
    flex: 1,
    width: "85%",
    backgroundColor: Colors.primary500,
    borderRadius: 30,
    marginBottom: 20,
  },
  footerContainer: {
    height: 50,
    flexDirection: "row",
    marginHorizontal: 20,
    alignItems: "center",
  },
  footerText: {
    marginHorizontal: 15,
    color: Colors.primary100,
    fontSize: 20,
  },
  dialogContainer: {
    backgroundColor: Colors.primary500,
    borderRadius: 20,
  },
  dialogTitle: {
    fontSize: 30,
    color: Colors.primary100,
    fontWeight: "bold",
  },
  dialogText: {
    fontSize: 20,
    color: Colors.primary100,
    marginHorizontal: 5,
  },
  dialogOption: {
    fontSize: 20,
    color: Colors.primary100,
    marginHorizontal: 10,
    fontWeight: "700",
  },
  dialogOptionRed: {
    marginLeft: 10,
    fontSize: 20,
    color: Colors.accent500,
    fontWeight: "700",
  },
});
