import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import Colors, { DUMMY_LEADERBOARD, timeModes } from "../constants/colors";
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
import { useContext, useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import LeaderboardItem from "../components/Friends/LeaderboardItem";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ActivityIndicator } from "react-native-paper";
import { UserContext } from "../store/user-context";
import { useTranslation } from "react-i18next";
import axios from "axios";

function FriendsScreen() {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState("100P");
  const [group, setGroup] = useState("Everyone");
  const [timeRange, setTimeRange] = useState("Year");
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [teams, setTeams] = useState([]);

  const [lastDoc, setLastDoc] = useState();
  const [multiplayer, setMultiplayer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const navigation = useNavigation();
  const userCtx = useContext(UserContext);

  const { t } = useTranslation();

  let order;

  useEffect(() => {
    const time = setTimeout(() => {
      if (search !== "") {
        fetchSearch(search);
      } else {
        getInitialLeaderboard();
      }
    }, 1000);
    return () => clearTimeout(time);
  }, [search]);

  useEffect(() => {
    setSearch("");
  }, [mode, group, timeRange]);

  async function fetchSearch(search) {
    let date;
    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString();
    const day = new Date().getDate().toString();

    const dayMonthYear = year + ":" + month + ":" + day;
    const monthYear = year + ":" + month;

    if (timeRange === "Year") {
      date = year;
    } else if (timeRange === "Month") {
      date = monthYear;
    } else if (timeRange === "Today") {
      date = dayMonthYear;
    }
    //NA ODWROT FECHUJE MIEJSCE
    try {
      setIsFirstLoading(true);
      const friends = (await getDoc(doc(db, `users/${userCtx.id}`))).data()
        .friends;
      const data = await getDocs(
        query(
          collection(db, `leaderboards/${mode}/dates/${date}/players`),
          where("name", "==", search)
        )
      );
      let rank;
      if (data.docs[0]) {
        rank = (
          await axios.post(
            "https://us-central1-boxerapp-beb5c.cloudfunctions.net/getRank",
            {
              data: {
                playerID: data.docs[0].data().user,
                mode: mode,
                date: date,
                group: group,
              },
            }
          )
        ).data.rank;
        if (timeModes.filter((modes) => modes === mode)) {
          const playersNum = (
            await getDocs(
              collection(db, `/leaderboards/${mode}/dates/${date}/players`)
            )
          ).docs.length;
          rank = playersNum + 1 - rank;
        }
      } else {
        rank = "-";
        const userDataFetch = await getDocs(
          query(collection(db, `users`), where("name", "==", search))
        );
        const userData = userDataFetch.docs[0];
        if (userDataFetch.docs.length != 0) {
          setLeaderboard([
            {
              name: userData.data().name,
              user: userData.id,
              score: 0,
              rank: " - ",
            },
          ]);
        } else {
          setLeaderboard([]);
        }
        setIsFirstLoading(false);
        return;
      }
      if (group === "Friends") {
        setGroup("Everyone");
      } else {
        setLeaderboard(
          data.docs.map((doc) => {
            doc = { ...doc.data(), rank: rank };
            return doc;
          })
        );
        setMultiplayer((prev) => prev + data.docs.length);
      }
      setIsFirstLoading(false);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchTeams() {
    try {
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      setTeams(data.data().trainingGroups);
    } catch (e) {
      Alert.alert("Error", t("Error message"));
      console.log(e);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  async function getInitialLeaderboard() {
    let date;
    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString();
    const day = new Date().getDate().toString();

    const dayMonthYear = year + ":" + month + ":" + day;
    const monthYear = year + ":" + month;

    if (timeRange === "Year") {
      date = year;
    } else if (timeRange === "Month") {
      date = monthYear;
    } else if (timeRange === "Today") {
      date = dayMonthYear;
    }
    try {
      setIsFirstLoading(true);
      setMultiplayer(0);
      const friends = (await getDoc(doc(db, `users/${userCtx.id}`))).data()
        .friends;
      const data = await getDocs(
        query(
          collection(db, `leaderboards/${mode}/dates/${date}/players`),
          orderBy("score", order),
          limit(10)
        )
      );
      setLastDoc(data.docs[data.docs.length - 1]);
      if (data.docs.length === 10) {
        setHasNextPage(true);
      } else {
        setHasNextPage(false);
      }
      if (group === "Friends") {
        const d = data.docs.filter((doc) => {
          let czy = false;
          friends.forEach((friend) => {
            if (friend.id == doc.data().user) {
              czy = true;
            }
          });
          return czy;
        });
        let licznik = 1;
        setLeaderboard(
          d.map((doc) => {
            doc = { ...doc.data(), rank: licznik };
            licznik++;
            return doc;
          })
        );
        setMultiplayer((prev) => prev + d.length);
      } else {
        let licznik = 1;
        setLeaderboard(
          data.docs.map((doc) => {
            doc = { ...doc.data(), rank: licznik };
            licznik++;
            return doc;
          })
        );
        setMultiplayer((prev) => prev + data.docs.length);
      }
      setIsFirstLoading(false);
    } catch (e) {
      setIsError(true);
    }
  }

  async function loadNextPage() {
    if (hasNextPage) {
      let date;
      if (timeRange === "Year") {
        const fullDate = new Date();
        date = fullDate.getFullYear();
      }
      try {
        setIsLoading(true);
        const data = await getDocs(
          query(
            collection(db, `leaderboards/${mode}/dates/${date}/players`),
            orderBy("score", order),
            limit(10),
            startAfter(lastDoc)
          )
        );

        setLastDoc(data.docs[data.docs.length - 1]);

        if (data.docs.length === 10) {
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
        //data.forEach((doc) => console.log(doc.data()));
        let licznik = 1 + multiplayer;
        const newLeaderboard = data.docs.map((doc) => {
          doc = { ...doc.data(), rank: licznik };
          licznik++;
          return doc;
        });
        setLeaderboard((prev) => [...prev, ...newLeaderboard]);
        setMultiplayer((prev) => prev + 1);
        setIsLoading(false);
      } catch (e) {
        setIsError(true);
      }
    }
  }

  useEffect(() => {
    getInitialLeaderboard();
    if (timeModes.filter((timeMode) => timeMode === mode)) {
      order = "asc";
    } else {
      order = "desc";
    }
  }, [timeRange, mode, group]);

  function searchHandler(searchText) {
    setSearch(searchText);
  }

  function renderLeaderboardHandler(itemData) {
    const item = itemData.item;
    let type = "NUM";
    if (timeModes.filter((timeMode) => timeMode === mode)) {
      type = "TIME";
    }
    return (
      <LeaderboardItem
        rank={item.rank}
        name={item.name}
        score={item.score}
        userId={item.user}
        type={type}
      />
    );
  }

  function trainingGroupPressHandler() {
    navigation.getParent().navigate("training-groups");
  }

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
          <View style={styles.headerPlaceholder}></View>
          <Text style={styles.headerText}>{t("Leaderboards")}</Text>
          <Pressable onPress={trainingGroupPressHandler}>
            <View style={styles.headerButtonContainer}>
              <MaterialIcons name="groups" size={35} color="white" />
              <Text style={styles.headerButtonText}>
                {t("Training groups")}
              </Text>
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
                <MenuOption onSelect={() => setMode("100P")} text="100 PUNCH" />
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
              </MenuOptions>
            </Menu>
          </View>
          <View style={styles.outherPickerContainer}>
            <Menu>
              <MenuTrigger>
                <View style={styles.innerPickerContainer}>
                  <Text style={styles.pickerText}>{t(group)}</Text>
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
                  text={t("Everyone")}
                />
                <Divider />
                <MenuOption
                  onSelect={() => setGroup("Friends")}
                  text={t("Friends")}
                />
                {teams.map((team) => {
                  return (
                    <>
                      <Divider />
                      <MenuOption
                        onSelect={() => setGroup(team.short)}
                        text={team.tag}
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
                  <Text style={styles.pickerText}>{t(timeRange)}</Text>
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
                  onSelect={() => setTimeRange("Year")}
                  text={t("This year")}
                />
                <Divider />
                <MenuOption
                  onSelect={() => setTimeRange("Month")}
                  text={t("This month")}
                />
                <Divider />
                <MenuOption
                  onSelect={() => setTimeRange("Today")}
                  text={t("Today")}
                />
              </MenuOptions>
            </Menu>
          </View>
        </View>
        {group === "Everyone" ? (
          <View style={styles.searchContainer}>
            <TextInput
              autoCapitalize="none"
              onChangeText={searchHandler}
              style={styles.input}
              placeholder={t("Search")}
              value={search}
            />
          </View>
        ):(
          <View style={{marginVertical: 15}}/>
        )}
        <View style={styles.leaderboardContainer}>
          {!isFirstLoading ? (
            <FlashList
              data={leaderboard}
              extraData={leaderboard}
              renderItem={renderLeaderboardHandler}
              keyExtractor={(item) => item.rank}
              estimatedItemSize={50}
              onEndReachedThreshold={0.8}
              onEndReached={loadNextPage}
              refreshing={refresh}
              onRefresh={async () => {
                try {
                  setIsError(false);
                  setRefresh(true);
                  setLeaderboard([]);
                  getInitialLeaderboard();
                  fetchTeams();
                  setRefresh(false);
                } catch (e) {
                  console.log(e);
                  setIsError(true);
                }
              }}
              ListEmptyComponent={
                <Text style={styles.errorText}>
                  {t("This leaderboard is empty")}
                </Text>
              }
              ListFooterComponent={
                !isError ? (
                  isLoading && (
                    <ActivityIndicator
                      size="large"
                      color={Colors.accent500}
                      style={styles.loading}
                    />
                  )
                ) : (
                  <View style={styles.footerContainer}>
                    <Text style={styles.footerTextTitle}>Error</Text>
                    <Text style={styles.footerText}>{t("Error message")}</Text>
                  </View>
                )
              }
            />
          ) : (
            <ActivityIndicator
              size="large"
              color={Colors.accent500}
              style={styles.loading}
            />
          )}
        </View>
      </View>
    </Pressable>
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
  errorText: {
    marginVertical: 20,
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 25,
    marginTop: "50%",
  },
  footerContainer: {
    height: 200,
    width: "100%",
    flexDirection: "column",
    padding: 25,
    marginTop: "5%",
  },
  footerText: {
    color: Colors.primary100,
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    marginHorizontal: "10%",
  },
  footerTextTitle: {
    color: Colors.primary100,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },
  loading: {
    marginTop: 30,
  },
});
