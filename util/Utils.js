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

const daysNames = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
const monthsNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
function formatDate2(givenDate) {
  const date = new Date(givenDate);
  return `${daysNames[date.getDay()]} ${date.getDate()} ${monthsNames[date.getMonth()]}`;
}

function formatAverage(average, decimals=true) {
  if (!average) { return "--"; }
  if (decimals) { return average.toFixed(2).replace('.', ','); }
  return (Math.round(average * 100) / 100).toString().replace('.', ',');
}

function formatMark(mark) {
  if (mark.valueOn == 20) { return mark.valueStr; }
  return `${mark.valueStr}/${mark.valueOn}`;
}

function getLatestDate(date1, date2) {
  // Compare two date objects and return the latest
  if (date1 > date2) { return date1; }
  return date1;
}

export { openLink, wait, capitalizeWords, formatDate, formatDate2, formatAverage, formatMark, getLatestDate };