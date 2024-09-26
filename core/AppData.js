import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import { capitalizeWords, formatDate3, getLatestDate, parseHtmlData } from "../util/Utils";
import ColorsHandler from "./ColorsHandler";
import CoefficientHandler from "./CoefficientHandler";


// This enum contains all the endpoints of the api used in the app
class APIEndpoints {
  static OFFICIAL_API = "https://api.ecoledirecte.com";
  static CUSTOM_API = process.env.EXPO_PUBLIC_API_URL;

  static LOGIN = "/v3/login.awp";
  static MARKS(accountID) { return `/v3/eleves/${accountID}/notes.awp`; };
  static ALL_HOMEWORK(accountID) { return `/v3/Eleves/${accountID}/cahierdetexte.awp`; }
  static SPECIFIC_HOMEWORK(accountID, day) { return `/v3/Eleves/${accountID}/cahierdetexte/${day}.awp`; }
  static DOWNLOAD_HOMEWORK_ATTACHEMENT(fileID, fileType) { return `/v3/telechargement.awp?verbe=get&fichierId=${fileID}&leTypeDeFichier=${fileType}`; }
}


// This class contains all the functions used for logic and cache handling in the app
class AppData {
  // Base URL
  static USED_URL = APIEndpoints.OFFICIAL_API;

  // Login functions //

  // Helper, needed to open security question popup whenever needed
  static openDoubleAuthPopup = null;
  static wantToOpenDoubleAuthPopup = false;
  static temporaryLoginToken = "";

  // Helper, needed to inform the user that guess parameters have been set automatically
  static showGuessParametersWarning = null;

  // Login
  static async login(username, password) {
    // Demo account
    this.USED_URL = APIEndpoints.OFFICIAL_API;
    if (username.substring(0, 11) == "demoaccount") {
      this.USED_URL = APIEndpoints.CUSTOM_API;
      console.log("Using custom API");
    }

    console.log(`Logging-in ${username}...`);

    // Get double auth tokens
    var cn = ""; var cv = "";
    const doubleAuthTokens = await AsyncStorage.getItem("double-auth-tokens");
    if (doubleAuthTokens) {
      let data = JSON.parse(doubleAuthTokens);
      cn = data.cn;
      cv = data.cv;
    }

    const credentials = {
      identifiant: encodeURIComponent(username.trim()),
      motdepasse: encodeURIComponent(password.trim()),
      
      // Double auth
      fa: [
        {
          cn,
          cv,
        }
      ],
    };
    var response = await axios
      .post(
        `${this.USED_URL}${APIEndpoints.LOGIN}?v=4`,
        `data=${JSON.stringify(credentials)}`,
        { headers: { "Content-Type": "text/plain" } },
      )
      .catch((error) => {
        console.warn(`An error occured while logging in : ${error}`);
      });
    response ??= { status: 500 };

    var status = 0; // 1 = success | 2 = choose account | 3 = security question | 0 = wrong password | -1 = error
    switch (response.status) {
      case 200:
        console.log("API request successful");
        AsyncStorage.setItem("logs-login", JSON.stringify(response.data));
        switch (response.data.code) {
          case 200:
            await this._saveConnectedAccounts(
              response.data.data,
              response.data.token,
            );
            status = 1;
            if (response.data.data.accounts.length != 1) {
              let alreadySavedPreference =
                await AsyncStorage.getItem("selectedAccount");
              if (!alreadySavedPreference || alreadySavedPreference == 0) {
                status = 2;
              }
            } else {
              await this.saveSelectedAccount(response.data.data.accounts[0].id);
            }
            await AsyncStorage.setItem(
              "credentials",
              JSON.stringify({
                username: username,
                password: password,
              }),
            );
            console.log("Login successful !");
            break;
          case 250: // Need to confirm identity with security question
            await AsyncStorage.setItem(
              "credentials",
              JSON.stringify({
                username: username,
                password: password,
              }),
            );
            this.temporaryLoginToken = response.data.token;
            if (this.openDoubleAuthPopup) { this.openDoubleAuthPopup(); }
            else { this.wantToOpenDoubleAuthPopup = true; }
            console.log("Need to confirm identity...");
            status = 0;
            break;
          case 505: // Wrong password
            console.log(`Couldn't connect, wrong password for ${username}`);
            break;
          default:
            console.warn(
              `API responded with unknown code ${response.data.code}`,
            );
            status = -1;
            break;
        }
        break;
      default:
        console.warn("API request failed");
        status = -1;
        break;
    }

    return status;
  }
  // Refresh token
  static async refreshLogin() {
    const credentials = JSON.parse(await AsyncStorage.getItem("credentials"));
    const status = await this.login(credentials.username, credentials.password);
    return status == 1;
  }
  // Save all data from ÉcoleDirecte to cache
  static async _saveConnectedAccounts(loginData, token) {
    var connectedAccounts = {};
    const supportedAccountTypes = ["E", "1"] // Student and parent

    // Loop trough connected accounts
    for (const account of loginData.accounts) {
      let ID = `${account.id}`;
      if (!supportedAccountTypes.includes(`${account.typeCompte}`)) {
        console.warn(`Unsupported account type : ${account.typeCompte}`);
        continue;
      }
      let accountType = account.typeCompte == "E" ? "E" : "P"; // E = student | 1 = parent
      let firstName = capitalizeWords(account.prenom);
      let lastName = account.nom.toUpperCase();
      let gender;

      // Student account
      if (accountType == "E") {
        gender = account.profile.sexe;
        let school = capitalizeWords(account.profile.nomEtablissement);
        let grade = capitalizeWords(account.profile.classe?.libelle ?? "Pas de classe");
        let photoURL = account.profile.photo;

        connectedAccounts[ID] = {
          id: ID,
          connectionToken: token,
          accountType: accountType,
          firstName: firstName,
          lastName: lastName,
          gender: gender,
          school: school,
          grade: grade,
          photoURL: photoURL,
        };
      } else {
        // Parent account
        gender = account.civilite == "M." ? "M" : "F";
        let children = {};

        // Add children accounts
        for (const childAccount of account.profile.eleves) {
          let childID = `${childAccount.id}`;
          let childFirstName = capitalizeWords(childAccount.prenom);
          let childLastName = childAccount.nom.toUpperCase();
          let childGender = childAccount.sexe;
          let childSchool = capitalizeWords(childAccount.nomEtablissement);
          if (childSchool.length == 0) {
            childSchool = account.nomEtablissement;
          }
          let grade = capitalizeWords(childAccount.classe?.libelle ?? "Pas de classe");
          let childPhotoURL = childAccount.photo;

          children[childID] = {
            id: childID,
            firstName: childFirstName,
            lastName: childLastName,
            gender: childGender,
            school: childSchool,
            grade: grade,
            photoURL: childPhotoURL,
          };
        }

        connectedAccounts[ID] = {
          id: ID,
          connectionToken: token,
          accountType: accountType,
          firstName: firstName,
          lastName: lastName,
          gender: gender,
          children: children,
        };
      }
    }

    // Save data
    await AsyncStorage.setItem("accounts", JSON.stringify(connectedAccounts));
  }
  // One for most users, needed for ones with more than one account connected
  static async saveSelectedAccount(accountID) {
    await AsyncStorage.setItem("selectedAccount", `${accountID}`);
  }

