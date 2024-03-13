import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

var Buffer = require('buffer/').Buffer;
import { htmlToText } from "html-to-text";
import RNFS from "react-native-fs";

import { capitalizeWords, getLatestDate } from "../util/Utils";
import ColorsHandler from "../util/ColorsHandler";


// This class contains all the functions used for logic and cache handling in the app
class AppData {
  // Base URLs
  static API_URL = "https://api.ecoledirecte.com";
  static CUSTOM_API_URL = "https://api.moyennesed.my.to/test-api";
  static USED_URL = AppData.API_URL;

  // Login functions //

  // Login
  static async login(username, password) {
    // Demo account
    this.USED_URL = AppData.API_URL;
    if (username.substring(0, 11) == "demoaccount") {
      this.USED_URL = this.CUSTOM_API_URL;
      console.log("Using custom API");
    }

    console.log(`Logging-in ${username}...`);

    const credentials = {
      identifiant: encodeURIComponent(username),
      motdepasse: encodeURIComponent(password),
    };
    var response = await axios
      .post(
        `${this.USED_URL}/v3/login.awp?v=4`,
        `data=${JSON.stringify(credentials)}`,
        { headers: { "Content-Type": "text/plain" } },
      )
      .catch((error) => {
        console.warn(`An error occured while logging in : ${error}`);
      });
    response ??= { status: 500 };

    var status = 0; // 1 = success | 2 = choose account | 0 = wrong password | -1 = error
    switch (response.status) {
      case 200:
        console.log("API request successful");
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

    // Loop trough connected accounts
    for (const account of loginData.accounts) {
      var ID = `${account.id}`;
      var accountType = account.typeCompte == "E" ? "E" : "P"; // E = student | 1 = parent
      var firstName = capitalizeWords(account.prenom);
      var lastName = account.nom.toUpperCase();
      var gender;

      // Student account
      if (accountType == "E") {
        gender = account.profile.sexe;
        let school = capitalizeWords(account.profile.nomEtablissement);
        let grade = capitalizeWords(account.profile.classe.libelle);
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
          let grade = capitalizeWords(childAccount.classe.libelle);
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
      `${this.USED_URL}/v3/eleves/${accountID}/notes.awp`,
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
      for (const subject of period.ensembleMatieres.disciplines) {
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
          for (const teacher of subject.professeurs) {
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
        periodTitle,
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
      let periodID = mark.codePeriode;
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
      for (competence of mark.elementsProgramme) {
        markCompetences.push({
          title: competence.libelleCompetence,
          description: competence.descriptif,
          value: parseFloat(`${competence.valeur}`),
        });
      }

      // Check mark numerical value
      let isMarkEffective = !(mark.enLettre || mark.nonSignificatif);
      let markValueStr = `${mark.valeur}`.trim();
      let markValue = parseFloat(`${mark.valeur}`.replace(",", "."));
      let markValueOn = parseFloat(`${mark.noteSur}`.replace(",", "."));

      // Determine if the mark has a value or is empty
      let markHasValue = true;
      if (!markValueOn && markCompetences.length == 0) {
        markHasValue = false;
      }

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
        defaultIsEffective: isMarkEffective,
        hasValue: markHasValue,

        defaultCoefficient: markCoefficient,

        competences: markCompetences,

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

      // Add mark to corresponding Subject
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

    // Marks (period specific)
    function applyMarkCustomData(period, markID, customData) {
      let correspondingMark = period.marks[markID];
      if (correspondingMark) {
        if (
          customData.marks[period.id][markID].coefficient &&
          customData.marks[period.id][markID].coefficient !=
            correspondingMark.defaultCoefficient
        ) {
          correspondingMark.coefficientWasChanged = true;
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
          if (
            customData.subjects[fullSubjectID].coefficient &&
            customData.subjects[fullSubjectID].coefficient !=
              correspondingSubject.defaultCoefficient
          ) {
            correspondingSubject.coefficientWasChanged = true;
          }
          Object.keys(customData.subjects[fullSubjectID]).forEach((key) => {
            correspondingSubject[key] = customData.subjects[fullSubjectID][key];
          });
        }
      });
    });
  }
  // Set possibly missing data
  static applyMissingData(periods, isSinglePeriod = false) {
    Object.values(isSinglePeriod ? { [periods.id]: periods } : periods).forEach(
      (period) => {
        // Set missing mark data
        Object.values(period.marks).forEach((mark) => {
          if (isNaN(mark.coefficient)) {
            mark.coefficient = mark.defaultCoefficient;
          }
          if (mark.isEffective == undefined) {
            mark.isEffective = mark.defaultIsEffective;
          }
        });

        // Set missing subject data
        Object.values(period.subjects).forEach((subject) => {
          if (isNaN(subject.coefficient)) {
            subject.coefficient = subject.defaultCoefficient;
          }
          if (subject.isEffective == undefined) {
            subject.isEffective = subject.defaultIsEffective;
          }
          Object.values(subject.subSubjects).forEach((subSubject) => {
            if (isNaN(subSubject.coefficient)) {
              subSubject.coefficient = subSubject.defaultCoefficient;
            }
            if (subSubject.isEffective == undefined) {
              subSubject.isEffective = subSubject.defaultIsEffective;
            }
          });
        });
      },
    );
  }
  // Calculate all averages
  static async _refreshAverages(
    accountID,
    givenPeriod = null,
    averageDate = null,
    applyOtherData = true,
  ) {
    // Preferences
    const countMarksWithOnlyCompetences = await this.getPreference(
      "countMarksWithOnlyCompetences",
    );

    // Calculates the straight average for any given subject
    function _calculateSubjectAverage(subject, getMark, averageDate) {
      let nbOfCountedMarks = 0;

      let sumOfMarks = 0;
      let coefOfMarks = 0;
      let sumOfClassMarks = 0;
      let coefOfClassMarks = 0;

      subject.marks.forEach((markID) => {
        const mark = getMark(markID);
        if (mark.hasValue && mark.isEffective) {
          if (mark.valueOn) {
            sumOfMarks += (mark.value / mark.valueOn) * 20 * mark.coefficient;
            coefOfMarks += mark.coefficient;
            if (mark.classValue) {
              sumOfClassMarks +=
                (mark.classValue / mark.valueOn) * 20 * mark.coefficient;
              coefOfClassMarks += mark.coefficient;
            }
            nbOfCountedMarks += 1;
          } else if (countMarksWithOnlyCompetences) {
            let sumOfCompetences = 0;
            let coefOfCompetences = 0;
            mark.competences.forEach((competence) => {
              if (competence.value) {
                // Because 0 = student was missing
                sumOfCompetences += ((competence.value - 1) / 3) * 20;
                coefOfCompetences += 1;
              }
            });
            if (coefOfCompetences) {
              sumOfMarks +=
                (sumOfCompetences / coefOfCompetences) * mark.coefficient;
              coefOfMarks += mark.coefficient;
              nbOfCountedMarks += 1;
            } else {
              mark.hasValue = false;
            }
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
        _calculateSubjectAverage(subject, getMark, averageDate);
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
        }
      }
    }

    if (givenPeriod) {
      if (applyOtherData) {
        // Set custom data
        await this.applyCustomData(accountID, givenPeriod, true);

        // Set possibly missing data
        this.applyMissingData(givenPeriod, true);
      }

      // Calculate averages
      calculatePeriodAverage(givenPeriod, averageDate);
    } else {
      var cacheData = {};
      const data = await AsyncStorage.getItem("marks");
      if (data) {
        cacheData = JSON.parse(data);
      }
      if (accountID in cacheData) {
        // Set custom data
        await this.applyCustomData(accountID, cacheData[accountID].data);

        // Set possibly missing data
        this.applyMissingData(cacheData[accountID].data);

        // Calculate averages
        Object.values(cacheData[accountID].data).forEach((period) => {
          calculatePeriodAverage(period);
        });
        await AsyncStorage.setItem("marks", JSON.stringify(cacheData));
      }
    }
  }
  // Calculate the whole average history of a given period
  static async recalculateAverageHistory(accountID) {
    // Get given period
    const data = await AsyncStorage.getItem("marks");
    const cacheData = JSON.parse(data);

    for (const givenPeriod of Object.values(cacheData[accountID]?.data)) {
      // Reset average history and marks
      givenPeriod.averageHistory = [];
      Object.values(givenPeriod.subjectGroups).forEach((subjectGroup) => {
        subjectGroup.averageHistory = [];
        subjectGroup.hasAverage = false;
      });
      Object.values(givenPeriod.subjects).forEach((subject) => {
        subject.averageHistory = [];
        subject.marks = [];
        subject.hasAverage = false;
        Object.values(subject.subSubjects).forEach((subSubject) => {
          subSubject.averageHistory = [];
          subSubject.marks = [];
          subSubject.hasAverage = false;
        });
      });

      await this.applyCustomData(accountID, givenPeriod, true);
      this.applyMissingData(givenPeriod, true);

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

        await this._refreshAverages(
          accountID,
          givenPeriod,
          givenPeriod.marks[markID].date,
          false,
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
  static async removeCustomData(accountID, dataType, itemID) {
    const customData = await this.getAccountCustomData(accountID);
    if (dataType in customData && itemID in customData[dataType]) {
      delete customData[dataType][itemID];
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
      `${this.USED_URL}/v3/Eleves/${accountID}/cahierdetexte.awp`,
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
      subjectsWithExams: {},
      totalExams: 0,
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

        if (finalHomework.isExam) {
          abstractHomework.subjectsWithExams[finalHomework.subjectID] ??= [];
          abstractHomework.subjectsWithExams[finalHomework.subjectID].push(finalHomework.id);
          abstractHomework.totalExams++;
        }
      
        abstractHomework.days[day] ??= [];
        abstractHomework.days[day].push(finalHomework.id);
        
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
  static async getSpecificHomeworkForDay(accountID, day, forceRefresh=false, forceCache=false) {
    if (!forceRefresh) {
      const data = await AsyncStorage.getItem("specific-homework");
      if (data) {
        const cacheData = JSON.parse(data);
        if (accountID in cacheData && day in cacheData[accountID].days) {          
          // Check if homework more than 12 hours old
          if (new Date() - new Date(cacheData[accountID].days[day].date) < 12 * 60 * 60 * 1000 || forceCache) {
            const listOfSpecificHomeworks = cacheData[accountID].days[day].homeworkIDs.map(homeworkID => cacheData[accountID].homeworks[homeworkID]);
            let specificHomeworks = {};
            listOfSpecificHomeworks.forEach(homework => {
              specificHomeworks[homework.id] = homework;
            });
            
            return {
              status: 1,
              data: specificHomeworks,
              date: cacheData[accountID].days[day].date,
            };
          }
        }
      }
      if (forceCache) { return { status: 0 }; }
    }

    const status = await this.parseEcoleDirecte(
      "specific homework",
      accountID,
      `${this.USED_URL}/v3/Eleves/${accountID}/cahierdetexte/${day}.awp`,
      'data={}',
      async (data) => {
        return await this.saveSpecificHomeworkForDay(accountID, data);
      }
    );
    
    if (status == 1) { return await this.getSpecificHomeworkForDay(accountID, day); }
    else { return { status: -1 }; }
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
        todo: this.parseHtmlData(homework.aFaire.contenu),
        sessionContent: this.parseHtmlData(homework.aFaire.contenuDeSeance.contenu),
        files: homework.aFaire.documents.map(document => {
          return {
            id: document.id,
            title: document.libelle,
            size: document.taille,
            fileType: document.type,
          };
        }),
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
    const cacheData = JSON.parse(data);
    if (accountID in cacheData) {
      return cacheData[accountID].date;
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
      "mark homework as done",
      accountID,
      `${this.USED_URL}/v3/Eleves/${accountID}/cahierdetexte.awp`,
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
  static parseHtmlData(data) {
    let binaryData = Buffer.from(data, 'base64').toString('binary');
    let utf8Data = decodeURIComponent(escape(binaryData));
    return htmlToText(utf8Data);
  }
  static async downloadHomeworkFile(accountID, file) {
    // Get login token
    const mainAccount = await this._getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;

    console.log(`Downloading ${file.title}...`);

    const url = `${this.USED_URL}/v3/telechargement.awp?verbe=get&fichierId=${file.id}&leTypeDeFichier=${file.fileType}&v=4`;
    const localFile = `${RNFS.DocumentDirectoryPath}/${file.title}`;

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
  static async getPreference(key) {
    const preferences = await this._getAllPreferences();
    if (key in preferences) {
      return preferences[key];
    } else {
      preferences[key] = false; // Default value for all preferences
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
    var response = await axios
      .post(
        `${url}?verbe=${verbe}&v=4`,
        payload,
        { headers: { "Content-Type": "text/plain", "X-Token": token } },
      )
      .catch((error) => {
        console.warn(`An error occured while getting ${title} : ${error}`);
      });
    response ??= { status: 500 };

    var status = 0; // 1 = success | 0 = outdated token, re-login failed | -1 = error
    switch (response.status) {
      case 200:
        console.log("API request successful");
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
    await AsyncStorage.clear();
  }
  static async resetPreferences() {
    await AsyncStorage.multiRemove(["preferences", "customData"]);
  }
}

export default AppData;