import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../../../constants/colors";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useCallback } from "react";

function TrainingGroup({ name, photoUrl, rank, members }) {
  const [fontsLoaded] = useFonts({
    RubikMono: require("../../../assets/fonts/RubikMonoOne-Regular.ttf"),
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
    <View style={styles.root} onLayout={onLayoutRootView}>
      <Image
        style={styles.image}
        source={require("../../../assets/icon.png")}
      />
      <View style={styles.groupContainer}>
        <Text style={styles.groupTitle}>{name}</Text>
        <View style={styles.groupDetails}>
          <View style={styles.detailsSubcontainer}>
            <Ionicons name="person" size={24} color="white" />
            <Text style={styles.groupDetailsText}>{members}</Text>
          </View>
          <View style={styles.detailsSubcontainer}>
            <MaterialCommunityIcons name="podium" size={24} color="white" />
            <Text style={styles.groupDetailsText}>{rank}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default TrainingGroup;

const styles = StyleSheet.create({
  root: {
    marginVertical: 10,
    height: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 15,
    marginRight: 10,
  },
  groupContainer: {
    flex: 1,
    backgroundColor: Colors.primary400,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  groupDetails: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  groupTitle: {
    color: Colors.primary100,
    fontSize: 20,
    fontFamily: "RubikMono",
  },
  groupDetailsText: {
    marginHorizontal: 10,
    color: Colors.primary100,
    fontSize: 20,
    fontWeight: "800",
  },
  detailsSubcontainer: {
    width: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
