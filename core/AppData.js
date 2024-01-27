import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { capitalizeWords } from "../util/Utils";


// This class contains the data used inside cache troughout the app
class AppData {
  // Base URLs
  static API_URL = "https://api.ecoledirecte.com";
  static CUSTOM_API_URL = "https://api.moyennesed.my.to/test-api";
  
  // Login function
  static async login(username, password) {
    // Demo account
    let usedURL = AppData.API_URL;
    if (username.substring(0, 11) == "demoaccount") {
      usedURL = this.CUSTOM_API_URL;
      console.log("Using custom API");
    }

    console.log(`Logging-in ${username}...`);

    const credentials = {
      "identifiant": username,
      "motdepasse": encodeURIComponent(password),
    };
    var response = await axios.post(
      `${usedURL}/v3/login.awp?v=4`,
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
            console.log("Login successful !");
            this.saveConnectedAccounts(response.data.data);
            status = 1;
            if (response.data.data.accounts.length != 1) { status = 2; }
            else { await this.saveSelectedAccount(response.data.data.accounts[0].id); }
            await AsyncStorage.setItem("credentials", JSON.stringify({
              "username": username,
              "password": password,
            }));
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
  static saveConnectedAccounts(loginData) {
    var connectedAccounts = {};

    // Loop trough connected accounts
    for (const account of loginData.accounts) {
      var ID = `${account.id}`;
      var accountType = account.typeCompte; // E = student | 1 = parent
      var firstName = capitalizeWords(account.prenom);
      var lastName = account.nom;
      var gender;
      
      // Student account
      if (accountType == "E") {
        gender = account.profile.sexe;
        let school = account.profile.nomEtablissement;
        let grade = account.profile.classe.libelle;
        let photoURL = account.profile.photo;

        connectedAccounts[ID] = {
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
          let childSchool = childAccount.nomEtablissement;
          if (childSchool.length == 0) { childSchool = account.nomEtablissement; }
          let grade = childAccount.classe.libelle;
          let childPhotoURL = childAccount.photo;

          children[childID] = {
            "firstName": childFirstName,
            "lastName": childLastName,
            "gender": childGender,
            "school": childSchool,
            "grade": grade,
            "photoURL": childPhotoURL,
          }
        }

        connectedAccounts[ID] = {
          "accountType": accountType,
          "firstName": firstName,
          "lastName": lastName,
          "gender": gender,
          "children": children,
        }
      }
    }

    // Save data
    AsyncStorage.setItem("accounts", JSON.stringify(connectedAccounts));
  }
  static async saveSelectedAccount(accountID) {
    await AsyncStorage.setItem("selectedAccount", `${accountID}`);
  }
  
  
  
  
  
  // Preferences
  static vibrate = true;
  
  
  
  // Transform data into savable cache
  static getCachedData() {
    return {
      "accountID": 1662
    }
  }
  
  // Save cache
  static async saveCache() {
    AsyncStorage.setItem("cache", JSON.stringify(this.getCachedData()));
  }

  // Load cache
  static async loadCache() {
    AsyncStorage.getItem("cache").then(cacheData => {
      if (cacheData) {
        const data = JSON.parse(cacheData);
      }
    });
  }
}

export default AppData;