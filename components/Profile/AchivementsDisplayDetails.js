import Colors from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState, useContext } from "react";
import { Overlay } from "@rneui/base";
import { Image } from "react-native";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { SectionList } from "react-native";
import { UserContext } from "../../store/user-context";
import { useTranslation } from "react-i18next";


function AchivementsDisplayDetails() {
  const insets = useSafeAreaInsets();

  const [allAchivements, setAllAchivements] = useState([]);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [infoAchivement, setInfoAchivement] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const navigation = useNavigation();
  const userCtx = useContext(UserContext);

  const {t} = useTranslation();

  useEffect(() => {
    fetchAchivements();
  }, []);

  async function fetchAchivements() {
    setIsLoading(true);
    try {
      //FETCHING UNLOCKED ACHIVEMENTS
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      const achivements = data.data().achivements;
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

      console.log(readyAchivements);
      //FETCHING LOCKED ACHIVEMENTS

      const lockedData = await getDocs(collection(db, "achivements"));
      let lockedArr = [];
      lockedData.forEach((dat) => {
        lockedArr.push({ id: dat.id, ...dat.data() });
      });

      console.log(lockedArr);

      const locked = lockedArr.filter(
        (obj) => !achivements.some((obj2) => obj.id === obj2.id)
      );

      console.log(locked);

      let readyLocked = [];
      const lengthLocked = locked.length;
      for (let i = 0; i < Math.floor(lengthLocked / 3); i++) {
        readyLocked.push([locked[3 * i], locked[3 * i + 1], locked[3 * i + 2]]);
      }
      if (lengthLocked % 3 === 2) {
        readyLocked.push([locked[lengthLocked - 2], locked[lengthLocked - 1]]);
      } else if (lengthLocked % 3 === 1) {
        readyLocked.push([locked[lengthLocked - 1]]);
      }

      setAllAchivements([
        { header: t("Unlocked achivements"), data: readyAchivements },
        { header: t("Locked achivements"), data: readyLocked },
      ]);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsError(true);
    }
  }

  function toggleIsVisible() {
    setIsInfoVisible((prev) => !prev);
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function showAchivementInfoHandler(achive) {
    setInfoAchivement((prev) => {
      prev.description = achive.description;
      prev.name = achive.name;
      return { ...prev };
    });
    toggleIsVisible();
  }

  function renderHeaderHandler({ section: { header } }) {
    return <Text style={styles.sectionHeader}>{header}</Text>;
  }

  function renderAchivementHandler(itemData) {
    const item = itemData.item;

    return (
      <View style={styles.row}>
        <Pressable onLongPress={showAchivementInfoHandler.bind(this, item[0])}>
          <View style={styles.achivementContainer}>
            <FontAwesome5 name="award" size={50} color="white" />
          </View>
        </Pressable>
        {item.length > 1 ? (
          <Pressable
            onLongPress={showAchivementInfoHandler.bind(this, item[1])}
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
            onLongPress={showAchivementInfoHandler.bind(this, item[2])}
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
      </View>
      <View style={styles.inner}>
        {!isLoading ? (
          <SectionList
            renderSectionHeader={renderHeaderHandler}
            sections={allAchivements}
            renderItem={renderAchivementHandler}
            keyExtractor={(item) => item[0].id}
            extraData={allAchivements}
            refreshing={refresh}
            onRefresh={() => {
              try {
                setRefresh(true);
                setIsError(false);
                setAllAchivements([]);
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
                    {t("Error message")}
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

        <Overlay
          isVisible={isInfoVisible}
          onBackdropPress={toggleIsVisible}
          overlayStyle={styles.infoContainer}
        >
          <View style={styles.infoInner}>
            <View style={styles.topInfo}>
              <Text style={styles.infoTitle}>{t(infoAchivement.name)}</Text>
              <Image
                style={styles.img}
                source={require("../../assets/icon.png")}
              />
            </View>

            <Text style={styles.infoDescription}>
              {t(infoAchivement.description)}
            </Text>
          </View>
        </Overlay>
      </View>
    </View>
  );
}

export default AchivementsDisplayDetails;

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
  inner: {
    flex: 1,
    paddingVertical: 20,
    alignItems: "stretch",
  },
  row: {
    marginVertical: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
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
  sectionHeader: {
    textAlign: "center",
    color: Colors.primary100,
    fontWeight: "bold",
    fontSize: 25,
    marginBottom:60,
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
