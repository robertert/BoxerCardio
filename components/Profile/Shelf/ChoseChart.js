import { View, StyleSheet, Pressable, Text, Dimensions } from "react-native";
import Colors from "../../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Divider from "../../UI/Divider";
import { AntDesign } from "@expo/vector-icons";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import { useContext, useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { ShelfContext } from "../../../store/shelf-context";
import { db } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { ActivityIndicator } from "react-native";
import { UserContext } from "../../../store/user-context";

const DUMMY_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DUMMY_WEEKDAYS = [
  "Mon.",
  "Tues.",
  "Wed.",
  "Thu.",
  "Fri.",
  "Sat.",
  "Sun.",
];

function ChooseCharts() {
  const [mode, setMode] = useState("100 P");
  const [scoreType, setScoreType] = useState("Highest");
  const [timeRange, setTimeRange] = useState("Last 30 days");
  const [labels, setLabels] = useState(["TEST","TEST"]);
  const [chartData, setChartData] = useState([1,2]);
  const [isLoading, setIsLoading] = useState(true);

  const shelfContext = useContext(ShelfContext);
  const userCtx = useContext(UserContext);

  const date = new Date();

  useEffect(() => {
    shelfContext.setChartProps("mode", mode);
  }, [mode]);
  useEffect(() => {
    shelfContext.setChartProps("timeRange", timeRange);
  }, [timeRange]);
  useEffect(() => {
    shelfContext.setChartProps("scoreType", scoreType);
  }, [scoreType]);

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  useEffect(() => {
    setLabels([]);
    if (timeRange === "6 months") {
      const month = date.getMonth();
      let add = 0;
      for (let i = 5; i >= 0; i--) {
        setLabels((prev) => {
          if (month - i < 0) {
            add = 12;
          } else {
            add = 0;
          }
          return [...prev, DUMMY_MONTHS[month - i + add]];
        });
      }
    }
    if (timeRange === "Last year") {
      const month = date.getMonth();
      let add;
      for (let i = 11; i >= 0; i -= 2) {
        setLabels((prev) => {
          if (month - i < 0) {
            add = 12;
          } else {
            add = 0;
          }
          return [...prev, DUMMY_MONTHS[month - i + add]];
        });
      }
    }
    if (timeRange === "All time") {
      const year = date.getFullYear();
      for (let i = 5; i >= 0; i--) {
        setLabels((prev) => [...prev, year - i]);
      }
    }
    if (timeRange === "3 months") {
      const month = date.getMonth();
      let add = 0;
      for (let i = 2; i >= 0; i--) {
        setLabels((prev) => {
          if (month - i < 0) {
            add = 12;
          } else {
            add = 0;
          }
          return [...prev, DUMMY_MONTHS[month - i + add]];
        });
      }
    }
    if (timeRange === "Last 30 days") {
      const day = date.getDate();
      let add;
      for (let i = 30; i >= 0; i -= 6) {
        setLabels((prev) => {
          if (day - i < 0) {
            add = 30;
          } else {
            add = 0;
          }
          return [...prev, day - i + add];
        });
      }
    }
    if (timeRange === "Last week") {
      const day = date.getDay();
      let add;
      for (let i = 6; i >= 0; i--) {
        setLabels((prev) => {
          if (day - i < 0) {
            add = 7;
          } else {
            add = 0;
          }
          return [...prev, DUMMY_WEEKDAYS[day - i + add]];
        });
      }
    }
  }, [timeRange]);

  //FETCHING DATA

  useEffect(() => {
    async function changeData() {
      let days = [];
      setChartData([]);
      if (timeRange === "6 months") {
        const month = date.getMonth();
        let year;
        let add = 0;
        for (let i = 5; i >= 0; i--) {
          if (month - i < 0) {
            add = 12;
            year = date.getFullYear() - 1;
          } else {
            add = 0;
            year = date.getFullYear();
          }
          days = [...days, { month: month - i + add + 1, year: year }];
        }
        setIsLoading(true);
        await new Promise((resolve) => {
          days.forEach(async (day, index, array) => {
            await fetchData("Month", mode, scoreType, day.year, day.month);
            if (index === array.length - 1) resolve();
          });
        });
        setIsLoading(false);
      }

      if (timeRange === "Last year") {
        const month = date.getMonth();
        let add;
        let year;
        for (let i = 11; i >= 0; i--) {
          if (month - i < 0) {
            add = 12;
            year = date.getFullYear() - 1;
          } else {
            add = 0;
            year = date.getFullYear();
          }
          days = [...days, { month: month - i + add + 1, year: year }];
        }
        setIsLoading(true);
        await new Promise((resolve) => {
          days.forEach(async (day, index, array) => {
            await fetchData("Month", mode, scoreType, day.year, day.month);
            if (index === array.length - 1) resolve();
          });
        });
        setIsLoading(false);
      }
      if (timeRange === "All time") {
        const year = date.getFullYear();
        for (let i = 5; i >= 0; i--) {
          days = [...days, year - i];
        }
        setIsLoading(true);
        await new Promise((resolve) => {
          days.forEach(async (day, index, array) => {
            await fetchData("Year", mode, scoreType, day);
            if (index === array.length - 1) resolve();
          });
        });
        setIsLoading(false);
      }
      if (timeRange === "3 months") {
        const month = date.getMonth();
        let year;
        let add = 0;
        for (let i = 2; i >= 0; i--) {
          if (month - i < 0) {
            add = 12;
            year = date.getFullYear() - 1;
          } else {
            add = 0;
            year = date.getFullYear();
          }
          days = [...days, { month: month - i + add + 1, year: year }];
        }
        setIsLoading(true);
        await new Promise((resolve) => {
          days.forEach(async (day, index, array) => {
            await fetchData("Month", mode, scoreType, day.year, day.month);
            if (index === array.length - 1) resolve();
          });
        });
        setIsLoading(false);
      }
      if (timeRange === "Last 30 days") {
        const day = date.getDate();
        let add;
        let month;
        let year;
        for (let i = 30; i >= 0; i -= 2) {
          const prevDate = new Date(date.getTime() - i * (24 * 3600 * 1000));
          year = prevDate.getFullYear();
          month = prevDate.getMonth() + 1;
          if (day - i < 0) {
            add = 30;
          } else {
            add = 0;
          }
          days = [...days, { day: day - i + add, month: month, year: year }];
        }
        setIsLoading(true);
        await new Promise((resolve) => {
          days.forEach(async (day, index, array) => {
            await fetchData(
              "Day",
              mode,
              scoreType,
              day.year,
              day.month,
              day.day
            );
            if (index === array.length - 1) resolve();
          });
        });
        setIsLoading(false);
      }
      if (timeRange === "Last week") {
        const day = date.getDate();
        let add;
        let month;
        let year;
        for (let i = 6; i >= 0; i--) {
          const prevDate = new Date(date.getTime() - i * (24 * 3600 * 1000));
          year = prevDate.getFullYear();
          month = prevDate.getMonth() + 1;
          if (day - i < 0) {
            add = 30;
          } else {
            add = 0;
          }
          days = [...days, { day: day - i + add, month: month, year: year }];
        }
        setIsLoading(true);
        await new Promise((resolve) => {
          days.forEach(async (day, index, array) => {
            await fetchData(
              "Day",
              mode,
              scoreType,
              day.year,
              day.month,
              day.day
            );
            if (index === array.length - 1) resolve();
          });
        });
        setIsLoading(false);
      }
    }
    changeData();
  }, [mode, timeRange, scoreType]);

  async function fetchData(type, mode, scoreType, year, month, day) {
    let path = "";
    if (type === "All time") {
      path = `users/${userCtx.id}/stats/allTime`;
    } else if (type === "Year") {
      path = `users/${userCtx.id}/stats/${year}`;
    } else if (type === "Month") {
      path = `users/${userCtx.id}/stats/${year}.${month}`;
    } else if (type === "Day") {
      path = `users/${userCtx.id}/stats/${year}.${month}.${day}`;
    }
    try {
      //console.log(path);
      const data = await getDoc(doc(db, path));
      const data1 = data?.data();

      if (data1 !== undefined) {
        if (data1.hasOwnProperty(mode)) {
          if (data1[mode].hasOwnProperty(scoreType)) {
            setChartData((prev) => {
              return [...prev, data1[mode][scoreType]];
            });
          } else {
            setChartData((prev) => {
              return [...prev, 0];
            });
          }
        } else {
          setChartData((prev) => {
            return [...prev, 0];
          });
        }
      } else {
        setChartData((prev) => {
          return [...prev, 0];
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  // TIMELINE, HIGHEST/AVEARAGE, MODE
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
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
                <Text style={styles.pickerText}>{scoreType}</Text>
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
                onSelect={() => setScoreType("Highest")}
                text="Highest score"
              />
              <Divider />
              <MenuOption
                onSelect={() => setScoreType("Avarage")}
                text="Avarage score"
              />
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
                onSelect={() => setTimeRange("All time")}
                text="All time"
              />
              <Divider />
              <MenuOption
                onSelect={() => setTimeRange("Last year")}
                text="Last year"
              />
              <Divider />
              <MenuOption
                onSelect={() => setTimeRange("6 months")}
                text="Last 6 months"
              />
              <Divider />
              <MenuOption
                onSelect={() => setTimeRange("3 months")}
                text="Last 3 months"
              />
              <Divider />
              <MenuOption
                onSelect={() => setTimeRange("Last month")}
                text="Last month"
              />
              <Divider />
              <MenuOption
                onSelect={() => setTimeRange("Last week")}
                text="Last week"
              />
            </MenuOptions>
          </Menu>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.titleText}>Preview</Text>
        {!isLoading ? (
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: chartData,
                },
              ],
            }}
            width={Dimensions.get("window").width - 30} // from react-native
            height={300}
            yAxisLabel=""
            yAxisSuffix="p."
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundGradientFrom: Colors.accent300,
              backgroundGradientTo: Colors.accent500,
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "4",
                stroke: Colors.accent700,
              },
              propsForLabels: {
                fontSize: 11,
                fontWeight: "bold",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
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

export default ChooseCharts;

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
  chartContainer: {
    flex: 1,
  },
  titleText: {
    marginTop: 40,
    marginBottom: 20,
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 27,
    fontWeight: "bold",
  },
});
