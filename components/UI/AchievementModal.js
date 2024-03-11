import Colors from "../../constants/colors";
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useAchievements } from "../../store/achivement-context";
import GestureRecognizer from "react-native-swipe-gestures";
import { useTranslation } from "react-i18next";
import Divider from "./Divider.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
const AchievementModal = () => {
  const { achievement, clearAchievement } = useAchievements();
  const [isLoading, setIsLoading] = useState(true);

  const { t } = useTranslation();
  const [newAchivement, setNewAchivement] = useState([]);

  async function fetchAchivements() {
    try {
      if (achievement) {
        for (const achive of achievement) {
          console.log(achive);
          const data = await getDocs(
            query(collection(db, `achivements`), where("short", "==", achive))
          );
          const achivementData = data.docs[0]?.data();
          setNewAchivement((prev) => [...prev, achivementData]);
        }
      }
      
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
  }

  useEffect(() => {
    fetchAchivements();
  }, [achievement]);

  return (
    <>
      <GestureRecognizer
        onSwipeDown={() => {
          clearAchievement();
          setNewAchivement([]);
        }}
      >
        {achievement && !isLoading && (
          <Modal
            visible={!!achievement && !isLoading}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{t("New achivements!")}</Text>
              </View>
              {newAchivement.map((achive) => (
                <>
                  <View style={styles.infoInner}>
                    <View style={styles.topInfo}>
                      <Text style={newAchivement.length <= 5 ? styles.infoTitle:styles.infoTitleS }>{t(achive?.name)}</Text>
                      <Image
                        style={newAchivement.length <= 5 ? styles.img : styles.imgS}
                        source={require("../../assets/icon.png")}
                      />
                    </View>
                    {newAchivement.length <= 5 && (
                      <Text style={styles.infoDescription}>
                        {t(achive?.description)}
                      </Text>
                    )}
                  </View>
                  <Divider />
                </>
              ))}
            </View>
          </Modal>
        )}
      </GestureRecognizer>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingBottom: 40,
  },
  modalView: {
    backgroundColor: Colors.primary500,
    padding: 20,
    alignItems: "center",
    borderRadius: 20,
    marginBottom: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 35,
    fontWeight: "bold",
    color: Colors.accent300,
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  infoInner: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  topInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoDescription: {
    textAlign: "center",
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
  infoTitleS: {
    color: Colors.primary100,
    fontSize: 21,
    fontWeight: "900",
    marginRight: 23,
  },
  imgS: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
});

export default AchievementModal;
