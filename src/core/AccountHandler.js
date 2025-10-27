import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import axios from "axios";

import APIEndpoints from "./APIEndpoints";
import ColorsHandler from "./ColorsHandler";
import CoefficientHandler from "./CoefficientHandler";
import { capitalizeWords } from "../util/Utils";
import { getGtkToken, doLogin } from "../util/functions";


// This class contains the account-related functions
class AccountHandler {
  // Base URL
  static USED_URL = APIEndpoints.OFFICIAL_API;


  // Login functions //

  // Helper, needed to open security question popup whenever needed
  static openDoubleAuthPopup = null;
  static wantToOpenDoubleAuthPopup = false;
  static temporaryLoginToken = "";
  static temporary2FAToken = "";

  // Login
  static async login(username, password) {
    // Demo account
    this.USED_URL = APIEndpoints.OFFICIAL_API;
    if (username.substring(0, 11) == "demoaccount") {
      this.USED_URL = APIEndpoints.CUSTOM_API;
      console.log("Using custom API");
    }
    console.log(`Logging-in ${username}...`);

    // Firstly get the x-gtk token
    const { gtk, cookie } = await getGtkToken();
    if (!gtk) {
      console.warn("Impossible to login without token, aborting login");
      return -1;
    }
    await AsyncStorage.setItem("gtk", JSON.stringify({ gtk: gtk, cookie: cookie }));

    // Get double auth tokens
    var cn = ""; var cv = "";
    const doubleAuthTokens = await AsyncStorage.getItem("double-auth-tokens");
    if (doubleAuthTokens) {
      let data = JSON.parse(doubleAuthTokens);
      cn = data.cn;
      cv = data.cv;
    }
    var response = await doLogin(username, password, gtk, cookie, this.temporary2FAToken, cn, cv, (err) => {
      console.warn("An error occured when logging in : " + err);
    }, this.USED_URL);
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
              let alreadySavedPreference = await AsyncStorage.getItem("selectedAccount");
              if (!alreadySavedPreference || alreadySavedPreference == 0) { status = 2; }
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
            this.temporary2FAToken = response.headers["2fa-token"];
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

  // The function used for every EcoleDirecte API call
  static async parseEcoleDirecte(title, accountID, url, payload, successCallback, verbe="get") {
    // Get login token
    const mainAccount = await this._getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;
    
    console.log(`Getting ${title} for account ${accountID}...`);

    // Get gtk
    const { gtk } = (JSON.parse(await AsyncStorage.getItem("gtk"))) ?? await getGtkToken();

    var response = await axios.post(
      `${url}?verbe=${verbe}&v=${process.env.EXPO_PUBLIC_ED_API_VERSION}`,
      payload,
      { headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Token": token, "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT, "X-GTK": gtk, "Cookie": `GTK=${gtk}` } },
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
  static async eraseCacheData() {
    // Put here temporary files
    await AsyncStorage.multiRemove([
      "specific-homework",
      "photos",
      "votes",
    ]);

    // Homework attachements
    RNFS.readDir(`${RNFS.DocumentDirectoryPath}/files`).then(files => {
      files.forEach(file => {
        if (file.isFile()) {
          RNFS.unlink(file.path);
        }
      });
    });
  }
}

export default AccountHandler;