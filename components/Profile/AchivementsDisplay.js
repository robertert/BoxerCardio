import { View, Pressable, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "../../constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import { Overlay } from "@rneui/base";
import { Image } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useContext } from "react";
import { UserContext } from "../../store/user-context";
import { ActivityIndicator } from "react-native";

const DUMMY_ACHIVEMENT = {
  id: 1,
  name: "Ultra boxer",
  photoUrl: "url",
  description: "1000 punches in 1 week ",
};

const DUMMY_ACHIVEMENTS = [
  [
    {
      id: 1,
      selected: false,
    },
    {
      id: 2,
      selected: false,
    },
    {
      id: 3,
      selected: false,
    },
  ],
  [
    {
      id: 4,
      selected: false,
    },
    {
      id: 5,
      selected: false,
    },
    {
      id: 6,
      selected: false,
    },
  ],
  [
    {
      id: 7,
      selected: false,
    },
    {
      id: 8,
      selected: false,
    },
    {
      id: 9,
      selected: false,
    },
  ],
  [
    {
      id: 10,
      selected: false,
    },
    {
      id: 11,
      selected: false,
    },
    {
      id: 12,
      selected: false,
    },
  ],
];

function AchivementsDisplay() {
  const [selected, setSelected] = useState([]);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [infoAchivement, setInfoAchivement] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const navigation = useNavigation();

  const userCtx = useContext(UserContext);

  useEffect(() => {
    fetchAchivements();
  }, []);

  async function fetchAchivements() {
    setIsLoading(true);
    try {
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      const achivements = data
        .data()
        .achivements.filter((achive) => achive.selected);
      let readyAchivements = [];
      const length = achivements.length;
      for (let i = 0; i < Math.floor(length / 3); i++) {
        readyAchivements.push([
          achivements[3 * i],
          achivements[3 * i + 1],
          achivements[3 * i + 2],
        ]);
      }
      if (length % 3 === 2) {
        readyAchivements.push([
          achivements[length - 2],
          achivements[length - 1],
        ]);
      } else if (length % 3 === 1) {
        readyAchivements.push([achivements[length - 1]]);
      }
      setSelected(readyAchivements);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsError(true);
    }
  }

  function toggleIsVisible() {
    setIsInfoVisible((prev) => !prev);
  }

  function showMoreHandler() {
    navigation.navigate("achivements-display-details");
  }

  function showAchivementInfoHandler(achive) {
    setInfoAchivement((prev) => {
      prev.description = achive.description;
      prev.name = achive.name;
      return { ...prev };
    });
    toggleIsVisible();
  }

  function renderAchivementHandler(itemData) {
    const item = itemData.item;

    return (
      <View style={styles.row}>
        <Pressable
          onLongPress={showAchivementInfoHandler.bind(this, item[0].id)}
        >
          <View style={styles.achivementContainer}>
            <FontAwesome5 name="award" size={50} color="white" />
          </View>
        </Pressable>
        {item.length > 1 ? (
          <Pressable
            onLongPress={showAchivementInfoHandler.bind(this, item[1].id)}
          >
            <View style={styles.achivementContainer}>
              <FontAwesome5 name="award" size={50} color="white" />
            </View>
          </Pressable>
        ) : (
          <View style={styles.achivementContainer}></View>
        )}
        {item.length > 2 ? (
          <Pressable
            onLongPress={showAchivementInfoHandler.bind(this, item[2].id)}
          >
            <View style={styles.achivementContainer}>
              <FontAwesome5 name="award" size={50} color="white" />
            </View>
          </Pressable>
        ) : (
          <View style={styles.achivementContainer}></View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>
      <View style={styles.inner}>
          {!isLoading ? (
            <FlashList
              data={selected}
              renderItem={renderAchivementHandler}
              keyExtractor={(item) => item[0].id}
              estimatedItemSize={120}
              extraData={selected}
              refreshing={refresh}
              onRefresh={() => {
                try {
                  setRefresh(true);
                  setIsError(false);
                  setSelected([]);
                  fetchAchivements();
                  setRefresh(false);
                } catch (e) {
                  console.log(e);
                  setIsError(true);
                }
              }}
              ListFooterComponent={
                isError && (
                  <View style={styles.footerContainer}>
                    <Text style={styles.footerTextTitle}>Error</Text>
                    <Text style={styles.footerText}>
                      There was an error while loading. Please check your
                      internet conection or try again later.
                    </Text>
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
          <Pressable onPress={showMoreHandler}>
            <Text style={styles.moreText}>Press for more details</Text>
          </Pressable>

          <Overlay
            isVisible={isInfoVisible}
            onBackdropPress={toggleIsVisible}
            overlayStyle={styles.infoContainer}
          >
            <View style={styles.infoInner}>
              <View style={styles.topInfo}>
                <Text style={styles.infoTitle}>{infoAchivement.name}</Text>
                <Image
                  style={styles.img}
                  source={require("../../assets/icon.png")}
                />
              </View>

              <Text style={styles.infoDescription}>
                {infoAchivement.description}
              </Text>
            </View>
          </Overlay>
      </View>
    </ScrollView>
  );
}

export default AchivementsDisplay;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  inner: {
    paddingVertical: 20,
    alignItems: "stretch",
  },
  row: {
    marginVertical: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  moreText: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "700",
    color: Colors.primary100,
  },
  achivementContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    width: 100,
  },
  infoContainer: {
    backgroundColor: Colors.primary500,
    borderRadius: 20,
  },
  infoInner: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  topInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoDescription: {
    marginTop: 20,
    color: Colors.primary100,
    fontSize: 18,
    fontWeight: "700",
  },
  infoTitle: {
    color: Colors.primary100,
    fontSize: 26,
    fontWeight: "900",
    marginRight: 23,
  },
  img: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },
  loading: {
    marginTop: 30,
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
  errorText: {
    marginVertical: 20,
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 25,
    marginTop: "50%",
  },
});
