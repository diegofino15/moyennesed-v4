import { Linking, Alert } from "react-native";
import { htmlToText } from "html-to-text";
var Buffer = require('buffer/').Buffer;


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
function formatDate3(givenDate, date) {
  date ??= new Date(givenDate);
  return `${date.getDate()} ${monthsNames[date.getMonth()]}`;
}

function formatAverage(average, decimals=true) {
  if (!average) { return "--"; }
  if (decimals) { return average.toFixed(2).replace('.', ','); }
  return (Math.round(average * 100) / 100).toString().replace('.', ',');
}

function formatMark(mark, isClass=false) {
  if (!isClass) {
    if (mark.valueOn == 20) { return mark.valueStr; }
    return `${mark.valueStr}/${mark.valueOn}`;
  } else {
    if (mark.valueOn == 20) { return `${mark.classValue}`.replace(".", ","); }
    return `${mark.classValue}/${mark.valueOn}`.replace(".", ",");
  }
}

function getLatestDate(date1, date2) {
  // Compare two date objects and return the latest
  if (date1 > date2) { return date1; }
  return date1;
}

function asyncExpectedResult(func, onFinish, expectedResult) {
  expectedResult();
  func().then(onFinish);
}

function parseHtmlData(data) {
  if (!data) { return ""; }
  let binaryData = Buffer.from(data, 'base64').toString('binary');
  let utf8Data = decodeURIComponent(escape(binaryData));
  return htmlToText(utf8Data);
}

export { openLink, wait, capitalizeWords, formatDate, formatDate2, formatDate3, formatAverage, formatMark, getLatestDate, asyncExpectedResult, parseHtmlData };