  // Util functions //

  // One for most users, needed for ones with more than one account connected
  static async _getSelectedAccount() {
    var selectedAccount = await AsyncStorage.getItem("selectedAccount");
    if (selectedAccount) {
      return selectedAccount;
    }
    var accounts = JSON.parse(await AsyncStorage.getItem("accounts"));
    accounts ??= { 0: {} };
    selectedAccount = Object.keys(accounts)[0];
    await AsyncStorage.setItem("selectedAccount", selectedAccount);
    return selectedAccount;
  }
  // Get the main account
  static async getMainAccount() {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));
    const selectedAccount = await this._getSelectedAccount();
    return accounts && selectedAccount ? accounts[selectedAccount] : null;
  }
  // Get specific account, used for children on parent accounts
  static async getSpecificAccount(accountID) {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));

    // For student accounts
    if (accountID in accounts) {
      return accounts[accountID];
    }

    // For parent accounts
    for (const account_ in accounts) {
      const account = accounts[account_];
      if (account.accountType == "P") {
        if (accountID in account.children) {
          return account.children[accountID];
        }
      }
    }
  }
  // Get main account of any account, used to get login tokens from children accounts
  static async _getMainAccountOfAnyAccount(accountID) {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));

    // For student accounts
    if (accountID in accounts) {
      return accounts[accountID];
    }

    // For parent accounts
    for (const account_ in accounts) {
      const account = accounts[account_];
      if (account.accountType == "P") {
        if (accountID in account.children) {
          return account;
        }
      }
    }
  }
  // Child account
  static async setSelectedChildAccount(accountID) {
    await AsyncStorage.setItem("selectedChildAccount", `${accountID}`);
  }
  static async getSelectedChildAccount() {
    return await AsyncStorage.getItem("selectedChildAccount");
  }

  // Marks functions //

  // Get marks
  static async getMarks(accountID) {
    return this.parseEcoleDirecte(
      "marks",
      accountID,
      `${this.USED_URL}${APIEndpoints.MARKS(accountID)}`,
      'data={"anneeScolaire": ""}',
      async (data) => {
        return await this.saveMarks(accountID, data);
      }
    );
  }
  // Update login token
  static async _updateToken(accountID, newToken) {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));

    // For student accounts
    if (accountID in accounts) {
      accounts[accountID].connectionToken = newToken;
      await AsyncStorage.setItem("accounts", JSON.stringify(accounts));
      return;
    }

    // For parent accounts
    for (const account_ in accounts) {
      const account = accounts[account_];
      if (account.accountType == "P") {
        if (accountID in account.children) {
          account.connectionToken = newToken;
          await AsyncStorage.setItem("accounts", JSON.stringify(accounts));
          return;
        }
      }
    }
  }
  // Save marks data to cache
  static async saveMarks(accountID, marks) {
    // Problem with ÉcoleDirecte
    if (!marks.periodes) {
      return 0;
    }

    // Detect right guess parameters
    if (!CoefficientHandler.didChooseIfEnable[accountID]) {
      await CoefficientHandler.setGuessMarkCoefficientEnabled(accountID, !(marks.parametrage?.coefficientNote ?? false));
      await CoefficientHandler.setGuessSubjectCoefficientEnabled(accountID, !((marks.parametrage.moyenneCoefMatiere ?? false) || (marks.parametrage.colonneCoefficientMatiere ?? false)));
    
      if ((CoefficientHandler.guessMarkCoefficientEnabled[accountID] || CoefficientHandler.guessSubjectCoefficientEnabled[accountID]) && this.showGuessParametersWarning) {
        this.showGuessParametersWarning(accountID);
      }
    }

    // Helper functions
    function createPeriod(
      id,
      title,
      isFinished,
      subjects,
      subjectGroups,
      sortedSubjectGroups,
      subjectsNotInSubjectGroup,
    ) {
      return {
        id: id, // String
        title: capitalizeWords(title), // String
        isFinished: isFinished, // Boolean
        subjects: subjects, // Map<ID, Subject>
        subjectGroups: subjectGroups, // Map<ID, SubjectGroup>
        sortedSubjectGroups: sortedSubjectGroups, // List<ID>
        subjectsNotInSubjectGroup: subjectsNotInSubjectGroup, // List<ID>
        marks: {}, // Map<ID, Mark>
        sortedMarks: [], // List<ID>

        averageHistory: [], // List<Float>
      };
    }
    function createSubjectGroup(id, periodID, title, defaultCoefficient) {
      return {
        id: id, // String
        periodID: periodID, // String

        title: title.toUpperCase(), // String

        isEffective: true, // Boolean
        defaultCoefficient: defaultCoefficient, // Float
        subjects: [], // List<ID>

        averageHistory: [], // List<Float>
      };
    }
    function createSubject(
      id,
      subID,
      subjectGroupID,
      periodID,
      title,
      teachers,
      defaultCoefficient,
    ) {
      ColorsHandler.registerSubjectColor(id);
      return {
        id: id, // String
        subID: subID, // String
        subjectGroupID: subjectGroupID, // String
        periodID: periodID, // String

        subSubjects: {}, // Map<ID, Subject>

        title: capitalizeWords(title), // String
        teachers: teachers, // List<String>

        defaultIsEffective: true, // Boolean
        defaultCoefficient: defaultCoefficient, // Float
        marks: [], // List<ID>
        sortedMarks: [], // List<ID>

        averageHistory: [], // List<Float>
      };
    }

    // Create period objects
    var periods = {};
    const possiblePeriodCodes = ["A001", "A002", "A003"];
    for (const period of marks.periodes) {
      // Verify validity of period
      let periodID = period.codePeriode;
      if (!possiblePeriodCodes.includes(periodID)) {
        continue;
      }

      // Get period data
      let periodTitle = period.periode;
      let isPeriodFinished = period.cloture;

      // Fill period data
      let periodSubjects = {};
      let periodSubjectGroups = {};
      let periodSortedSubjectGroups = [];
      for (const subject of period.ensembleMatieres?.disciplines ?? []) {
        if (subject.groupeMatiere) {
          // Is a SubjectGroup
          // Check if already exists
          if (subject.id in periodSubjectGroups) {
            continue;
          }

          periodSubjectGroups[subject.id] = createSubjectGroup(
            subject.id,
            periodID,
            subject.discipline,
            parseFloat(`${subject.coef}`.replace(",", ".")),
          );
          periodSortedSubjectGroups.push(subject.id);
        } else {
          // Is a normal Subject
          let subjectID = subject.codeMatiere;
          let subSubjectID = subject.codeSousMatiere;
          let subjectTitle = subject.discipline;

          let subjectCoefficient = parseFloat(
            `${subject.coef}`.replace(",", "."),
          );
          if (!subjectCoefficient) {
            subjectCoefficient = 1;
          }

          let subjectTeachers = [];
          for (const teacher of subject.professeurs ?? []) {
            subjectTeachers.push(teacher.nom);
          }

          if (subSubjectID) {
            // Is a SubSubject
            let finalSubject = createSubject(
              subjectID,
              subSubjectID,
              null,
              periodID,
              subjectTitle,
              subjectTeachers,
              subjectCoefficient,
            );
            // Find parent Subject
            if (subjectID in periodSubjects) {
              let parentSubject = periodSubjects[subjectID];
              parentSubject.subSubjects[subSubjectID] = finalSubject;
            } else {
              // Create a parent Subject
              periodSubjects[subjectID] = createSubject(
                subjectID,
                null,
                null,
                periodID,
                subjectID,
                subjectTeachers,
                subjectCoefficient,
              );
              periodSubjects[subjectID].subSubjects[subSubjectID] =
                finalSubject;
            }
          } else {
            // Find subject group
            let subjectSubjectGroupID = subject.idGroupeMatiere;
            if (subjectSubjectGroupID) {
              if (!(subjectSubjectGroupID in periodSubjectGroups)) {
                periodSubjectGroups[subjectSubjectGroupID] = createSubjectGroup(
                  subjectSubjectGroupID,
                  periodID,
                  subjectSubjectGroupID,
                  0,
                );
                periodSortedSubjectGroups.push(subjectSubjectGroupID);
              }
              periodSubjectGroups[subjectSubjectGroupID].subjects.push(
                subjectID,
              );
            }

            // Set data
            periodSubjects[subjectID] = createSubject(
              subjectID,
              null,
              subjectSubjectGroupID,
              periodID,
              subjectTitle,
              subjectTeachers,
              subjectCoefficient,
            );
          }
        }
      }

      // Detect what subjects are not in a subject group
      let subjectsNotInSubjectGroup = Object.values(periodSubjects).map(
        (subject) => subject.id,
      );
      Object.values(periodSubjectGroups).forEach((subjectGroup) => {
        subjectGroup.subjects.forEach((subjectID) => {
          subjectsNotInSubjectGroup = subjectsNotInSubjectGroup.filter(
            (subject) => subject != subjectID,
          );
        });
      });

      // Set period
      periods[periodID] = createPeriod(
        periodID,
        `${periodTitle}${isPeriodFinished ? " (fini)" : ""}`,
        isPeriodFinished,
        periodSubjects,
        periodSubjectGroups,
        periodSortedSubjectGroups,
        subjectsNotInSubjectGroup,
      );
    }

    // Add marks
    var sortedMarks = [];
    for (const mark of marks.notes ?? []) {
      let markID = mark.id;
      let periodID = `${mark.codePeriode}`.substring(0, 4);
      let subjectID = mark.codeMatiere;
      let subSubjectID = mark.codeSousMatiere;
      let markTitle = mark.devoir;
      let markDate = getLatestDate(
        new Date(mark.dateSaisie),
        new Date(mark.date),
      );
      let markCoefficient = parseFloat(mark.coef);
      if (!markCoefficient) {
        markCoefficient = 1;
      }

      // Check if mark has competences
      let markCompetences = [];
      let tempMarkCompetences = {};
      for (competence of mark.elementsProgramme) {
        if (!tempMarkCompetences[competence.idCompetence]) {
          markCompetences.push({
            id: competence.idCompetence,
            title: competence.libelleCompetence,
            description: competence.descriptif,
            value: parseFloat(`${competence.valeur}`),
          });
          tempMarkCompetences[competence.idCompetence] = true;
        }
      }

      // Check mark numerical value
      let isMarkEffective = !(mark.enLettre || mark.nonSignificatif);
      let markValueStr = `${mark.valeur}`.trim();
      let markValue = parseFloat(`${mark.valeur}`.replace(",", "."));
      let markValueOn = parseFloat(`${mark.noteSur}`.replace(",", "."));

      // Determine if the mark has a value or is empty
      let markHasValue = true;
      let markOnlyHasCompetences = false;
      if (!markValueOn) {
        isMarkEffective = false;
        markHasValue = false;
        markValueStr = "--";
        markValueOn = 20;

        // Loop through the competences and do a rounded average
        let totalCompetenceValue = 0;
        let totalCompetenceCount = 0;
        for (const competence of markCompetences) {
          if (competence.value > 0) {
            totalCompetenceValue += competence.value;
            totalCompetenceCount++;
          }
        }
        if (totalCompetenceCount > 0) {
          markValue = Math.round(totalCompetenceValue / totalCompetenceCount) - 1;
          markValueOn = 3;
          markValueStr = `${markValue}`;

          markHasValue = true;
          isMarkEffective = true;
          markOnlyHasCompetences = true;
        }
      }
      if (isNaN(markValue)) { markHasValue = false; }

      // Class values
      let markClassValue = parseFloat(
        `${mark.moyenneClasse}`.replace(",", "."),
      );
      let markMinClassValue = parseFloat(`${mark.minClasse}`.replace(",", "."));
      let markMaxClassValue = parseFloat(`${mark.maxClasse}`.replace(",", "."));

      // Final
      let finalMark = {
        id: markID,
        periodID: periodID,
        subjectID: subjectID,
        subSubjectID: subSubjectID,

        date: markDate,
        title: markTitle,
        type: capitalizeWords(mark.typeDevoir),
        comment: mark.commentaire,
        defaultIsEffective: isMarkEffective,
        hasValue: markHasValue,

        defaultCoefficient: markCoefficient,

        competences: markCompetences,
        onlyHasCompetences: markOnlyHasCompetences,

        valueStr: markValueStr,
        value: markValue,
        valueOn: markValueOn,

        classValue: markClassValue,
        minClassValue: markMinClassValue,
        maxClassValue: markMaxClassValue,
      };

      sortedMarks.push(finalMark);
    }
    sortedMarks.sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const mark of sortedMarks) {
      const { id, subjectID, subSubjectID, periodID } = mark;
      
      // Create period if it doesn't exist
      if (!(periodID in periods)) {
        console.log(`Got mark without period ! ${id}`);
        
        // Create the subject
        let tempSubjects = {};
        let tempSubject = createSubject(
          subjectID,
          subSubjectID,
          null,
          periodID,
          subjectID,
          [],
          1,
        );
        tempSubjects[subjectID] = tempSubject;
        
        periods[periodID] = createPeriod(
          periodID,
          periodID,
          true,
          tempSubjects,
          {},
          [],
          [subjectID],
        );
      }

      // Add mark to corresponding Subject (create if not existent)
      if (!(subjectID in periods[periodID].subjects)) {
        periods[periodID].subjects[subjectID] = createSubject(
          subjectID,
          null,
          null,
          periodID,
          subjectID,
          [],
          1,
        );
        periods[periodID].subjectsNotInSubjectGroup.push(subjectID);
      }
      periods[periodID].subjects[subjectID].marks.push(id);
      periods[periodID].subjects[subjectID].sortedMarks.push(id);

      // Add mark to corresponding SubSubject
      if (subSubjectID) {
        parentSubject = periods[periodID].subjects[subjectID];
        if (!(subSubjectID in parentSubject.subSubjects)) {
          parentSubject.subSubjects[subSubjectID] = createSubject(
            subjectID,
            subSubjectID,
            null,
            periodID,
            subSubjectID,
            [],
            1,
          );
        }
        parentSubject.subSubjects[subSubjectID].marks.push(id);
        parentSubject.subSubjects[subSubjectID].sortedMarks.push(id);
      }

      // Add mark to corresponding Period
      periods[periodID].marks[id] = mark;
      periods[periodID].sortedMarks.push(id);
    }

    // Reverse mark lists
    for (const periodID in periods) {
      periods[periodID].sortedMarks.reverse();
      for (const subjectID in periods[periodID].subjects) {
        periods[periodID].subjects[subjectID].sortedMarks.reverse();
        for (const subSubjectID in periods[periodID].subjects[subjectID]
          .subSubjects) {
          periods[periodID].subjects[subjectID].subSubjects[
            subSubjectID
          ].sortedMarks.reverse();
        }
      }
    }

    // Save
    var cacheData = {};
    const data = await AsyncStorage.getItem("marks");
    if (data) {
      cacheData = JSON.parse(data);
    }
    cacheData[accountID] = {
      data: periods,
      date: new Date(),
    };
    await AsyncStorage.setItem("marks", JSON.stringify(cacheData));
    await ColorsHandler.save();

    // Calculate average history
    await this.recalculateAverageHistory(accountID);
    return 1;
  }
  // Set custom data
  static async applyCustomData(accountID, periods, isSinglePeriod = false) {
    const customData = await this.getAccountCustomData(accountID);
    if (!customData) {
      return;
    }

    // Reset all previous custom data
    (isSinglePeriod ? [periods] : Object.values(periods)).forEach(period => {
      Object.values(period.marks).forEach(mark => {
        mark.isCustomCoefficient = false;
      });
      Object.values(period.subjects).forEach(subject => {
        subject.isCustomCoefficient = false;
        Object.values(subject.subSubjects).forEach(subSubject => {
          subSubject.isCustomCoefficient = false;
        });
      });
    })

    // Marks (period specific)
    function applyMarkCustomData(period, markID, customData) {
      let correspondingMark = period.marks[markID];
      if (correspondingMark) {
        if (customData.marks[period.id][markID].coefficient) {
          correspondingMark.isCustomCoefficient = true;
        }
        if (!customData.marks[period.id][markID].isEffective) {
          correspondingMark.generalAverageInfluence = null;
          correspondingMark.subjectAverageInfluence = null;
          correspondingMark.subSubjectAverageInfluence = null;
        }
        Object.keys(customData.marks[period.id][markID]).forEach((key) => {
          correspondingMark[key] = customData.marks[period.id][markID][key];
        });
      }
    }

    Object.keys(customData.marks ?? {}).forEach((periodID) => {
      if (isSinglePeriod && periodID != periods.id) {
        return;
      }
      Object.keys(customData.marks[periodID] ?? {}).forEach((markID) => {
        applyMarkCustomData(
          isSinglePeriod ? periods : periods[periodID],
          markID,
          customData,
        );
      });
    });

    // Subjects (not period specific)
    Object.keys(customData.subjects ?? {}).forEach((fullSubjectID) => {
      Object.keys(periods).forEach((periodID) => {
        let subjectID = fullSubjectID.split("/")[0];
        let subSubjectID = fullSubjectID.split("/")[1];
        let correspondingSubject = (
          isSinglePeriod ? periods : periods[periodID]
        ).subjects[subjectID];
        if (subSubjectID) {
          correspondingSubject = correspondingSubject.subSubjects[subSubjectID];
        }

        if (correspondingSubject) {
          if (customData.subjects[fullSubjectID].coefficient) {
            correspondingSubject.isCustomCoefficient = true;
          }
          Object.keys(customData.subjects[fullSubjectID]).forEach((key) => {
            correspondingSubject[key] = customData.subjects[fullSubjectID][key];
          });
        }
      });
    });
  }
  // Set possibly missing data
  static applyMissingData(accountID, periods, isSinglePeriod = false) {
    Object.values(isSinglePeriod ? { [periods.id]: periods } : periods).forEach(
      (period) => {
        // Set missing mark data
        Object.values(period.marks).forEach((mark) => {
          if (mark.isEffective == undefined) { mark.isEffective = mark.defaultIsEffective; }

          // Guess coefficient if enabled
          if (!mark.isCustomCoefficient || isNaN(mark.coefficient)) {
            if (CoefficientHandler.guessMarkCoefficientEnabled[accountID]) {
              mark.coefficient = CoefficientHandler.chooseMarkCoefficient(mark.title);
            } else {
              mark.coefficient = mark.defaultCoefficient;
            }
          }
        });

        // Set missing subject data
        Object.values(period.subjects).forEach((subject) => {
          if (subject.isEffective == undefined) { subject.isEffective = subject.defaultIsEffective; }

          // Guess coefficient
          if (!subject.isCustomCoefficient || isNaN(subject.coefficient)) {
            if (CoefficientHandler.guessSubjectCoefficientEnabled[accountID]) {
              let subjectGroupTitle = "";
              if (subject.subjectGroupID) { subjectGroupTitle = period.subjectGroups[subject.subjectGroupID].title; }
              subject.coefficient = CoefficientHandler.chooseSubjectCoefficient(accountID, subject.title, subjectGroupTitle);
            } else {
              subject.coefficient = subject.defaultCoefficient;
            }
          }

          Object.values(subject.subSubjects).forEach((subSubject) => {
            if (subSubject.isEffective == undefined) { subSubject.isEffective = subSubject.defaultIsEffective; }

            // Guess coefficient
            if (!subSubject.isCustomCoefficient || isNaN(subSubject.coefficient)) {
              if (CoefficientHandler.guessSubjectCoefficientEnabled[accountID]) {
                subSubject.coefficient = CoefficientHandler.chooseSubjectCoefficient(accountID, subSubject.title, "");
              } else {
                subSubject.coefficient = subSubject.defaultCoefficient;
              }
            }
          });
        });
      },
    );
  }
  // Calculate all averages
  static async _refreshAverages(givenPeriod, averageDate, updateMarkGeneralInfluence, updateMarkSubjectAverageInfluence, updateMarkSubSubjectAverageInfluence) {
    // Preferences
    const countMarksWithOnlyCompetences = await this.getPreference(
      "countMarksWithOnlyCompetences",
    );
    
    // Calculates the straight average for any given subject
    function _calculateSubjectAverage(subject, getMark, averageDate, customUpdateMarkSubjectAverageInfluence) {
      let nbOfCountedMarks = 0;

      let sumOfMarks = 0;
      let coefOfMarks = 0;
      let sumOfClassMarks = 0;
      let coefOfClassMarks = 0;

      subject.marks.forEach((markID) => {
        const mark = getMark(markID);
        if (mark.hasValue && mark.isEffective) {
          if (mark.onlyHasCompetences) {
            if (countMarksWithOnlyCompetences) {
              sumOfMarks += (mark.value / mark.valueOn * 20) * mark.coefficient;
              coefOfMarks += mark.coefficient;
              nbOfCountedMarks += 1;
            }
          } else if (mark.valueOn) {
            sumOfMarks += (mark.value / mark.valueOn) * 20 * mark.coefficient;
            coefOfMarks += mark.coefficient;
            if (mark.classValue) {
              sumOfClassMarks +=
                (mark.classValue / mark.valueOn) * 20 * mark.coefficient;
              coefOfClassMarks += mark.coefficient;
            }
            nbOfCountedMarks += 1;
          }
        }
      });

      if (coefOfClassMarks) {
        subject.classAverage = sumOfClassMarks / coefOfClassMarks;
        subject.hasClassAverage = true;
      }
      if (coefOfMarks) {
        subject.average = sumOfMarks / coefOfMarks;
        subject.hasAverage = true;

        if (
          nbOfCountedMarks !=
          subject.averageHistory[subject.averageHistory.length - 1]?.nbMarks
        ) {
          subject.averageHistory.push({
            value: subject.average,
            classValue: subject.classAverage,
            nbMarks: nbOfCountedMarks,
            date: averageDate,
          });
          customUpdateMarkSubjectAverageInfluence(subject.averageHistory[subject.averageHistory.length - 1].value - (subject.averageHistory[subject.averageHistory.length - 2]?.value ?? subject.averageHistory[subject.averageHistory.length - 1].value))
        }
      }

      return nbOfCountedMarks;
    }

    // Calculates the average of subjects that can contain subSubjects
    function calculateAllSubjectAverages(subject, getMark, averageDate) {
      let nbOfCountedMarks = 0;

      let sumOfSubSubjects = 0;
      let coefOfSubSubjects = 0;
      let sumOfClassSubSubjects = 0;
      let coefOfClassSubSubjects = 0;
      Object.values(subject.subSubjects).forEach((subSubject) => {
        let _nbOfCountedMarks = _calculateSubjectAverage(
          subSubject,
          getMark,
          averageDate,
          updateMarkSubSubjectAverageInfluence,
        );
        if (subSubject.isEffective) {
          if (subSubject.hasAverage) {
            sumOfSubSubjects += subSubject.average * subSubject.coefficient;
            coefOfSubSubjects += subSubject.coefficient;
            nbOfCountedMarks += _nbOfCountedMarks;
          }
          if (subSubject.hasClassAverage) {
            sumOfClassSubSubjects +=
              subSubject.classAverage * subSubject.coefficient;
            coefOfClassSubSubjects += subSubject.coefficient;
          }
        }
      });

      // To not count twice marks in subject containing sub subjects
      if (!coefOfSubSubjects && !coefOfClassSubSubjects) {
        _calculateSubjectAverage(subject, getMark, averageDate, updateMarkSubjectAverageInfluence);
      } else {
        if (coefOfClassSubSubjects) {
          subject.classAverage = sumOfClassSubSubjects / coefOfClassSubSubjects;
          subject.hasClassAverage = true;
        }
        if (coefOfSubSubjects) {
          subject.average = sumOfSubSubjects / coefOfSubSubjects;
          subject.hasAverage = true;

          if (
            nbOfCountedMarks !=
            subject.averageHistory[subject.averageHistory.length - 1]?.nbMarks
          ) {
            subject.averageHistory.push({
              value: subject.average,
              classValue: subject.classAverage,
              nbMarks: nbOfCountedMarks,
              date: averageDate,
            });
            updateMarkSubjectAverageInfluence(subject.averageHistory[subject.averageHistory.length - 1].value - (subject.averageHistory[subject.averageHistory.length - 2]?.value ?? subject.averageHistory[subject.averageHistory.length - 1].value));
          }
        }
      }
    }

    // Calculates the average of subjectGroups
    function calculateAllSubjectGroupsAverages(
      subjectGroup,
      getSubject,
      getMark,
      averageDate,
    ) {
      let sumOfSubjectAverages = 0;
      let coefOfSubjectAverages = 0;
      let sumOfClassSubjectAverages = 0;
      let coefOfClassSubjectAverages = 0;
      subjectGroup.subjects.forEach((subjectID) => {
        const subject = getSubject(subjectID);
        calculateAllSubjectAverages(subject, getMark, averageDate);

        if (subject.isEffective) {
          if (subject.hasAverage) {
            sumOfSubjectAverages += subject.average * subject.coefficient;
            coefOfSubjectAverages += subject.coefficient;
          }
          if (subject.hasClassAverage) {
            sumOfClassSubjectAverages +=
              subject.classAverage * subject.coefficient;
            coefOfClassSubjectAverages += subject.coefficient;
          }
        }
      });

      if (coefOfClassSubjectAverages) {
        subjectGroup.classAverage =
          sumOfClassSubjectAverages / coefOfClassSubjectAverages;
        subjectGroup.hasClassAverage = true;
      }
      if (coefOfSubjectAverages) {
        subjectGroup.average = sumOfSubjectAverages / coefOfSubjectAverages;
        subjectGroup.hasAverage = true;

        if (
          subjectGroup.averageHistory[subjectGroup.averageHistory.length - 1]
            ?.value != subjectGroup.average
        ) {
          subjectGroup.averageHistory.push({
            value: subjectGroup.average,
            classValue: subjectGroup.classAverage,
            date: averageDate,
          });
        }

        // Set coefficient if not existing
        if (!subjectGroup.defaultCoefficient) {
          subjectGroup.coefficient = coefOfSubjectAverages;
        }
      }
    }

    // Calculates the average of periods
    function calculatePeriodAverage(period, averageDate) {
      // Calculate subject groups averages
      let sumOfSubjectGroupsAverages = 0;
      let coefOfSubjectGroupsAverages = 0;
      let sumOfClassSubjectGroupsAverages = 0;
      let coefOfClassSubjectGroupsAverages = 0;
      Object.values(period.subjectGroups).forEach((subjectGroup) => {
        calculateAllSubjectGroupsAverages(
          subjectGroup,
          (subjectID) => period.subjects[subjectID],
          (markID) => period.marks[markID],
          averageDate,
        );

        if (subjectGroup.isEffective) {
          if (subjectGroup.hasAverage) {
            sumOfSubjectGroupsAverages +=
              subjectGroup.average * subjectGroup.coefficient;
            coefOfSubjectGroupsAverages += subjectGroup.coefficient;
          }
          if (subjectGroup.hasClassAverage) {
            sumOfClassSubjectGroupsAverages +=
              subjectGroup.classAverage * subjectGroup.coefficient;
            coefOfClassSubjectGroupsAverages += subjectGroup.coefficient;
          }
        }
      });

      // Calculate averages of remaining subjects
      period.subjectsNotInSubjectGroup.forEach((subjectID) => {
        const subject = period.subjects[subjectID];
        calculateAllSubjectAverages(
          subject,
          (markID) => period.marks[markID],
          averageDate,
        );
        if (subject.isEffective) {
          if (subject.hasAverage) {
            sumOfSubjectGroupsAverages += subject.average * subject.coefficient;
            coefOfSubjectGroupsAverages += subject.coefficient;
          }
          if (subject.hasClassAverage) {
            sumOfClassSubjectGroupsAverages +=
              subject.classAverage * subject.coefficient;
            coefOfClassSubjectGroupsAverages += subject.coefficient;
          }
        }
      });

      // Calculate global average
      if (coefOfClassSubjectGroupsAverages) {
        period.classAverage =
          sumOfClassSubjectGroupsAverages / coefOfClassSubjectGroupsAverages;
        period.hasClassAverage = true;
      }
      if (coefOfSubjectGroupsAverages) {
        period.average =
          sumOfSubjectGroupsAverages / coefOfSubjectGroupsAverages;
        period.hasAverage = true;

        if (
          period.averageHistory[period.averageHistory.length - 1]?.value !=
          period.average
        ) {
          period.averageHistory.push({
            value: period.average,
            classValue: period.classAverage,
            date: averageDate,
          });
          updateMarkGeneralInfluence(period.averageHistory[period.averageHistory.length - 1].value - (period.averageHistory[period.averageHistory.length - 2]?.value ?? period.averageHistory[period.averageHistory.length - 1].value))
        }
      }
    }

    // Calculate averages
    if (givenPeriod) {
      var generalAverageInfluence = calculatePeriodAverage(givenPeriod, averageDate);
    }
    
    return generalAverageInfluence;
  }
  // Calculate the whole average history of a given period
  static async recalculateAverageHistory(accountID) {
    // Get given period
    const data = await AsyncStorage.getItem("marks");
    const cacheData = JSON.parse(data ?? "{}");

    for (const givenPeriod of Object.values(cacheData[accountID]?.data ?? {})) {
      // Reset average history and marks
      givenPeriod.averageHistory = [];
      givenPeriod.average = undefined;
      Object.values(givenPeriod.subjectGroups).forEach((subjectGroup) => {
        subjectGroup.averageHistory = [];
        subjectGroup.hasAverage = false;
        subjectGroup.average = undefined;
      });
      Object.values(givenPeriod.subjects).forEach((subject) => {
        subject.averageHistory = [];
        subject.marks = [];
        subject.hasAverage = false;
        subject.average = undefined;
        subject.isEffective = true;
        Object.values(subject.subSubjects).forEach((subSubject) => {
          subSubject.averageHistory = [];
          subSubject.marks = [];
          subSubject.hasAverage = false;
          subSubject.average = undefined;
          subSubject.isEffective = true;
        });
      });

      await this.applyCustomData(accountID, givenPeriod, true);
      this.applyMissingData(accountID, givenPeriod, true);

      // Add the marks one by one
      var listOfMarks = givenPeriod.sortedMarks.slice().reverse();
      for (const markID of listOfMarks) {
        // Add to corresponding subject
        let mark = givenPeriod.marks[markID];
        let subject = givenPeriod.subjects[mark.subjectID];
        subject.marks.push(markID);
        if (mark.subSubjectID) {
          let subSubject = subject.subSubjects[mark.subSubjectID];
          subSubject.marks.push(markID);
        }

        // Reset influences
        givenPeriod.marks[markID].generalAverageInfluence = undefined;
        givenPeriod.marks[markID].subjectAverageInfluence = undefined;
        givenPeriod.marks[markID].subSubjectAverageInfluence = undefined;

        await this._refreshAverages(
          givenPeriod,
          givenPeriod.marks[markID].date,
          (generalAverageInfluence) => {
            mark.generalAverageInfluence = generalAverageInfluence;
          },
          (subjectAverageInfluence) => {
            if (subjectAverageInfluence) { mark.subjectAverageInfluence = subjectAverageInfluence; }
          },
          (subSubjectAverageInfluence) => {
            if (subSubjectAverageInfluence) { mark.subSubjectAverageInfluence = subSubjectAverageInfluence; }
          }
        );
      }
    }

    // Save data
    await AsyncStorage.setItem("marks", JSON.stringify(cacheData));
  }
  // Helper function
  static async getLastTimeUpdatedMarks(accountID) {
    const marks = JSON.parse(await AsyncStorage.getItem("marks"));
    if (marks && accountID in marks) {
      return marks[accountID].date;
    }
  }

  // Custom data //
  static async _setAllCustomData(data) {
    await AsyncStorage.setItem("customData", JSON.stringify(data));
  }
  static async _getAllCustomData() {
    const data = await AsyncStorage.getItem("customData");
    if (data) {
      return JSON.parse(data);
    }
    return {};
  }
  // Account specific data
  static async _setAccountCustomData(accountID, data) {
    const customData = await this._getAllCustomData();
    customData[accountID] = data;
    await this._setAllCustomData(customData);
  }
  static async getAccountCustomData(accountID) {
    const customData = await this._getAllCustomData();
    if (accountID in customData) {
      return customData[accountID];
    }
    return {};
  }
  // Direct functions
  static async setCustomData(
    accountID,
    dataType,
    itemID,
    property,
    value,
    periodID = null,
  ) {
    const customData = await this.getAccountCustomData(accountID);
    if (!customData[dataType]) {
      customData[dataType] = {};
    }
    if (periodID) {
      if (!customData[dataType][periodID]) {
        customData[dataType][periodID] = {};
      }
      if (!customData[dataType][periodID][itemID]) {
        customData[dataType][periodID][itemID] = {};
      }
      customData[dataType][periodID][itemID][property] = value;
    } else {
      if (!customData[dataType][itemID]) {
        customData[dataType][itemID] = {};
      }
      customData[dataType][itemID][property] = value;
    }
    await this._setAccountCustomData(accountID, customData);
  }
  static async removeCustomData(accountID, dataType, itemID, property, periodID = null) {
    const customData = await this.getAccountCustomData(accountID);
    if (dataType in customData && (itemID in customData[dataType] || periodID in customData[dataType])) {
      if (periodID) {
        delete customData[dataType][periodID][itemID][property];
      } else {
        delete customData[dataType][itemID][property];
      }
    }
    await this._setAccountCustomData(accountID, customData);
  }
  static async resetCustomData(accountID) {
    const customData = await this._getAllCustomData();
    delete customData[accountID];
    await this._setAllCustomData(customData);
  }

  // Homework functions //
  static async getAllHomework(accountID) {
    return this.parseEcoleDirecte(
      "homework",
      accountID,
      `${this.USED_URL}${APIEndpoints.ALL_HOMEWORK(accountID)}`,
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
          if (new Date(day) - new Date() <= 3 * 7 * 24 * 60 * 60 * 1000) {
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
  static async getSpecificHomeworkForDay(accountID, day) {
    return this.parseEcoleDirecte(
      "specific-homework",
      accountID,
      `${this.USED_URL}${APIEndpoints.SPECIFIC_HOMEWORK(accountID, day)}`,
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
  static async markHomeworkAsDone(accountID, homeworkID, done) {
    const status = await this.parseEcoleDirecte(
      "mark-homework-status",
      accountID,
      `${this.USED_URL}${APIEndpoints.ALL_HOMEWORK(accountID)}`,
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
    // Check if file already exists
    const localFile = `${RNFS.DocumentDirectoryPath}/${file.title}`;
    if (await RNFS.exists(localFile)) {
      console.log(`File ${file.title} already exists, skipping...`);
      return {
        promise: Promise.resolve(),
        localFile,
      };
    }
    
    // Get login token
    const mainAccount = await this._getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;

    console.log(`Downloading ${file.title}...`);

    const url = `${this.USED_URL}${APIEndpoints.DOWNLOAD_HOMEWORK_ATTACHEMENT(file.id, file.fileType)}&v=4`;

    return {
      promise: RNFS.downloadFile({
        fromUrl: url,
        toFile: localFile,
        headers: { "X-Token": token },
      }).promise,
      localFile,
    };
  }

  // Preferences //
  static async _setAllPreferences(preferences) {
    await AsyncStorage.setItem("preferences", JSON.stringify(preferences));
  }
  static async _getAllPreferences() {
    const data = await AsyncStorage.getItem("preferences");
    if (data) {
      return JSON.parse(data);
    }
    return {};
  }
  static async setPreference(key, value) {
    const preferences = await this._getAllPreferences();
    preferences[key] = value;
    await this._setAllPreferences(preferences);
  }
  static async getPreference(key, defValue=false) {
    const preferences = await this._getAllPreferences();
    if (key in preferences) {
      return preferences[key];
    } else {
      preferences[key] = defValue; // Default value for all preferences
      await this._setAllPreferences(preferences);
    }
    return preferences[key];
  }

  // Network utils //
  static async parseEcoleDirecte(title, accountID, url, payload, successCallback, verbe="get") {
    // Get login token
    const mainAccount = await this._getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;
    
    console.log(`Getting ${title} for account ${accountID}...`);
    var response = await axios.post(
      `${url}?verbe=${verbe}&v=4`,
      payload,
      { headers: { "Content-Type": "text/plain", "X-Token": token } },
    ).catch((error) => {
      console.warn(`An error occured while getting ${title} : ${error}`);
    });
    response ??= { status: 500 };

    var status = 0; // 1 = success | 0 = outdated token, re-login failed | -1 = error
    switch (response.status) {
      case 200:
        console.log("API request successful");

        // Save response to storage for bug reporting
        let filename = `logs-${title}`;
        AsyncStorage.getItem(filename).then(fileData => {
          let data = JSON.parse(fileData) ?? {};
          data[accountID] = response.data;
          AsyncStorage.setItem(filename, JSON.stringify(data));
        });

        switch (response.data.code) {
          case 200:
            await this._updateToken(accountID, response.data.token);
            status = await successCallback(response.data?.data);
            console.log(`Got ${title} for account ${accountID} ! (status ${status})`);
            break;
          case 520: // Outdated token
            console.log("Outdated token, reconnecting...");
            const reloginSuccessful = await this.refreshLogin();
            if (reloginSuccessful) {
              return await this.parseEcoleDirecte(title, accountID, url, payload, successCallback);
            }
            status = 0;
            break;
          default:
            console.warn(`API responded with unknown code ${response.data.code}`);
            console.warn(response.data);
            status = -1;
            break;
        }
        break;
      default:
        console.warn("API request failed");
        status = -1;
        break;
    }

    return status;
  }

  // Erase all data //
  static async eraseData() {
    ColorsHandler.resetSubjectColors();
    CoefficientHandler.erase();
    await AsyncStorage.clear();
  }
  static async resetCoefficients(account, updateGlobalDisplay) {
    await AsyncStorage.removeItem("customData");
    if (account.accountType == "E") { await this.recalculateAverageHistory(account.id); }
    else {
      for (const childID in account.children) {
        await this.recalculateAverageHistory(childID);
      }
    }
    
    updateGlobalDisplay();
  }
  static async eraseCacheData() {
    // Put here temporary files
    await AsyncStorage.multiRemove([
      "specific-homework",
      "photos",
      "votes",
    ]);

    // Homework attachements
    RNFS.readDir(RNFS.DocumentDirectoryPath).then(files => {
      files.forEach(file => {
        if (file.isFile()) {
          RNFS.unlink(file.path);
        }
      });
    });
  }
}

export default AppData;