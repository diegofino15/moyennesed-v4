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

function formatDate(date) {
  if (!date) { return "--"; }
  const previousDate = new Date(date);

  if ((Date.now() - previousDate) < 43200000) {
    return previousDate.toLocaleString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).replace(":", "h");
  }
  return previousDate.toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(":", "h");
}


export { openLink, wait, capitalizeWords, formatDate };