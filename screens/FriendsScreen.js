import { View, StyleSheet, Text, Pressable, TextInput } from "react-native";
import Colors from "../constants/colors";
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
import { useState } from "react";
import { FlashList } from "@shopify/flash-list";

function FriendsScreen() {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState("100 P");
  const [group, setGroup] = useState("FRIENDS");
  const [timeRange, setTimeRange] = useState("MONTH");

  const teams = [];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.headerPlaceholder}></View>
        <Text style={styles.headerText}>Leaderboards</Text>
        <Pressable>
          <View style={styles.headerButtonContainer}>
            <MaterialIcons name="groups" size={35} color="white" />
            <Text style={styles.headerButtonText}>Training groups</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.pickerContainer}>
        <Menu>
          <MenuTrigger>
            <View style={styles.smallPickerContainer}>
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

        <Menu>
          <MenuTrigger>
            <View style={styles.smallPickerContainer}>
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
              onSelect={() => alert("VIew profile")}
              text="Everyone"
            />
            <Divider />
            <MenuOption
              onSelect={() => alert(`Removed friends`)}
              text="Friends"
            />
            {teams.map((team) => {
              return (
                <>
                  <MenuOption
                    onSelect={() => alert("VIew profile")}
                    text={team.name}
                  />
                  <Divider />
                </>
              );
            })}
          </MenuOptions>
        </Menu>

        <Menu>
          <MenuTrigger>
            <View style={styles.smallPickerContainer}>
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
              onSelect={() => alert("VIew profile")}
              text="This month"
            />
            <Divider />
            <MenuOption
              onSelect={() => alert(`Removed friends`)}
              text="This week"
            />
            <Divider />
            <MenuOption
              onSelect={() => alert(`Removed friends`)}
              text="Today"
            />
          </MenuOptions>
        </Menu>
      </View>
      <View style={styles.searchContainer}>
        <TextInput placeholder="Search" />
      </View>
      <View style={styles.leaderboardContainer}>
        <FlashList />
      </View>
    </View>
  );
}

export default FriendsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary500,
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
    height: 45,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  pickerText: {
    color: Colors.primary100,
    fontSize: 15,
  },
  smallPickerContainer: {
    marginVertical: 5,
    marginHorizontal: 3,
    height: 37,
    width: 100,
    borderRadius: 15,
    backgroundColor: Colors.accent500_80,
    alignItems: "center",
    justifyContent: "center",
  },
  infoS: {
    width: 100,
    backgroundColor: Colors.primary700,
    borderRadius: 20,
    marginTop: 5,
    marginLeft: 3,
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
  searchContainer: {
    marginVertical: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: Colors.primary700,
    borderRadius: 20,
    height: 30,
    justifyContent: "center",
    width: "85%",
  },
  leaderboardContainer: {},
});
