import { PermissionsAndroid, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import AccountHandler from "./AccountHandler";
import APIEndpoints from "./APIEndpoints";
import { capitalizeWords, formatDate3, parseHtmlData } from "../util/Utils";


// This class contains all the functions used for logic and cache handling in the app
class HomeworkHandler {
  // Homework functions //
  static async getAllHomework(accountID) {
    return AccountHandler.parseEcoleDirecte(
      "homework",
      accountID,
      `${AccountHandler.USED_URL}${APIEndpoints.ALL_HOMEWORK(accountID)}`,
      'data={}',
      async (data) => {
        return await this.saveHomework(accountID, data);
      }
    );
  }
  static async saveHomework(accountID, homeworks) {
    var abstractHomework = {
      homeworks: {},
      days: {},
      weeks: {},
      subjectsWithExams: {},
    };

    Object.keys(homeworks).forEach(day => {
      let diff = dayjs(day, "YYYY-MM-DD").diff(dayjs());
      if (diff < 0) { return; }
      
      homeworks[day].forEach(homework => {
        let finalHomework = {
          id: homework.idDevoir,
          subjectID: homework.codeMatiere,
          subjectTitle: capitalizeWords(homework.matiere),
          done: homework.effectue,
          dateFor: day,
          dateGiven: new Date(homework.donneLe),
          isExam: homework.interrogation,
        };

        if (finalHomework.isExam) { // Check if exam is in less than 3 weeks
          let diff = new Date(day) - new Date();
          if (diff >= 0 && diff <= 3 * 7 * 24 * 60 * 60 * 1000) {
            abstractHomework.subjectsWithExams[finalHomework.subjectID] ??= [];
            abstractHomework.subjectsWithExams[finalHomework.subjectID].push(finalHomework.id);
          }
        }
      
        abstractHomework.days[day] ??= [];
        abstractHomework.days[day].push(finalHomework.id);

        // Add homework to corresponding week
        let dateObj = dayjs(day, 'YYYY-MM-DD', 'fr'); // TODO: fix this looking at the formatting of EcoleDirecte homework days

        let startOfWeek = new Date(dateObj);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));

        let endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        let key = `${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}/${endOfWeek.getFullYear()}-${endOfWeek.getMonth() + 1}-${endOfWeek.getDate()}`;
        abstractHomework.weeks[key] ??= {
          "id": key,
          "title": `${formatDate3(key.split("/")[0])}  -  ${formatDate3(key.split("/")[1])}`,
          "data": [],
        };
        if (!abstractHomework.weeks[key].data.includes(day)) { 
          abstractHomework.weeks[key].data.push(day);
        }
        
        abstractHomework.homeworks[finalHomework.id] = finalHomework;
      });
    });

    // Save data
    var cacheData = {};
    const data = await AsyncStorage.getItem("homework");
    if (data) {
      cacheData = JSON.parse(data);
    }
    cacheData[accountID] = {
      data: abstractHomework,
      date: new Date(),
    };
    await AsyncStorage.setItem("homework", JSON.stringify(cacheData));

    return 1;
  }

  // Day-specific functions
  static async getSpecificHomeworkForDay(accountID, day) {
    return AccountHandler.parseEcoleDirecte(
      "specific-homework",
      accountID,
      `${AccountHandler.USED_URL}${APIEndpoints.SPECIFIC_HOMEWORK(accountID, day)}`,
      'data={}',
      async (data) => {
        return await this.saveSpecificHomeworkForDay(accountID, data);
      }
    );
  }
  static async saveSpecificHomeworkForDay(accountID, homeworks) {
    const day = homeworks.date;

    var cacheData = {};
    const data = await AsyncStorage.getItem("specific-homework");
    if (data) { cacheData = JSON.parse(data); }
    cacheData[accountID] ??= {
      homeworks: {},
      days: {},
    };

    homeworks.matieres?.forEach(homework => {
      const finalHomework = {
        id: homework.id,
        givenBy: homework.nomProf,
        todo: parseHtmlData(homework.aFaire?.contenu).trim(),
        sessionContent: parseHtmlData(homework.aFaire?.contenuDeSeance?.contenu).trim(),
        files: homework.aFaire?.documents?.map(document => {
          return {
            id: document.id,
            title: document.libelle,
            size: document.taille,
            fileType: document.type,
          };
        }) ?? [],
      };
      cacheData[accountID].homeworks[homework.id] = finalHomework;
      cacheData[accountID].days[day] ??= { homeworkIDs: [] };
      cacheData[accountID].days[day].homeworkIDs.push(homework.id);
      cacheData[accountID].days[day].date = new Date();
    });

    await AsyncStorage.setItem("specific-homework", JSON.stringify(cacheData));
    return 1;
  }

  // Other
  static async markHomeworkAsDone(accountID, homeworkID, done) {
    const status = await AccountHandler.parseEcoleDirecte(
      "mark-homework-status",
      accountID,
      `${AccountHandler.USED_URL}${APIEndpoints.ALL_HOMEWORK(accountID)}`,
      `data=${JSON.stringify({
        idDevoirsEffectues: done ? [homeworkID] : [],
        idDevoirsNonEffectues: done ? [] : [homeworkID],
      })}`,
      async (data) => {
        const cacheData = JSON.parse(await AsyncStorage.getItem("homework"));
        cacheData[accountID].data.homeworks[homeworkID].done = done;
        await AsyncStorage.setItem("homework", JSON.stringify(cacheData));
        return 1;
      },
      "put",
    );

    return (status == 1) ? done : !done;
  }
  static async downloadHomeworkFile(accountID, file) {
    if (Platform.OS == "android") {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
    }
    
    // Create folder if needed
    if (!(await RNFS.exists(`${RNFS.DocumentDirectoryPath}/files`))) {
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/files`);
    }

    // Check if file already exists
    const localFile = `${RNFS.DocumentDirectoryPath}/files/${file.title}`;
    if (await RNFS.exists(localFile)) {
      console.log(`File ${file.title} already exists, skipping...`);
      return {
        promise: Promise.resolve(),
        localFile,
      };
    }
    
    // Get login token
    const mainAccount = await AccountHandler._getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;

    console.log(`Downloading ${file.title}...`);

    const url = `${AccountHandler.USED_URL}${APIEndpoints.DOWNLOAD_HOMEWORK_ATTACHEMENT(file.id, file.fileType)}&v=4`;

    return {
      promise: RNFS.downloadFile({
        fromUrl: url,
        toFile: localFile,
        headers: { "X-Token": token, "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT },
      }).promise,
      localFile,
    };
  }

  // Helpers
  static async getLastTimeUpdatedHomework(accountID) {
    const data = await AsyncStorage.getItem("homework");
    if (data) {
      const cacheData = JSON.parse(data);
      if (accountID in cacheData) {
        return cacheData[accountID].date;
      }
    }
  }
  static async getSubjectHasExam(accountID) {
    const data = await AsyncStorage.getItem("homework");
    if (data) {
      const cacheData = JSON.parse(data);
      if (accountID in cacheData) {
        return cacheData[accountID].data.subjectsWithExams;
      }
    }
    return {};
  }
}

export default HomeworkHandler;