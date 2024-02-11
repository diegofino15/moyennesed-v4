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
      var lastName = account.nom;
      var gender;
      
      // Student account
      if (accountType == "E") {
        gender = account.profile.sexe;
        let school = capitalizeWords(account.profile.nomEtablissement);
        let grade = account.profile.classe.libelle;
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
          let childLastName = childAccount.nom;
          let childGender = childAccount.sexe;
          let childSchool = capitalizeWords(childAccount.nomEtablissement);
          if (childSchool.length == 0) { childSchool = account.nomEtablissement; }
          let grade = childAccount.classe.libelle;
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
            "title": subjectGroupTitle,
            "subjects": subjectGroupSubjects,
          };
        } else {
          let subjectID = subject.codeMatiere;
          let subSubjectID = subject.codeSousMatiere;
          let subjectTitle = subject.discipline;
          let subjectCoefficient = parseFloat(subject.coef);
          if (!subjectCoefficient) { subjectCoefficient = 1; }
          let subjectTeachers = [];
          for (const teacher in subject.professeurs) { subjectTeachers.push(teacher.nom); }

          if (subSubjectID) {
            let finalSubject = {
              "title": subjectTitle,
              "coefficient": subjectCoefficient,
              "id": subjectID,
              "subID": subSubjectID,
              "isSub": true,
              "marks": [],
              "teachers": subjectTeachers,
            };
            // Find parent subject
            if (subjectID in periodSubjects) {
              let parentSubject = periodSubjects[subjectID];
              parentSubject.subSubjects[subSubjectID] = finalSubject;
            } else {
              periodSubjects[subjectID] = {
                "title": subjectID,
                "coefficient": subjectCoefficient,
                "id": subjectID,
                "isSub": false,
                "marks": [],
                "subSubjects": {},
                "teachers": subjectTeachers,
              };
              periodSubjects[subjectID].subSubjects[subSubjectID] = finalSubject;
            }
          } else {
            let subjectSubjectGroupID = subject.idGroupeMatiere;
            // Find subject group
            if (subjectSubjectGroupID in periodSubjectGroups) {
              periodSubjectGroups[subjectSubjectGroupID].subjects.push(subjectID);
            } else {
              periodSubjectGroups[subjectSubjectGroupID] = {
                "title": subjectSubjectGroupID,
                "subjects": [subjectID],
              };
              periodSubjectGroups[subjectSubjectGroupID].subjects.push(subjectID);
            }
            
            periodSubjects[subjectID] = {
              "title": subjectTitle,
              "coefficient": subjectCoefficient,
              "id": subjectID,
              "isSub": false,
              "marks": [],
              "subjectGroupID": subjectSubjectGroupID,
              "teachers": subjectTeachers,
              "subSubjects": {},
            };
          }
        }
      }
      periods[periodID] = {
        "id": periodID,
        "title": periodTitle,
        "isFinished": isPeriodFinished,
        "subjects": periodSubjects,
        "subjectGroups": periodSubjectGroups,
        "marks": [],
      };
    }

    // Add marks
    for (const mark of marks.notes) {
      let periodID = mark.codePeriode;
      let subjectID = mark.codeMatiere;
      let subSubjectID = mark.codeSousMatiere;

      let isMarkEffective = !(mark.enLettre || mark.nonSignificatif);
      let markValueStr = `${mark.valeur}`;
      let markClassValue = parseFloat(mark.moyenneClasse);
      let markValue = parseFloat(mark.valeur);
      let markValueOn = parseFloat(mark.noteSur);

      let markDate = mark.dateSaisie;
      let markCoefficient = parseFloat(mark.coef);
      if (!markCoefficient) { markCoefficient = 1; }

      let finalMark = {
        "isEffective": isMarkEffective,
        "valueStr": markValueStr,
        "classValue": markClassValue,
        "value": markValue,
        "valueOn": markValueOn,
        "date": markDate,
        "periodID": periodID,
        "subjectID": subjectID,
        "subSubjectID": subSubjectID,
        "coefficient": markCoefficient,
      };

      if (subSubjectID) {
        // Find parent subject
        if (subjectID in periods[periodID].subjects) {
          let parentSubject = periods[periodID].subjects[subjectID];
          parentSubject.subSubjects[subSubjectID].marks.push(finalMark);
        }
      }
      if (subjectID in periods[periodID].subjects) {
        let subject = periods[periodID].subjects[subjectID];
        subject.marks.push(finalMark);
      }

      periods[periodID].marks.push(finalMark);
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
    function calculateSubjectAverage(subject, sumOfMarks=0, coefOfMarks=0, sumOfClassMarks=0, coefOfClassMarks=0) {
      subject.marks.forEach(mark => {
        if (mark.isEffective) {
          if (mark.value) {
            sumOfMarks += (mark.value / mark.valueOn * 20) * mark.coefficient;
            coefOfMarks += mark.coefficient;
          }
          if (mark.classValue) {
            sumOfClassMarks += (mark.classValue / mark.valueOn * 20) * mark.coefficient;
            coefOfClassMarks += mark.coefficient;
          }
        }
      });
      let subjectAverage = sumOfMarks / coefOfMarks;
      subject.average = subjectAverage;

      let subjectClassAverage = sumOfClassMarks / coefOfClassMarks;
      subject.classAverage = subjectClassAverage;
    }
    
    function calculatePeriodAverage(period) {
      let sumOfSubjectAverages = 0
      let coefOfSubjectAverages = 0;
      let sumOfClassSubjectAverages = 0
      let coefOfClassSubjectAverages = 0;

      for (const subjectID in period.subjects) {
        const subject = period.subjects[subjectID];

        let sumOfMarks = 0;
        let coefOfMarks = 0;
        let sumOfClassMarks = 0;
        let coefOfClassMarks = 0;
        
        for (const subSubjectID in subject.subSubjects) {
          const subSubject = subject.subSubjects[subSubjectID];
          calculateSubjectAverage(subSubject);
          if (subSubject.average) {
            sumOfMarks += subSubject.average * subSubject.coefficient;
            coefOfMarks += subSubject.coefficient;
          }
          if (subSubject.classAverage) {
            sumOfClassMarks += subSubject.classAverage * subSubject.coefficient;
            coefOfClassMarks += subSubject.coefficient;
          }
        }

        // To not count twice marks in subject containing sub subjects
        if (!sumOfMarks) {
          calculateSubjectAverage(subject, sumOfMarks, coefOfMarks, sumOfClassMarks, coefOfClassMarks);
        }
        
        if (subject.average) {
          sumOfSubjectAverages += subject.average * subject.coefficient;
          coefOfSubjectAverages += subject.coefficient;
        }
        if (subject.classAverage) {
          sumOfClassSubjectAverages += subject.classAverage * subject.coefficient;
          coefOfClassSubjectAverages += subject.coefficient;
        }
      }

      let periodAverage = sumOfSubjectAverages / coefOfSubjectAverages;
      period.average = periodAverage;
      let periodClassAverage = sumOfClassSubjectAverages / coefOfClassSubjectAverages;
      period.classAverage = periodClassAverage;
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

  // Erase all data //
  static async eraseData() {
    await AsyncStorage.clear();
  }
  static async erasePreferences() {
    await AsyncStorage.multiRemove([
      
    ]);
  }
}

export default AppData;