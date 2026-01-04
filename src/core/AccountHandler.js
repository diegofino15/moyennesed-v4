import axios from "axios";

import APIEndpoints from "./APIEndpoints";
import ColorsHandler from "./ColorsHandler";
import CoefficientHandler from "./CoefficientHandler";
import { capitalizeWords } from "../util/Utils";
import { getGtkToken, doLogin } from "../util/functions";
import StorageHandler from "./StorageHandler";


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
  static multipleAccounts = false;

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
    console.log(gtk);
    console.log(cookie); // Needed ? Login doesn't work without these logs (very strange)
    if (!gtk) {
      console.warn("Impossible to login without token, aborting login");
      return -1;
    }
    await StorageHandler.saveData("gtk", { gtk: gtk, cookie: cookie });

    // Get double auth tokens
    var cn = ""; var cv = "";
    const doubleAuthTokens = await StorageHandler.getData("double-auth-tokens");
    if (doubleAuthTokens) {
      cn = doubleAuthTokens.cn;
      cv = doubleAuthTokens.cv;
    }
    var response = await doLogin(username, password, gtk, cookie, this.temporary2FAToken, cn, cv, (err) => {
      console.warn("An error occured when logging in : " + err);
    }, this.USED_URL);
    response ??= { status: 500 };
   
    var status = 0; // 1 = success | 2 = choose account | 3 = security question | 0 = wrong password | -1 = error
    switch (response.status) {
      case 200:
        console.log("API request successful");
        StorageHandler.saveData("logs-login", response.data);
        switch (response.data.code) {
          case 200:
            await this._saveConnectedAccounts(
              response.data.data,
              response.data.token,
            );
            status = 1;
            if (response.data.data.accounts.length != 1) {
              this.multipleAccounts = true;
              let alreadySavedPreference = await StorageHandler.getData("selectedAccount");
              if (!alreadySavedPreference || alreadySavedPreference == 0) { status = 2; }
            } else {
              await this.saveSelectedAccount(response.data.data.accounts[0].id);
            }
            await StorageHandler.saveData("credentials", {
              username: username,
              password: password,
            });
            console.log("Login successful !");
            break;
          case 250: // Need to confirm identity with security question
            await StorageHandler.saveData("credentials", {
              username: username,
              password: password,
            });
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
    const credentials = await StorageHandler.getData("credentials");
    const status = await this.login(credentials.username, credentials.password);
    return status;
  }
  // Refresh token when switching accounts
  static async refreshToken(oldAccountID, newAccountID) {
    // Get ID-login
    const account = await this.getSpecificAccount(newAccountID);
    const loginID = account.loginID;

    return this.parseEcoleDirecte(
      "renew token",
      oldAccountID,
      `${this.USED_URL}${APIEndpoints.RENEW_TOKEN}`,
      `data={"idUser": ${loginID}, "uuid": ""}`,
      async (data) => {
        console.log("Updated token !");
        const accounts = await StorageHandler.getData("accounts");
        await this._saveAccount(data, accounts[newAccountID].connectionToken);
        return 1;
      },
      "post",
      newAccountID
    );
  }
  // Save all data from ÉcoleDirecte to cache
  static async _saveConnectedAccounts(loginData, token) {
    // Loop trough connected accounts
    for (const account of loginData.accounts) {
      await this._saveAccount(account, token);
    }
  }
  // Save only one account
  static async _saveAccount(account, token) {
    const supportedAccountTypes = ["E", "1"] // Student and parent
    
    // Get old login-id
    var accounts = (await StorageHandler.getData("accounts")) ?? {};

    let loginID = `${account.idLogin}`
    if (account.id in accounts) {
      loginID = accounts[account.id].loginID;
    }

    // Data
    var accountData = {};

    let ID = `${account.id}`;
    if (!supportedAccountTypes.includes(`${account.typeCompte}`)) {
      console.warn(`Unsupported account type : ${account.typeCompte}`);
      return;
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

      accountData = {
        id: ID,
        loginID: loginID,
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

      accountData = {
        id: ID,
        loginID: loginID,
        connectionToken: token,
        accountType: accountType,
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        children: children,
      };
    }

    accounts[account.id] = accountData;
    await StorageHandler.saveData("accounts", accounts);
  }
  // One for most users, needed for ones with more than one account connected
  static async saveSelectedAccount(accountID) {
    await StorageHandler.saveData("selectedAccount", `${accountID}`);
  }
  // Update login token
  static async _updateToken(accountID, newToken) {
    const accounts = await StorageHandler.getData("accounts");

    // For student accounts
    if (accountID in accounts) {
      accounts[accountID].connectionToken = newToken;
      await StorageHandler.saveData("accounts", accounts);
      return;
    }

    // For parent accounts
    for (const account_ in accounts) {
      const account = accounts[account_];
      if (account.accountType == "P") {
        if (accountID in account.children) {
          account.connectionToken = newToken;
          await StorageHandler.saveData("accounts", accounts);
          return;
        }
      }
    }
  }


  // Util functions //

  // One for most users, needed for ones with more than one account connected
  static async _getSelectedAccount() {
    var selectedAccount = await StorageHandler.getData("selectedAccount");
    if (selectedAccount) {
      return selectedAccount;
    }
    var accounts = await StorageHandler.getData("accounts");
    accounts ??= { 0: {} };
    selectedAccount = Object.keys(accounts)[0];
    await StorageHandler.saveData("selectedAccount", selectedAccount);
    return selectedAccount;
  }
  // Get the main account
  static async getMainAccount() {
    const accounts = await StorageHandler.getData("accounts");
    const selectedAccount = await this._getSelectedAccount();
    return accounts && selectedAccount ? accounts[selectedAccount] : null;
  }
  // Get specific account, used for children on parent accounts
  static async getSpecificAccount(accountID) {
    const accounts = await StorageHandler.getData("accounts");

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
    const accounts = await StorageHandler.getData("accounts");

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
    await StorageHandler.saveData("selectedChildAccount", `${accountID}`);
  }
  static async getSelectedChildAccount() {
    return await StorageHandler.getData("selectedChildAccount");
  }


  // Preferences //
  static async _setAllPreferences(preferences) {
    await StorageHandler.saveData("preferences", preferences);
  }
  static async _getAllPreferences() {
    const data = await StorageHandler.getData("preferences");
    return data ?? {};
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
  static async parseEcoleDirecte(title, accountID, url, payload, successCallback, verbe="get", accountIDForToken=0) {
    // Get login token
    const mainAccount = await this._getMainAccountOfAnyAccount(accountID);
    const token = mainAccount.connectionToken;
    if (accountIDForToken == 0) { accountIDForToken = accountID; }
    
    console.log(`Getting ${title} for account ${accountID}...`);

    // Get gtk
    const { gtk } = (await StorageHandler.getData("gtk")) ?? await getGtkToken();

    var response = await axios.post(
      `${url}?verbe=${verbe}&v=4`,
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
        StorageHandler.getData(filename).then(fileData => {
          let data = fileData ?? {};
          data[accountID] = response.data;
          StorageHandler.saveData(filename, data);
        });

        switch (response.data.code) {
          case 200:
            await this._updateToken(accountIDForToken, response.data.token);
            status = await successCallback(response.data?.data);
            console.log(`Got ${title} for account ${accountID} ! (status ${status})`);
            break;
          case 520: // Outdated token
            console.log("Outdated token, reconnecting...");
            const reloginStatus = await this.refreshLogin();
            if (reloginStatus == 1) {
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
    await StorageHandler.clear();
  }
  static async eraseCacheData() {
    // Put here temporary files
    await StorageHandler.deleteFiles([
      "specific-homework",
      "photos",
      "votes",
    ]);

    // Homework attachments
    await StorageHandler.deleteAllDocuments();
  }
}

export default AccountHandler;