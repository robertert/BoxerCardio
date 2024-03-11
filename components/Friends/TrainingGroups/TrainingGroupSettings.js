import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useContext } from "react";
import { UserContext } from "../../../store/user-context";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function TrainingGroupSettings({ route }) {
  const sett = route.params.settings;
  const id = route.params.id;

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const userCtx = useContext(UserContext);

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    isAllowedMembersInvitations: true,
  });
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    setIsAllowed(sett.isAllowedMembersInvitations);
    setSettings(sett);
  }, []);
  async function saveSettingsHandler() {
    setIsLoading(true);
    try {
      const data = await getDoc(doc(db, `trainingGroups/${id}`));
      const members = data.data().members;
      await runTransaction(db, async (transaction) => {
        let pendingWrites = [];
        for (const member of members) {
          const docRef = doc(db, `users/${member.id}`);
          const user = await transaction.get(docRef);
          let userSettings = user.data().permissions;
          if (
            settings.isAllowedMembersInvitations &&
            userSettings.filter(
              (perm) => perm.id === id && perm.type === "invitations"
            ).length === 0
          ) {
            userSettings = [...userSettings, { id: id, type: "invitations" }];
          } else if (!settings.isAllowedMembersInvitations) {
            userSettings = userSettings.filter(
              (permission) =>
                permission.id !== id || permission.type !== "invitations"
            );
          }

          pendingWrites.push((t) =>
            t.update(docRef, { permissions: userSettings })
          );
        }
        for(write of pendingWrites){
          write(transaction);
        }
        transaction.update(doc(db, `trainingGroups/${id}`), {
          settings: settings,
        });
      });

      
      setIsLoading(false);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", t("Error message"));
      console.log(e);
    }
  }
  function goBackHandler() {
    navigation.goBack();
  }

  function invitationChangeHandler() {
    setIsAllowed((prev) => !prev);
    setSettings((prev) => {
      prev.isAllowedMembersInvitations = !prev.isAllowedMembersInvitations;
      return prev;
    });
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
      {!isLoading ? (
        <>
          <View style={styles.settingRow}>
            <Text style={styles.text}>
              {t("Allow group members to invite new members")}
            </Text>
            <Switch
              trackColor={{
                false: Colors.primary500,
                true: Colors.accent500_80,
              }}
              thumbColor={Colors.accent500}
              style={styles.switch}
              value={isAllowed}
              onValueChange={invitationChangeHandler}
            />
          </View>
          <Pressable onPress={saveSettingsHandler}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>{t("Save")}</Text>
            </View>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator
          size={"large"}
          color={Colors.accent500}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

export default TrainingGroupSettings;

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
  buttonContainer: {
    marginTop: 30,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: Colors.accent700,
    height: 60,
    width: 160,
    borderRadius: 20,
  },
  buttonText: {
    color: Colors.primary100,
    fontSize: 22,
    fontWeight: "700",
  },
  switch: {
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
  },
  settingRow: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    width: "100%",
  },
  text: {
    width: 280,
    color: Colors.primary100,
    fontSize: 23,
    fontWeight: "700",
  },
});
