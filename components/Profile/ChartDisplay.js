import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { Dimensions } from "react-native";
import Colors, { timeModes } from "../../constants/colors";
import { LineChart } from "react-native-chart-kit";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import GestureRecognizer from "react-native-swipe-gestures";
import { useTranslation } from "react-i18next";

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
const DUMMY_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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

function ChartDisplay({ route }) {
  const [chartData, setChartData] = useState([1, 2]);
  const [isLoading, setIsLoading] = useState(true);
  const [labels, setLabels] = useState(["test", "YEst"]);
  const [propsDisplay, setPropsDisplay] = useState({});
  const [ySuffix,setYSuffix]  = useState("");

  const navigation = useNavigation();

  const date = new Date();

  const id = route.params.id;

  const {t} = useTranslation();

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setIsLoading(true);
    const props = await fetchChartProps();
    setPropsDisplay(props);
    await fetchLabels(props);
    await changeData(props);
    setIsLoading(false);
  }

  async function fetchLabels(chartProps) {
    setLabels([]);
    if (chartProps.timeRange === "6 months") {
      const month = date.getMonth();
      let add = 0;
      for (let i = 5; i >= 0; i--) {
        setLabels((prev) => {
          if (month - i < 0) {
            add = 12;
          } else {
            add = 0;
          }
          return [...prev, t(DUMMY_MONTHS_SHORT[month - i + add])];
        });
      }
    }
    if (chartProps.timeRange === "This year") {
      const month = date.getMonth();
      let add;
      for (let i = 11; i >= 0; i -= 2) {
        setLabels((prev) => {
          if (month - i < 0) {
            add = 12;
          } else {
            add = 0;
          }
          return [...prev, t(DUMMY_MONTHS_SHORT[month - i + add])];
        });
      }
    }
    if (chartProps.timeRange === "All time") {
      const year = date.getFullYear();
      for (let i = 5; i >= 0; i--) {
        setLabels((prev) => [...prev, year - i]);
      }
    }
    if (chartProps.timeRange === "3 months") {
      const month = date.getMonth();
      let add = 0;
      for (let i = 2; i >= 0; i--) {
        setLabels((prev) => {
          if (month - i < 0) {
            add = 12;
          } else {
            add = 0;
          }
          return [...prev, t(DUMMY_MONTHS[month - i + add])];
        });
      }
    }
    if (chartProps.timeRange === "30 days") {
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
    if (chartProps.timeRange === "This week") {
      const day = date.getDay();
      let add;
      for (let i = 6; i >= 0; i--) {
        setLabels((prev) => {
          if (day - i < 0) {
            add = 7;
          } else {
            add = 0;
          }
          return [...prev, t(DUMMY_WEEKDAYS[day - i + add])];
        });
      }
    }
  }

  //FETCHING DATA

  async function changeData(chartProps) {
    let days = [];
    setChartData([]);
    if (chartProps.timeRange === "6 months") {
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
          await fetchData(
            "Month",
            chartProps.mode,
            chartProps.scoreType,
            day.year,
            day.month
          );
          if (index === array.length - 1) resolve();
        });
      });
      setIsLoading(false);
    }

    if (chartProps.timeRange === "This year") {
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
          await fetchData(
            "Month",
            chartProps.mode,
            chartProps.scoreType,
            day.year,
            day.month
          );
          if (index === array.length - 1) resolve();
        });
      });
      setIsLoading(false);
    }
    if (chartProps.timeRange === "All time") {
      const year = date.getFullYear();
      for (let i = 5; i >= 0; i--) {
        days = [...days, year - i];
      }
      setIsLoading(true);
      await new Promise((resolve) => {
        days.forEach(async (day, index, array) => {
          await fetchData("Year", chartProps.mode, chartProps.scoreType, day);
          if (index === array.length - 1) resolve();
        });
      });
      setIsLoading(false);
    }
    if (chartProps.timeRange === "3 months") {
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
          await fetchData(
            "Month",
            chartProps.mode,
            chartProps.scoreType,
            day.year,
            day.month
          );
          if (index === array.length - 1) resolve();
        });
      });
      setIsLoading(false);
    }
    if (chartProps.timeRange === "30 days") {
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
            chartProps.mode,
            chartProps.scoreType,
            day.year,
            day.month,
            day.day
          );
          if (index === array.length - 1) resolve();
        });
      });
      setIsLoading(false);
    }
    if (chartProps.timeRange === "This week") {
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
            chartProps.mode,
            chartProps.scoreType,
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

  async function fetchData(type, mode, scoreType, year, month, day) {
    let path = "";
    if (type === "All time") {
      path = `users/${id}/stats/allTime`;
    } else if (type === "Year") {
      path = `users/${id}/stats/${year}`;
    } else if (type === "Month") {
      path = `users/${id}/stats/${year}:${month}`;
    } else if (type === "Day") {
      path = `users/${id}/stats/${year}:${month}:${day}`;
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

  async function fetchChartProps() {
    try {
      const data = await getDoc(doc(db, `users/${id}`));
      const props = data.data().chartProps;
      return props;
    } catch (e) {
      console.log(e);
    }
  }
  function formatYAxis(score) {
    let scr = score;
    if (timeModes.filter((tMode) => tMode === propsDisplay.mode).length > 0) {
      setYSuffix("");
      if (score > 3600) {
        const hours = Math.floor(score / 3600);
        let min, sec;
        if (Math.floor((score % 3600) / 60) === 0) {
          min = "00";
        } else if (Math.floor((score % 3600) / 60) < 10) {
          min = `0${Math.floor((score % 3600) / 60)}`;
        } else {
          min = Math.floor((score % 3600) / 60);
        }
        if (score % 60 === 0) {
          sec = "00";
        } else if (score % 60 < 10) {
          sec = `0${score % 60}`;
        } else {
          sec = score % 60;
        }
        scr = `${hours}:${min}:${sec}`;
      } else if (score > 60) {
        let min, sec;
        if (Math.floor((score % 3600) / 60) === 0) {
          min = "00";
        } else {
          min = Math.floor((score % 3600) / 60);
        }
        if (score % 60 === 0) {
          sec = "00";
        } else if (score % 60 < 10) {
          sec = `0${score % 60}`;
        } else {
          sec = score % 60;
        }
        scr = `${min}:${sec}`;
      } else if (score > 0) {
        scr = `00:${score}`;
      }
      if(score == 0){
        scr = "0:00";
      }
    }
    else{
      setYSuffix("p.");
    }
    return scr;
  }


  function moreHandler() {
    navigation.navigate("chart-display-details", { id: id });
  }

  return (
    <View style={styles.root}>
      <GestureRecognizer onSwipeDown={fetchAllData}>
        {!isLoading ? (
          <>
            <Text
              style={styles.topText}
            >{`${propsDisplay.mode}   ${t(propsDisplay.scoreType)}   ${t(propsDisplay.timeRange)}`}</Text>
            <LineChart
              data={{
                labels: [...labels],
                datasets: [
                  {
                    data: chartData,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 30} // from react-native
              height={240}
              yAxisLabel=""
              yAxisSuffix={ySuffix}
              formatYLabel={formatYAxis}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundGradientFrom: Colors.accent300,
                backgroundGradientTo: Colors.accent500,
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: Colors.accent700,
                },
              }}
              bezier
              style={{
                marginTop: 20,
                marginBottom: 40,
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </>
        ) : (
          <ActivityIndicator
            size={"large"}
            color={Colors.accent500}
            style={{ marginTop: 20 }}
          />
        )}
        <Pressable onPress={moreHandler}>
          <Text style={styles.moreText}>{t("Press for more details")}</Text>
        </Pressable>
      </GestureRecognizer>
    </View>
  );
}

export default ChartDisplay;

const styles = StyleSheet.create({
  root: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: Colors.primary700,
    alignItems: "center",
  },
  moreText: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "700",
    color: Colors.primary100,
  },
  topText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary100,
    opacity: 0.8
  },
});
