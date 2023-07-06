import { ScrollView, Text, View, StyleSheet, FlatList } from "react-native";
import Colors from "../../constants/colors";
import { SocialIcon } from "@rneui/themed";

function Share() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>Share</Text>
      <ScrollView horizontal={true}>
        <SocialIcon type="facebook" iconSize={30} style={styles.icon} />
        <SocialIcon type="instagram" iconSize={30} style={styles.icon} />
        <SocialIcon type="pinterest" iconSize={30} style={styles.icon} />
        <SocialIcon type="whatsapp" iconSize={30} style={styles.icon} />
        <SocialIcon type="twitter" iconSize={30} style={styles.icon} />
        <SocialIcon type="linkedin" iconSize={30} style={styles.icon} />
        <SocialIcon type="reddit" iconSize={30} style={styles.icon} />
      </ScrollView>
    </View>
  );
}

export default Share;

const styles = StyleSheet.create({
  text: {
    fontSize: 25,
    color: Colors.primary100,
    fontWeight: "700",
    marginBottom: 10,
  },
  root: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    height: 150,
    width: "100%",
    backgroundColor: Colors.primary400,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  icon: {
    marginHorizontal: 15,
  },
});
