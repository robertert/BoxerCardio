import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

function Header() {
  const [fontsLoaded] = useFonts({
    RubikMono: require("../../assets/fonts/RubikMonoOne-Regular.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <View style={styles.rootContainer} onLayout={onLayoutRootView}>
        <Text style={styles.text}>GYMBOXER</Text>
        <Ionicons name="settings-sharp" size={24} color="white" />
      </View>
    </>
  );
}

export default Header;

const styles = StyleSheet.create({
  rootContainer: {
    paddingTop: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    backgroundColor: Colors.accent500_80,
    width: "100%",
    height: 70,
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: Colors.primary100,
    fontSize: 30,
    
    fontFamily: 'RubikMono',
  },
});
