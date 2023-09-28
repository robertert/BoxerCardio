import { View, Text, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useCallback } from "react";

function Header({ settings, back, onPress }) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  function settingsHandler() {
    navigation.navigate("settings");
  }

  const [fontsLoaded] = useFonts({
    RubikMono: require("../../assets/fonts/RubikMonoOne-Regular.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <>
      {fontsLoaded ? (
        <View
          style={[
            styles.rootContainer,
            { paddingTop: insets.top + 10, height: 55 + insets.top },
          ]}
          onLayout={onLayoutRootView}
        >
          <Text style={styles.text}>GYMBOXER</Text>
          {back && (
            <Pressable
              onPress={onPress}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons name="chevron-back-outline" size={24} color="white" />
            </Pressable>
          )}
          {settings && (
            <Pressable onPress={settingsHandler}>
              <Ionicons name="settings-sharp" size={24} color="white" />
            </Pressable>
          )}
        </View>
      ) : (
        <View></View>
      )}
    </>
  );
}

export default Header;

const styles = StyleSheet.create({
  rootContainer: {
    paddingHorizontal: 15,
    flexDirection: "row",
    backgroundColor: Colors.accent700,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 5,
  },
  text: {
    color: Colors.primary100,
    fontSize: 30,

    fontFamily: "RubikMono",
  },
  pressed: {
    opacity: 0.5,
  },
});
