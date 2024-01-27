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
            console.log("Login successful !");
            this.saveConnectedAccounts(response.data.data, response.data.token);
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
  // Refresh token
  static async refreshLogin() {
    const credentials = JSON.parse(await AsyncStorage.getItem("credentials"));
    const status = await this.login(credentials.username, credentials.password);
    return status == 1;
  }
  // Save all data from ÉcoleDirecte to cache
  static saveConnectedAccounts(loginData, token) {
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
        let school = account.profile.nomEtablissement;
        let grade = account.profile.classe.libelle;
        let photoURL = account.profile.photo;

        connectedAccounts[ID] = {
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
    AsyncStorage.setItem("accounts", JSON.stringify(connectedAccounts));
  }
  // One for most users, needed for ones with more than one account connected
  static async saveSelectedAccount(accountID) { await AsyncStorage.setItem("selectedAccount", `${accountID}`); }

  // Util functions //

  // One for most users, needed for ones with more than one account connected
  static async getSelectedAccount() { return await AsyncStorage.getItem("selectedAccount"); }
  // Get the main account
  static async getMainAccount() {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));
    const selectedAccount = await this.getSelectedAccount();
    return accounts[selectedAccount];
  }
  // Get specific account, used for children on parent accounts
  static async getSpecificAccount(accountID) {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));
    
    // For student accounts
    if (accountID in accounts) { return accounts[accountID]; }
    
    // For parent accounts
    for (const account in accounts) {
      if (accountID in account.children) { return account.children[account]; }
    }
  }
  // Get main account of any account, used to get login tokens from children accounts
  static async getMainAccountOfAnyAccount(accountID) {
    const accounts = JSON.parse(await AsyncStorage.getItem("accounts"));

    // For student accounts
    if (accountID in accounts) { return accounts[accountID]; }

    // For parent accounts
    for (const account in accounts) {
      if (accountID in account.children) { return account; }
    }
  }


  // Marks functions //

  // Get marks
  static async getMarks(accountID) {
    // Get login token
    const mainAccount = await this.getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;

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
            console.log(`Got marks for account ${accountID} !`);
            await this.updateToken(accountID, response.data.token);
            await this.saveMarks(accountID, response.data.data);
            status = 1;
          case 520: // Outdated token
            console.log("Outdated token, reconnecting...");
            const reloginSuccessful = await this.refreshLogin();
            if (reloginSuccessful) { return await this.getMarks(accountID); }
            status = 0;
          default:
            console.warn(`API responded with unknown code ${response.data.code}`);
            status = -1;
        }
      default:
        console.warn("API request failed");
        status = -1;
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
    for (const account in accounts) {
      if (accountID in account.children) {
        account.connectionToken = newToken;
        await AsyncStorage.setItem("accounts", JSON.stringify(accounts));
        return;
      }
    }
  }
  // Save marks data to cache
  static async saveMarks(accountID, marks) {
    // TODO
  }



  
  
  
  // Preferences
  static vibrate = true;
}

export default AppData;