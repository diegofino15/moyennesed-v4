import { Linking, Alert } from "react-native";
import { htmlToText } from "html-to-text";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

var Buffer = require('buffer/').Buffer;


async function openLink(link: string) {
  let supported = await Linking.canOpenURL(link);
  if (supported) {
    await Linking.openURL(link);
  } else {
    Alert.alert("Une erreur est survenue lors du lancement de l'URL");
  }
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function capitalizeWords(phrase: string): string {
  return phrase.split(" ").map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(" ");
}

function formatDate(date: string): string {
  if (!date) { return "--"; }
  const previousDate: Date = new Date(date);

  if ((Date.now() - previousDate.valueOf()) < 12 * 60 * 60 * 1000) {
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
function formatDate2(givenDate: string, tellIfNear: boolean = false, isFrLocale: boolean = false): string {
  var date: Date;
  if (isFrLocale) {
    date = dayjs(givenDate, "YYYY-MM-DD", "fr").toDate();
  } else {
    date = new Date(givenDate);
  }

  if (tellIfNear) {
    const now = new Date();
    if (date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth()) {
      if (date.getDate() == now.getDate()) {
        return "Aujourd'hui";
      } else if (date.getDate() == now.getDate() + 1) {
        return "Demain";
      }
    }
  }

  return `${daysNames[date.getDay()]} ${date.getDate()} ${monthsNames[date.getMonth()]}`;
}
function formatDate3(givenDate: string | null, date: null | Date, tellIfNear: boolean = false): string {
  date ??= new Date(givenDate);

  if (tellIfNear) {
    const now = new Date();
    if (date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth()) {
      if (date.getDate() == now.getDate()) {
        return "Aujourd'hui";
      } else if (date.getDate() == now.getDate() + 1) {
        return "Demain";
      }
    }
  }

  return `${date.getDate()} ${monthsNames[date.getMonth()]}`;
}
function dateDiff(date1: Date, date2: Date): string {
  const diff = date1.valueOf() - date2.valueOf();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${hours}h${minutes}m`;
}

function formatAverage(average: number, decimals: boolean =true): string {
  if (!average) { return "--"; }
  if (decimals) { return average.toFixed(2).replace('.', ','); }
  return (Math.round(average * 100) / 100).toString().replace('.', ',');
}

function formatMark(mark: { valueStr: string, classValue: number, valueOn: number }, isClass: boolean =false): string {
  if (!isClass) {
    if (mark.valueOn == 20 || mark.valueOn == 0) { return mark.valueStr; }
    if (!mark.valueStr) { return `--`; }
    return `${mark.valueStr}/${mark.valueOn}`;
  } else {
    if (mark.valueOn == 20) { return `${mark.classValue}`.replace(".", ","); }
    return `${mark.classValue}/${mark.valueOn}`.replace(".", ",");
  }
}

function getLatestDate(date1: Date, date2: Date): Date {
  if (date1 > date2) { return date1; }
  return date1;
}

function asyncExpectedResult(func: any, onFinish: any, expectedResult: any) {
  expectedResult();
  func().then(onFinish);
}

function parseHtmlData(data: any): string {
  if (!data) { return ""; }
  let binaryData = Buffer.from(data, 'base64').toString('binary');
  let utf8Data = decodeURIComponent(escape(binaryData));
  return htmlToText(utf8Data);
}

function normalizeString(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

export { openLink, wait, capitalizeWords, formatDate, formatDate2, formatDate3, dateDiff, formatAverage, formatMark, getLatestDate, asyncExpectedResult, parseHtmlData, normalizeString, hashString };