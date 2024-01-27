import { Linking, Alert } from "react-native";


async function openLink(link) {
  let supported = await Linking.canOpenURL(link);
  if (supported) {
    await Linking.openURL(link);
  } else {
    Alert.alert("Une erreur est survenue lors du lancement de l'URL");
  }
}

export { openLink };