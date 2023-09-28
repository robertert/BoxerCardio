import { View,TextInput,Text,StyleSheet,Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

function Settings(){

    const insets = useSafeAreaInsets();
    
    const navigation = useNavigation();

    function goBackHandler(){
        navigation.goBack();
    }

    return <View style={[styles.root,{paddingTop: insets.top ,paddingBottom: insets.bottom}]}>
      <View style={styles.header}>
        <Pressable onPress={goBackHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
      </View>
    </View>
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

})