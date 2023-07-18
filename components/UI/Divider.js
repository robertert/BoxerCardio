import { StyleSheet,View } from "react-native";
import Colors from "../../constants/colors";

function Divider() {
    return <View style={styles.divider}></View>;
  }

export default Divider;

const styles = StyleSheet.create({
    divider: {
        backgroundColor: Colors.primary100_30,
        width: "100%",
        height: 1,
      },
})
  