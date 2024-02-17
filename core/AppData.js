import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { capitalizeWords } from "../util/Utils";


// This class contains the data used inside cache troughout the app
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
      "identifiant": encodeURIComponent(username),
      "motdepasse": encodeURIComponent(password),
    };
    var response = await axios.post(
      `${this.USED_URL}/v3/login.awp?v=4`,
      `data=${JSON.stringify(credentials)}`,
      { headers: { "Content-Type": "text/plain" } },
    ).catch(error => {
      console.warn(`An error occured while logging in : ${error}`);
    });
    response ??= { status: 500 };

    var status = 0; // 1 = success | 2 = choose account | 0 = wrong password | -1 = error
    switch (response.status) {
      case 200:
        console.log("API request successful");
        switch (response.data.code) {
          case 200:
            await this.saveConnectedAccounts(response.data.data, response.data.token);
            status = 1;
            if (response.data.data.accounts.length != 1) {
              let alreadySavedPreference = await AsyncStorage.getItem("selectedAccount");
              if (!alreadySavedPreference || alreadySavedPreference == 0) { status = 2; }
            }
            else { await this.saveSelectedAccount(response.data.data.accounts[0].id); }
            await AsyncStorage.setItem("credentials", JSON.stringify({
              "username": username,
              "password": password,
            }));
            console.log("Login successful !");
            break;
          case 505: // Wrong password
            console.log(`Couldn't connect, wrong password for ${username}`);
            break;
          default:
            console.warn(`API responded with unknown code ${response.data.code}`);
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
  static async saveConnectedAccounts(loginData, token) {
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
          "id": ID,
          "connectionToken": token,
          "accountType": accountType,
          "firstName": firstName,
          "lastName": lastName,
          "gender": gender,
          "school": school,
          "grade": grade,
          "photoURL": photoURL,
        }
      } else { // Parent account
        gender = account.civilite == "M." ? "M" : "F";
        let children = {};

        // Add children accounts
        for (const childAccount of account.profile.eleves) {
          let childID = `${childAccount.id}`;
          let childFirstName = capitalizeWords(childAccount.prenom);
          let childLastName = childAccount.nom.toUpperCase();
          let childGender = childAccount.sexe;
          let childSchool = capitalizeWords(childAccount.nomEtablissement);
          if (childSchool.length == 0) { childSchool = account.nomEtablissement; }
          let grade = capitalizeWords(childAccount.classe.libelle);
          let childPhotoURL = childAccount.photo;

          children[childID] = {
            "id": childID,
            "firstName": childFirstName,
            "lastName": childLastName,
            "gender": childGender,
            "school": childSchool,
            "grade": grade,
            "photoURL": childPhotoURL,
          }
        }

        connectedAccounts[ID] = {
          "id": ID,
          "connectionToken": token,
          "accountType": accountType,
          "firstName": firstName,
          "lastName": lastName,
          "gender": gender,
          "children": children,
        }
      }
    }

    // Save data
    await AsyncStorage.setItem("accounts", JSON.stringify(connectedAccounts));
  }
  // One for most users, needed for ones with more than one account connected
  static async saveSelectedAccount(accountID) { await AsyncStorage.setItem("selectedAccount", `${accountID}`); }

  // Util functions //

  // One for most users, needed for ones with more than one account connected
  static async getSelectedAccount() {
    var selectedAccount = await AsyncStorage.getItem("selectedAccount");
    if (selectedAccount) { return selectedAccount; }
    var accounts = JSON.parse(await AsyncStorage.getItem("accounts"));
    accounts ??= {"0": {}}
    selectedAccount = Object.keys(accounts)[0];
    await AsyncStorage.setItem("selectedAccount", selectedAccount);
    return selectedAccount;
  }
  // Get the main account
  static async getMainAccount() {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));
    const selectedAccount = await this.getSelectedAccount();
    return accounts && selectedAccount ? accounts[selectedAccount] : null;
  }
  // Get specific account, used for children on parent accounts
  static async getSpecificAccount(accountID) {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));
    
    // For student accounts
    if (accountID in accounts) { return accounts[accountID]; }
    
    // For parent accounts
    for (const account_ in accounts) {
      const account = accounts[account_];
      if (account.accountType == "P") {
        if (accountID in account.children) { return account.children[accountID]; }
      }
    }
  }
  // Get main account of any account, used to get login tokens from children accounts
  static async getMainAccountOfAnyAccount(accountID) {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));

    // For student accounts
    if (accountID in accounts) { return accounts[accountID]; }

    // For parent accounts
    for (const account_ in accounts) {
      const account = accounts[account_];
      if (account.accountType == "P") {
        if (accountID in account.children) { return account; }
      }
    }
  }
  // Child account
  static async setSelectedChildAccount(accountID) { await AsyncStorage.setItem("selectedChildAccount", `${accountID}`); }
  static async getSelectedChildAccount() { return await AsyncStorage.getItem("selectedChildAccount"); }


  // Marks functions //

  // Get marks
  static async getMarks(accountID) {
    // Get login token
    const mainAccount = await this.getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;

    console.log(`Getting marks for account ${accountID}...`);
    var response = await axios.post(
      `${this.USED_URL}/v3/eleves/${accountID}/notes.awp?verbe=get&v=4`,
      'data={"anneeScolaire": ""}',
      { headers: { "Content-Type": "text/plain", "X-Token": token } },
    ).catch(error => {
      console.warn(`An error occured while getting marks : ${error}`);
    });
    response ??= { status: 500 };
    
    var status = 0; // 1 = success | 0 = outdated token, re-login failed | -1 = error
    switch (response.status) {
      case 200:
        console.log("API request successful");
        switch (response.data.code) {
          case 200:
            await this.updateToken(accountID, response.data.token);
            status = await this.saveMarks(accountID, response.data.data);
            console.log(`Got marks for account ${accountID} ! (status ${status})`);
            break;
          case 520: // Outdated token
            console.log("Outdated token, reconnecting...");
            const reloginSuccessful = await this.refreshLogin();
            if (reloginSuccessful) { return await this.getMarks(accountID); }
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
  // Update login token
  static async updateToken(accountID, newToken) {
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
    var periods = {};

    // Problem with ÉcoleDirecte
    if (!marks.periodes || !marks.notes) { return 0; }

    // Create period objects
    const possiblePeriodCodes = ["A001", "A002", "A003"];
    for (const period of marks.periodes) {
      let periodID = period.codePeriode;
      if (!possiblePeriodCodes.includes(periodID)) { continue; }
      let periodTitle = period.periode;
      let isPeriodFinished = period.cloture;

      let periodSubjects = {};
      let periodSubjectGroups = {};
      for (const subject of period.ensembleMatieres.disciplines) {
        let isSubjectGroup = subject.groupeMatiere;
        if (isSubjectGroup) {
          let subjectGroupID = subject.id;
          let subjectGroupTitle = subject.discipline;
          let subjectGroupSubjects = [];
          periodSubjectGroups[subjectGroupID] = {
            "id": subjectGroupID,
            "title": subjectGroupTitle.toUpperCase(),
            "subjects": subjectGroupSubjects,
          };
        } else {
          let subjectID = subject.codeMatiere;
          let subSubjectID = subject.codeSousMatiere;
          let subjectTitle = subject.discipline;
          let subjectCoefficient = parseFloat(subject.coef);
          if (!subjectCoefficient) { subjectCoefficient = 1; }

          let subjectTeachers = [];
          for (const teacher of subject.professeurs) { subjectTeachers.push(teacher.nom); }

          if (subSubjectID) {
            let finalSubject = {
              "id": subjectID,
              "title": capitalizeWords(subjectTitle),
              "coefficient": subjectCoefficient,
              "teachers": subjectTeachers,
              "marks": [],
              "isSub": true,
              "subID": subSubjectID,
              "isEffective": true,
            };
            // Find parent subject
            if (subjectID in periodSubjects) {
              let parentSubject = periodSubjects[subjectID];
              parentSubject.subSubjects[subSubjectID] = finalSubject;
            } else {
              periodSubjects[subjectID] = {
                "id": subjectID,
                "title": capitalizeWords(subjectID),
                "coefficient": subjectCoefficient,
                "teachers": subjectTeachers,
                "marks": [],
                "isSub": false,
                "subSubjects": {},
                "isEffective": true,
              };
              periodSubjects[subjectID].subSubjects[subSubjectID] = finalSubject;
            }
          } else {
            // Find subject group
            let subjectSubjectGroupID = subject.idGroupeMatiere;
            if (subjectSubjectGroupID) {
              if (subjectSubjectGroupID in periodSubjectGroups) {
                periodSubjectGroups[subjectSubjectGroupID].subjects.push(subjectID);
              } else {
                periodSubjectGroups[subjectSubjectGroupID] = {
                  "id": subjectSubjectGroupID,
                  "title": subjectSubjectGroupID.toUpperCase(),
                  "subjects": [subjectID],
                };
              }
            }
            
            periodSubjects[subjectID] = {
              "id": subjectID,
              "title": capitalizeWords(subjectTitle),
              "coefficient": subjectCoefficient,
              "teachers": subjectTeachers,
              "marks": [],
              "subjectGroupID": subjectSubjectGroupID,
              "isSub": false,
              "subSubjects": {},
              "isEffective": true,
            };
          }
        }
      }
      periods[periodID] = {
        "id": periodID,
        "title": capitalizeWords(periodTitle),
        "isFinished": isPeriodFinished,
        "subjects": periodSubjects,
        "subjectGroups": periodSubjectGroups,
        "marks": {},
      };
    }

    // Add marks
    for (const mark of marks.notes) {
      let markID = mark.id;
      let periodID = mark.codePeriode;
      let subjectID = mark.codeMatiere;
      let subSubjectID = mark.codeSousMatiere;
      let markDate = mark.dateSaisie;
      let markCoefficient = parseFloat(mark.coef);
      if (!markCoefficient) { markCoefficient = 1; }

      // Check if mark has competences
      let markCompetences = [];
      for (competence of mark.elementsProgramme) {
        markCompetences.push({
          "title": competence.libelleCompetence,
          "description": competence.descriptif,
          "value": parseFloat(`${competence.valeur}`),
        });
      }

      // Check mark numerical value
      let isMarkEffective = !(mark.enLettre || mark.nonSignificatif);
      let markValueStr = `${mark.valeur}`;
      let markValue = parseFloat(`${mark.valeur}`.replace(",", "."));
      let markValueOn = parseFloat(`${mark.noteSur}`.replace(",", "."));

      // Determine if the mark has a value or is empty
      let markHasValue = true;
      if (!markValueOn && markCompetences.length == 0) { markHasValue = false; }

      // Class values
      let markClassValue = parseFloat(`${mark.moyenneClasse}`.replace(",", "."));
      let markMinClassValue = parseFloat(`${mark.minClasse}`.replace(",", "."));
      let markMaxClassValue = parseFloat(`${mark.maxClasse}`.replace(",", "."));

      // Final
      let finalMark = {
        "id": markID,
        "periodID": periodID,
        "subjectID": subjectID,
        "subSubjectID": subSubjectID,
        "date": markDate,
        
        "isEffective": isMarkEffective,
        "hasValue": markHasValue,

        "coefficient": markCoefficient,

        "competences": markCompetences,

        "valueStr": markValueStr,
        "value": markValue,
        "valueOn": markValueOn,

        "classValue": markClassValue,
        "minClassValue": markMinClassValue,
        "maxClassValue": markMaxClassValue,
      };

      // Add mark to corresponding subject
      if (subjectID in periods[periodID].subjects) {
        periods[periodID].subjects[subjectID].marks.push(markID);
      } else {
        periods[periodID].subjects[subjectID] = {
          "id": subjectID,
          "title": subjectID,
          "coefficient": 1,
          "teachers": [],
          "marks": [markID],
          "isSub": false,
          "subSubjects": {},
          "isEffective": true,
        }
      }
      if (subSubjectID) {
        parentSubject = periods[periodID].subjects[subjectID]
        if (subSubjectID in parentSubject.subSubjects) {
          parentSubject.subSubjects[subSubjectID].marks.push(markID);
        } else {
          parentSubject.subSubjects[subSubjectID] = {
            "id": subjectID,
            "title": subSubjectID,
            "coefficient": 1,
            "teachers": [],
            "marks": [markID],
            "isSub": true,
            "subID": subSubjectID,
            "isEffective": true,
          }
        }
      }

      periods[periodID].marks[markID] = finalMark;
    }

    // Set custom data chosen by the user
    const cacheCustomData = await AsyncStorage.getItem("customData");
    if (cacheCustomData) {
      const customData = JSON.parse(cacheCustomData);
      for (const mark of customData.marks) {
        let correspondingMark = periods[mark.periodID].marks[mark.id];
        if (correspondingMark) {
          Object.keys(mark).forEach(key => {
            correspondingMark[key] = mark[key];
          });
        }
      }
      for (const subject of customData.subjects) {
        let correspondingSubject = periods[subject.periodID].subjects[subject.id];
        if (correspondingSubject) {
          Object.keys(subject).forEach(key => {
            correspondingSubject[key] = subject[key];
          });
        }
      }
      for (const subSubject of customData.subSubjects) {
        let correspondingSubject = periods[subSubject.periodID].subjects[subSubject.id];
        if (!correspondingSubject) { continue; }
        let correspondingSubSubject = correspondingSubject.subSubjects[subSubject.subID];
        if (correspondingSubSubject) {
          Object.keys(subSubject).forEach(key => {
            correspondingSubSubject[key] = subSubject[key];
          });
        }
      }
    }

    // Save
    var cacheData = {};
    const data = await AsyncStorage.getItem("marks");
    if (data) { cacheData = JSON.parse(data); }
    cacheData[accountID] = {
      "data": periods,
      "date": new Date(),
    };
    await AsyncStorage.setItem("marks", JSON.stringify(cacheData));

    // Calculate averages
    await this.refreshAverages(accountID);

    return 1;
  }
  // Calculate all averages
  static async refreshAverages(accountID) {
    const countMarksWithOnlyCompetences = await this.getPreference("countMarksWithOnlyCompetences");
    
    function calculateSubjectAverage(subject, getMark) {
      let sumOfMarks = 0;
      let coefOfMarks = 0;
      let sumOfClassMarks = 0;
      let coefOfClassMarks = 0;
      
      subject.marks.forEach(markID => {
        const mark = getMark(markID);
        if (mark.hasValue && mark.isEffective) {
          if (mark.valueOn) {
            sumOfMarks += (mark.value / mark.valueOn * 20) * mark.coefficient;
            coefOfMarks += mark.coefficient;
            if (mark.classValue) {
              sumOfClassMarks += (mark.classValue / mark.valueOn * 20) * mark.coefficient;
              coefOfClassMarks += mark.coefficient;
            }
          } else if (countMarksWithOnlyCompetences) {
            let sumOfCompetences = 0;
            let coefOfCompetences = 0;
            mark.competences.forEach(competence => {
              if (competence.value) { // Because 0 = student was missing
                sumOfCompetences += (competence.value - 1) / 3 * 20;
                coefOfCompetences += 1;
              }
            });
            if (coefOfCompetences) {
              sumOfMarks += sumOfCompetences / coefOfCompetences * mark.coefficient;
              coefOfMarks += mark.coefficient;
            }
          }
        }
      });

      if (coefOfMarks) {
        subject.average = sumOfMarks / coefOfMarks;
        subject.hasAverage = true;
      }
      if (coefOfClassMarks) {
        subject.classAverage = sumOfClassMarks / coefOfClassMarks;
        subject.hasClassAverage = true;
      }
    }
    
    function calculatePeriodAverage(period) {
      let sumOfSubjectAverages = 0
      let coefOfSubjectAverages = 0;
      let sumOfClassSubjectAverages = 0
      let coefOfClassSubjectAverages = 0;

      Object.values(period.subjects).forEach(subject => {
        let sumOfSubSubjects = 0;
        let coefOfSubSubjects = 0;
        let sumOfClassSubSubjects = 0;
        let coefOfClassSubSubjects = 0;

        Object.values(subject.subSubjects).forEach(subSubject => {
          calculateSubjectAverage(subSubject, (markID) => period.marks[markID]);
          if (subSubject.isEffective) {
            if (subSubject.hasAverage) {
              sumOfSubSubjects += subSubject.average * subSubject.coefficient;
              coefOfSubSubjects += subSubject.coefficient;
            }
            if (subSubject.hasClassAverage) {
              sumOfClassSubSubjects += subSubject.classAverage * subSubject.coefficient;
              coefOfClassSubSubjects += subSubject.coefficient;
            }
          }
        });

        // To not count twice marks in subject containing sub subjects
        if (!coefOfSubSubjects && !coefOfClassSubSubjects) {
          calculateSubjectAverage(subject, (markID) => period.marks[markID]);
        } else {
          if (coefOfSubSubjects) {
            subject.average = sumOfSubSubjects / coefOfSubSubjects;
            subject.hasAverage = true;
          }
          if (coefOfClassSubSubjects) {
            subject.classAverage = sumOfClassSubSubjects / coefOfClassSubSubjects;
            subject.hasClassAverage = true;
          }
        }
        
        if (subject.isEffective) {
          if (subject.hasAverage) {
            sumOfSubjectAverages += subject.average * subject.coefficient;
            coefOfSubjectAverages += subject.coefficient;
          }
          if (subject.hasClassAverage) {
            sumOfClassSubjectAverages += subject.classAverage * subject.coefficient;
            coefOfClassSubjectAverages += subject.coefficient;
          }
        }
      });

      if (coefOfSubjectAverages) {
        period.average = sumOfSubjectAverages / coefOfSubjectAverages;
        period.hasAverage = true;
      }
      if (coefOfClassSubjectAverages) {
        period.classAverage = sumOfClassSubjectAverages / coefOfClassSubjectAverages;
        period.hasClassAverage = true;
      }
    }

    var cacheData = {};
    const data = await AsyncStorage.getItem("marks");
    if (data) { cacheData = JSON.parse(data); }
    if (accountID in cacheData) {
      Object.values(cacheData[accountID].data).forEach(period => {
        calculatePeriodAverage(period);
      })
      await AsyncStorage.setItem("marks", JSON.stringify(cacheData));
    }
  }
  static async getLastTimeUpdatedMarks(accountID) {
    const marks = JSON.parse(await AsyncStorage.getItem("marks"));
    if (marks && accountID in marks) {
      return marks[accountID].date;
    }
  }


  // Preferences //
  static async getAllPreferences() {
    const data = await AsyncStorage.getItem("preferences");
    if (data) { return JSON.parse(data); }
    return {};
  }
  static async setAllPreferences(preferences) {
    await AsyncStorage.setItem("preferences", JSON.stringify(preferences));
  }
  static async getPreference(key) {
    const preferences = await this.getAllPreferences();
    if (key in preferences) { return preferences[key]; }
    else {
      preferences[key] = false; // Default value for all preferences
      await this.setAllPreferences(preferences);
    }
    return preferences[key];
  }
  static async setPreference(key, value) {
    const preferences = await this.getAllPreferences();
    preferences[key] = value;
    await this.setAllPreferences(preferences);
  }

  // Erase all data //
  static async eraseData() {
    await AsyncStorage.clear();
  }
  static async resetPreferences() {
    await AsyncStorage.multiRemove([
      "preferences",
      "customData",
    ]);
  }
}

export default AppData;