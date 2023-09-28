import { View, StyleSheet, Text, Pressable, TextInput } from "react-native";
import Colors, { DUMMY_LEADERBOARD } from "../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Divider from "../components/UI/Divider";
import { AntDesign } from "@expo/vector-icons";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import LeaderboardItem from "../components/Friends/LeaderboardItem";
import { useNavigation } from "@react-navigation/native";

function FriendsScreen() {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState("100 P");
  const [group, setGroup] = useState("FRIENDS");
  const [timeRange, setTimeRange] = useState("MONTH");
  const [search,setSearch] = useState("");

  const navigation = useNavigation();

  const teams = [];

  useEffect(()=>{
    const time = setTimeout(()=>{
      if(search!==""){
        console.log("Fetching...");
      }
    },1000);
    return () => clearTimeout(time)
  },[search])

  function searchHandler(searchText){
     setSearch(searchText);
  }

  function renderLeaderboardHandler(itemData) {
    const item = itemData.item;
    return (
      <LeaderboardItem rank={item.rank} name={item.name} score={item.score} userId={item.id}/>
    );
  }

  function trainingGroupPressHandler() {
    navigation.getParent().navigate("training-groups");
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.headerPlaceholder}></View>
        <Text style={styles.headerText}>Leaderboards</Text>
        <Pressable onPress={trainingGroupPressHandler}>
          <View style={styles.headerButtonContainer}>
            <MaterialIcons name="groups" size={35} color="white" />
            <Text style={styles.headerButtonText}>Training groups</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.pickerContainer}>
        <View style={styles.outherPickerContainer}>
          <Menu>
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
              <MenuOption onSelect={() => setMode("100 P")} text="100 PUNCH" />
              <Divider />
              <MenuOption onSelect={() => setMode("SPEED")} text="SPEED TEST" />
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
            </MenuOptions>
          </Menu>
        </View>
        <View style={styles.outherPickerContainer}>
          <Menu>
            <MenuTrigger>
              <View style={styles.innerPickerContainer}>
                <Text style={styles.pickerText}>{group}</Text>
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
                onSelect={() => setGroup("Everyone")}
                text="Everyone"
              />
              <Divider />
              <MenuOption onSelect={() => setGroup("Friends")} text="Friends" />
              {teams.map((team) => {
                return (
                  <>
                    <Divider />
                    <MenuOption
                      onSelect={() => setGroup(team.short)}
                      text={team.short}
                    />
                  </>
                );
              })}
            </MenuOptions>
          </Menu>
        </View>
        <View style={styles.outherPickerContainer}>
          <Menu>
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
              <MenuOption onSelect={() => setTimeRange("Today")} text="Today" />
            </MenuOptions>
          </Menu>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <TextInput autoCapitalize="none" onChangeText={searchHandler} style={styles.input} placeholder="Search" />
      </View>
      <View style={styles.leaderboardContainer}>
        <FlashList
          data={DUMMY_LEADERBOARD}
          renderItem={renderLeaderboardHandler}
          keyExtractor={(item) => item.rank}
          estimatedItemSize={50}
        />
      </View>
    </View>
  );
}

export default FriendsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerPlaceholder: {
    width: 80,
  },
  headerText: {
    color: Colors.primary100,
    fontSize: 27,
    fontWeight: "500",
  },
  headerButtonContainer: {
    width: 80,
    alignItems: "center",
  },
  headerButtonText: {
    color: Colors.primary100,
    textAlign: "center",
    fontSize: 13,
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
    width: 105,
    backgroundColor: Colors.primary700,
    borderRadius: 20,
    marginTop: 5,
    marginLeft: -8,
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
  input: {
    color: Colors.primary100,
  },
  searchContainer: {
    marginVertical: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    height: 30,
    justifyContent: "center",
    width: "85%",
  },
  leaderboardContainer: {
    flex: 1,
    width: "85%",
    backgroundColor: Colors.primary500,
    borderRadius: 30,
    marginBottom: 20,
  },
});
