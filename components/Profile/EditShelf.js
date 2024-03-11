import { View, StyleSheet, Text, Pressable, Alert } from "react-native";
import Colors from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { db } from "../../firebaseConfig";
import ChooseAchivements from "./Shelf/ChooseAchivement";
import ChooseCharts from "./Shelf/ChoseChart";
import { useContext } from "react";
import { ShelfContext } from "../../store/shelf-context";
import { updateDoc,doc } from "firebase/firestore";
import { UserContext } from "../../store/user-context";
import { useTranslation } from "react-i18next";

function EditShelf() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const Tab = createMaterialTopTabNavigator();

  const shelfContext = useContext(ShelfContext);
  const userCtx = useContext(UserContext);

  const {t} = useTranslation();

  function goBackHandler() {
    navigation.goBack();
  }

  async function saveHandler(){
    try {
      await updateDoc(doc(db,`users/${userCtx.id}`),{
        achivementsCounter: shelfContext.counter?shelfContext.counter:0,
        achivements: shelfContext.achivements?shelfContext.achivements:[],
        chartProps: shelfContext.chartProps,
      })
    } catch (e) {
      Alert.alert("Error",t("Error message"))
      console.log(e);
    }
    
    navigation.goBack();
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
      <View style={styles.tabContainer}>
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: false,
            tabBarIconStyle: { height: 60, width: 60 },
            tabBarStyle: { backgroundColor: Colors.primary700, height: 60 },
            tabBarIndicatorStyle: { backgroundColor: Colors.primary100 },
          }}
        >
          <Tab.Screen
            name="charts"
            component={ChooseCharts}
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    height: 60,
                    width: 60,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AntDesign
                    style={{ bottom: 10 }}
                    name="barschart"
                    size={40}
                    color={focused ? Colors.primary100 : Colors.primary100_30}
                  />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="achivements"
            component={ChooseAchivements}
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    height: 60,
                    width: 60,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    style={{ bottom: 10 }}
                    name="trophy-sharp"
                    size={38}
                    color={focused ? Colors.primary100 : Colors.primary100_30}
                  />
                </View>
              ),
            }}
          />
        </Tab.Navigator>
        <Pressable onPress={saveHandler}>
        <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>{t("Save")}</Text>
        </View>
      </Pressable>
      </View>
    </View>
  );
}

export default EditShelf;

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
  tabContainer: {
    width: "100%",
    flex: 1,
  },
  buttonContainer: {
    height: 50,
    width: 150,
    backgroundColor: Colors.accent500,
    borderRadius: 25,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40
  },
  buttonText: {
    color: Colors.primary100,
    fontSize: 23,
    fontWeight: "800",
  },
});
