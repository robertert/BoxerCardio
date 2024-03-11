import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { ActivityIndicator } from "react-native";
import Divider from "../UI/Divider";
import { AntDesign } from "@expo/vector-icons";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import { useTranslation } from "react-i18next";

const DUMMY_STATS = {
  timeSpent: 123,
  punches: 12304,
  calories: 100000,
  trainingSesions: 80,
};

function ProfileStats({ route }) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const id = route.params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [timeRange, setTimeRange] = useState("All time");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [isVisibleDay, setIsVisibleDay] = useState(false);
  const [isVisibleMonth, setIsVisibleMonth] = useState(false);
  const [isVisibleYear, setIsVisibleYear] = useState(false);
  const [message, setMessage] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    if (timeRange === "Day") {
      setIsVisibleDay(true);
      setIsVisibleMonth(true);
      setIsVisibleYear(true);
    }
    if (timeRange === "Month") {
      setIsVisibleDay(false);
      setIsVisibleMonth(true);
      setIsVisibleYear(true);
    }
    if (timeRange === "Year") {
      setIsVisibleDay(false);
      setIsVisibleMonth(false);
      setIsVisibleYear(true);
    }
    if (timeRange === "All time") {
      fetchStats(timeRange, year, month, day);
      setIsVisibleDay(false);
      setIsVisibleMonth(false);
      setIsVisibleYear(false);
    }
  }, [timeRange]);

  async function fetchStats(type, year = "", month = "", day = "") {
    let path = "";
    if (type === "All time") {
      path = `users/${id}/stats/AllTime`;
    } else if (type === "Year") {
      path = `users/${id}/stats/${year}`;
    } else if (type === "Month") {
      path = `users/${id}/stats/${year}:${month}`;
    } else if (type === "Day") {
      path = `users/${id}/stats/${year}:${month}:${day}`;
    }

    setIsLoading(true);

    try {
      const data = await getDoc(doc(db, path));
      const readyStats = {
        id: data.id,
        ...data.data(),
      };
      setStats(readyStats);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  }

  function submitHandler() {
    setMessage("");
    const date = new Date();
    if (timeRange === "Year") {
      if (isNaN(year) || year % 1 != 0) {
        setMessage(t("Enter a number"));
        return;
      }
      if (date.getFullYear() < year || date.getFullYear() - year > 5) {
        setMessage(
          t(
            "You can only enter year between ${date.getFullYear() - 5} and ${date.getFullYear()}",
            { start: date.getFullYear() - 5, end: date.getFullYear() }
          )
        );
        return;
      }
    } else if (timeRange === "Month") {
      if (isNaN(year) || year % 1 != 0 || isNaN(month) || month % 1 != 0) {
        setMessage(t("Enter a number"));
        return;
      }
      if (month < 1 || month > 12) {
        setMessage(t("Enter valid month number"));
        return;
      }
      if (
        date.getFullYear() < year ||
        (date.getFullYear() == year && date.getMonth() + 1 < month)
      ) {
        setMessage(t("You can't enter future date."));
        return;
      }
      if (
        date.getFullYear() - 1 > year ||
        (date.getFullYear() - 1 == year && date.getMonth() + 2 > month)
      ) {
        setMessage(t("You can only enter a date in the last 12 months"));
        return;
      }
    } else if (timeRange === "Day") {
      const newDate = new Date(year, month - 1, day);
      if (
        isNaN(year) ||
        year % 1 != 0 ||
        isNaN(month) ||
        month % 1 != 0 ||
        isNaN(day) ||
        day % 1 != 0
      ) {
        setMessage(t("Enter a number"));
        return;
      }
      if (newDate.getMonth() + 1 != month || newDate.getFullYear() != year) {
        setMessage(t("Enter valid date"));
        return;
      } else if (date < newDate) {
        setMessage(t("You can't enter future date."));
        return;
      } else if ((date - newDate) / (1000 * 3600 * 24) >= 31) {
        setMessage(t("You can only enter date that was in the last 30 days."));
        return;
      }
    }
    fetchStats(timeRange, year, month, day);
  }

  function dayChangeHandler(value) {
    setDay(value);
  }
  function monthChangeHandler(value) {
    setMonth(value);
  }
  function yearChangeHandler(value) {
    setYear(value);
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
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.header}>
          <Pressable onPress={goBackHandler}>
            <Ionicons name="chevron-back" size={42} color="white" />
          </Pressable>
        </View>
        <View style={styles.pickerContainer}>
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
                  onSelect={() => setTimeRange("All time")}
                  text={t("All time")}
                />
                <Divider />
                <MenuOption
                  onSelect={() => setTimeRange("Year")}
                  text={t("Year")}
                />
                <Divider />
                <MenuOption
                  onSelect={() => setTimeRange("Month")}
                  text={t("Month")}
                />
                <Divider />
                <MenuOption
                  onSelect={() => setTimeRange("Day")}
                  text={t("Day")}
                />
              </MenuOptions>
            </Menu>
          </View>
        </View>
        <View style={styles.inputsContainer}>
          {isVisibleDay && (
            <View style={styles.outherInputContainer}>
              <Text style={styles.inputLabel}>{t("Day")}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={day}
                  style={styles.input}
                  keyboardType="number-pad"
                  onChangeText={dayChangeHandler}
                  maxLength={2}
                />
              </View>
            </View>
          )}
          {isVisibleMonth && (
            <View style={styles.outherInputContainer}>
              <Text style={styles.inputLabel}>{t("Month")}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={month}
                  style={styles.input}
                  keyboardType="number-pad"
                  onChangeText={monthChangeHandler}
                  maxLength={2}
                />
              </View>
            </View>
          )}
          {isVisibleYear && (
            <View style={styles.outherInputContainer}>
              <Text style={styles.inputLabel}>{t("Year")}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={year}
                  style={styles.input}
                  keyboardType="number-pad"
                  onChangeText={yearChangeHandler}
                  maxLength={4}
                />
              </View>
            </View>
          )}
        </View>
        {!(!isVisibleDay && !isVisibleMonth && !isVisibleYear) && (
          <Pressable onPress={submitHandler}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>{t("Submit")}</Text>
            </View>
          </Pressable>
        )}
        <Text style={styles.errorMessage}>{message}</Text>
        {!isLoading ? (
          <View style={styles.statContainer}>
            <Text style={styles.statText}>
              {t("Time spend:")}{" "}
              <Text style={styles.statValue}>
                {stats.timeSpent ? Math.round(stats.timeSpent / 36) / 100 : 0} h
              </Text>
            </Text>
            <Text style={styles.statText}>
              {t("Punches")}{": "}
              <Text style={styles.statValue}>
                {stats.punches ? stats.punches : 0}
              </Text>
            </Text>
            <Text style={styles.statText}>
              {t("Calories") + ": "}
              <Text style={styles.statValue}>
                {stats.calories ? stats.calories : 0} kcal
              </Text>
            </Text>
            <Text style={styles.statText}>
              {t("Number of training sessions")}{": "}
              <Text style={styles.statValue}>
                {stats.sessionsNum ? stats.sessionsNum : 0}
              </Text>
            </Text>
          </View>
        ) : (
          <ActivityIndicator
            size={"large"}
            color={Colors.accent500}
            style={{ marginTop: 20 }}
          />
        )}
      </Pressable>
    </View>
  );
}

export default ProfileStats;

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  statContainer: {
    marginTop: 30,
    marginLeft: 30,
  },
  statText: {
    marginVertical: 10,
    fontSize: 23,
    color: Colors.primary100,
  },
  statValue: {
    color: Colors.accent100,
    marginLeft: 10,
    fontWeight: "bold",
  },
  pickerContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "65%",
    backgroundColor: Colors.primary400,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 12,
    alignItems: "center",
    alignSelf: "center",
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
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: Colors.accent500_80,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 25,
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 15,
    fontWeight: "700",
  },
  inputsContainer: {
    marginVertical: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  inputContainer: {
    marginTop: 10,
    height: 40,
    width: "80%",
    borderRadius: 15,
    backgroundColor: Colors.primary500,
  },
  input: {
    textAlign: "center",
    marginHorizontal: 20,
    flex: 1,
    color: Colors.primary100,
    fontSize: 20,
  },
  outherInputContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    color: Colors.primary100,
    fontSize: 20,
    fontWeight: "800",
  },
  errorMessage: {
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
    fontSize: 15,
    color: Colors.accent500,
    fontWeight: "800",
    alignSelf: "center",
  },
});
