import { View, Pressable, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "../../../constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { ShelfContext } from "../../../store/shelf-context";
import { Overlay } from "@rneui/base";
import { Image } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { UserContext } from "../../../store/user-context";
import { ActivityIndicator } from "react-native-paper";
import { useTranslation } from "react-i18next";


function ChooseAchivements() {
  const shelfContext = useContext(ShelfContext);
  const navigation = useNavigation();

  const [selected, setSelected] = useState([]);
  const [achivementsId, setAchivementsId] = useState([]);
  const [counter, setCounter] = useState(0);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [infoAchivement, setInfoAchivement] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const userCtx = useContext(UserContext);

  const {t} = useTranslation();

  useEffect(() => {
    fetchAchivements();
  }, []);

  useEffect(() => {
    shelfContext.setCounter(counter);
    shelfContext.setAchivements(selected);
  }, [selected]);

  async function fetchAchivements() {
    setIsLoading(true);
    try {
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      const achivements = data.data().achivements;
      console.log(achivements);
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
      //FETCHING COUTER
      const achiveCounter = data.data().achivementsCounter;
      setCounter(achiveCounter);

      setSelected(readyAchivements);

      const idsArr = achivements.map((achive) => {
        return achive.id;
      });
      setAchivementsId(idsArr);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsError(true);
    }
  }

  function selectAchiveHandler(item, col) {
    if (counter === 12 && !item.selected) {
      return;
    }
    if (counter === 1 && item.selected) {
      return;
    }
    setCounter((prev) => {
      if (item.selected) {
        return prev - 1;
      } else {
        return prev + 1;
      }
    });
    setSelected((sel) => {
      const row = Math.floor(achivementsId.indexOf(item.id) / 3);
      sel[row][col].selected = !sel[row][col].selected;
      return [...sel];
    });
  }
  function toggleIsVisible() {
    setIsInfoVisible((prev) => !prev);
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
          onLongPress={showAchivementInfoHandler.bind(this, item[0])}
          onPress={selectAchiveHandler.bind(this, item[0], 0)}
        >
          <View
            style={[
              styles.achivementContainer,
              item[0].selected && styles.selected,
            ]}
          >
            <FontAwesome5 name="award" size={50} color="white" />
          </View>
        </Pressable>
        {item.length > 1 ? (
          <Pressable
            onLongPress={showAchivementInfoHandler.bind(this, item[1])}
            onPress={selectAchiveHandler.bind(this, item[1], 1)}
          >
            <View
              style={[
                styles.achivementContainer,
                item[1].selected && styles.selected,
              ]}
            >
              <FontAwesome5 name="award" size={50} color="white" />
            </View>
          </Pressable>
        ) : (
          <View style={styles.achivementContainer}></View>
        )}
        {item.length > 2 ? (
          <Pressable
            onLongPress={showAchivementInfoHandler.bind(this, item[2])}
            onPress={selectAchiveHandler.bind(this, item[2], 2)}
          >
            <View
              style={[
                styles.achivementContainer,
                item[2].selected && styles.selected,
              ]}
            >
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
    <View style={styles.root}>
      {!isLoading ? (
        <FlashList
          data={selected}
          renderItem={renderAchivementHandler}
          keyExtractor={(item) => item[0].id}
          estimatedItemSize={120}
          extraData={selected}
          ListFooterComponent={
            isError && (
              <View style={styles.footerContainer}>
                <Text style={styles.footerTextTitle}>Error</Text>
                <Text style={styles.footerText}>
                  {t("Error message")}
                </Text>
              </View>
            )
          }
        />
      ) : (
        <ActivityIndicator
          size={"large"}
          color={Colors.accent500}
          style={{ marginTop: 20 }}
        />
      )}
      <Text style={styles.counterText}>{t("{counter} of 12",{counter: counter})}</Text>

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
              source={require("../../../assets/icon.png")}
            />
          </View>
          <Text style={styles.infoDescription}>
            {infoAchivement.description}
          </Text>
        </View>
      </Overlay>
    </View>
  );
}

export default ChooseAchivements;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    paddingVertical: 20,
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
  selected: {
    borderWidth: 2,
    borderColor: "#0cf2fa40",
  },
  counterText: {
    color: Colors.primary100,
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
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
});
