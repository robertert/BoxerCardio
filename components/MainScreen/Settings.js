import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Divider from "../UI/Divider";
import { useState } from "react";
import { useContext } from "react";
import { SettingsContext } from "../../store/settings-context";
import { Overlay } from "@rneui/themed";
import { AntDesign } from "@expo/vector-icons";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { useTranslation } from "react-i18next";

function Settings() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const settingsCtx = useContext(SettingsContext);
  const userCtx = useContext(UserContext);

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const [isAllowedNotifications, setIsAllowedNotification] = useState(
    settingsCtx.allowNotifications
  );
  const [language, setLanguage] = useState(settingsCtx.laguage);
  const [formatedLanguage, setFormatedLanguage] = useState(
    form(settingsCtx.laguage)
  );

  const { t, i18n } = useTranslation();

  function form(lang) {
    if (lang === "en") {
      return "English";
    } else if (lang === "pl") {
      return "Polski";
    }
  }

  function toggleIsVisible() {
    setIsDialogVisible((prev) => !prev);
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function notifiactionAllowedHandler() {
    setIsAllowedNotification((prev) => !prev);
  }

  function languageChangeHandler(gotLanguage) {
    setLanguage(gotLanguage);
    setFormatedLanguage(form(gotLanguage));
    toggleIsVisible();
  }

  async function savePressHandler() {
    i18n.changeLanguage(language);
    settingsCtx.getSettings(isAllowedNotifications,language);
    try {
      await updateDoc(doc(db, `users/${userCtx.id}`), {
        settings: {
          language: language,
          allowNotifications: isAllowedNotifications,
        },
      });
      userCtx.changeMain(true);
      navigation.navigate("mainPage",{refresh: true})
    } catch (e) {
      Alert.alert("Error", t("Error message"));
      console.log(e);
    }
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
      <View style={styles.settingRow}>
        <Text style={styles.text}>{t("Allow notifications: ")}</Text>
        <Switch
          trackColor={{ false: Colors.primary500, true: Colors.accent500_80 }}
          thumbColor={Colors.accent500}
          style={styles.switch}
          value={isAllowedNotifications}
          onValueChange={notifiactionAllowedHandler}
        />
      </View>
      <Divider />
      <Pressable onPress={toggleIsVisible}>
        <View style={styles.settingRow}>
          <Text style={styles.text}>{t("Language: ")}</Text>
          <View style={styles.languageContainer}>
            <Text style={[styles.text, { marginRight: 7 }]}>
              {formatedLanguage}
            </Text>
            <AntDesign name="right" size={24} color="white" />
          </View>
        </View>
      </Pressable>
      <Divider />
      <Pressable onPress={savePressHandler}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>{t("Save")}</Text>
        </View>
      </Pressable>
      <Overlay
        isVisible={isDialogVisible}
        onBackdropPress={toggleIsVisible}
        overlayStyle={styles.dialogContainer}
      >
        <View style={styles.optionsContainer}>
          <Pressable onPress={languageChangeHandler.bind(this, "pl")}>
            <View style={styles.optionContainer}>
              <Text style={styles.dialogOption}>Polski</Text>
            </View>
          </Pressable>
          <Divider />
          <Pressable onPress={languageChangeHandler.bind(this, "en")}>
            <View style={styles.optionContainer}>
              <Text style={styles.dialogOption}>English</Text>
            </View>
          </Pressable>
        </View>
      </Overlay>
    </View>
  );
}

export default Settings;

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
    color: Colors.primary100,
    fontSize: 21,
    fontWeight: "700",
  },
  languageContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  dialogContainer: {
    backgroundColor: Colors.primary500,
    borderRadius: 20,
  },
  dialogOption: {
    marginVertical: 15,
    fontSize: 20,
    color: Colors.primary100,
    marginHorizontal: 10,
    fontWeight: "700",
  },
  optionsContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  optionContainer: {
    flexDirection: "row",
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
});
