import { Linking, Alert } from "react-native";


async function openLink(link) {
  let supported = await Linking.canOpenURL(link);
  if (supported) {
    await Linking.openURL(link);
  } else {
    Alert.alert("Une erreur est survenue lors du lancement de l'URL");
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function capitalizeWords(phrase) {
  return phrase.split(" ").map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(" ");
}


export { openLink, wait, capitalizeWords };