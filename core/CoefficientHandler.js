import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeString } from "../util/Utils";


/* This class contains all the logic needed to find the
right coefficient for any given mark or subject */
class CoefficientHandler {
  static guessSubjectCoefficientEnabled = {};
  static guessMarkCoefficientEnabled = {};
  static didChooseIfEnable = {};
  
  // SUBJECTS //
  
  // Per accountID
  static choosenProfiles = {};
  // All the available profiles for the user
  static profiles = {
    Collège: {
      subjects: { // if subject's name contains keyword, it gets the coefficient
        francais: 3, franc: 3,
        maths: 3, mathematiques: 3,
        histoire: 3, his: 3, geographie: 3, geo: 3,
        physique: 2, chimie: 2,
        svt: 2, sciences: 2, vie: 2, terre: 2,
        eps: 2, sport: 2, sportif: 2, sportive: 2,
        ses: 2, eco: 2, economique: 2, sociale: 2,
        anglais: 3, ang: 3, lv1: 3, lva: 3,
        espagnol: 2, esp: 2, allemand: 2, all: 2, lv2: 2, lvb: 2,
      }
    },
    Lycée: {
      subjectGroupSpecialCoefficient: { // If subject is in subjectGroup, it gets the coefficient
        spe: 8,
        tronc: 3, commun: 3,
      },
      subjects: {
        spe: 8,
        franc: 10,
        emc: 1, moral: 1, civique: 1,
      }
    },
  };
  // Choose a coefficient for a given subject
  static chooseSubjectCoefficient(accountID, rawSubjectTitle, rawSubjectGroupTitle="") {
    var chosenCoefficient = 1;
    
    const profile = this.choosenProfiles[accountID] ?? Object.keys(this.profiles)[0];
    const profileData = this.profiles[profile];

    const subjectTitle = normalizeString(rawSubjectTitle.toLowerCase());
    const subjectGroupTitle = normalizeString(rawSubjectGroupTitle.toLowerCase());

    // Check if subject falls into a subjectGroup
    if (subjectGroupTitle && profileData.subjectGroupSpecialCoefficient) {
      Object.keys(profileData.subjectGroupSpecialCoefficient).forEach(keyword => {
        if (subjectGroupTitle.includes(keyword)) {
          chosenCoefficient = profileData.subjectGroupSpecialCoefficient[keyword];
        }
      });
    }

    // Check for every keyword
    Object.keys(profileData.subjects).forEach(keyword => {
      if (subjectTitle.includes(keyword)) {
        chosenCoefficient = profileData.subjects[keyword];
      }
    });

    return chosenCoefficient;
  }

  // MARKS //
  static marksKeywords = {};
  static chooseMarkCoefficient(rawMarkTitle) {
    var chosenCoefficient = 1;
    
    const markTitle = normalizeString(rawMarkTitle.toLowerCase());
    
    Object.keys(this.marksKeywords).forEach(keyword => {
      if (markTitle.includes(keyword)) {
        chosenCoefficient = this.marksKeywords[keyword];
      }
    });

    return chosenCoefficient;
  }

  // Setters
  static async setGuessSubjectCoefficientEnabled(accountID, enabled) {
    this.guessSubjectCoefficientEnabled[accountID] = enabled;
    this.didChooseIfEnable[accountID] = true;
    await this.save();
  }
  static async setChoosenProfile(accountID, profile) {
    this.choosenProfiles[accountID] = profile;
    this.didChooseIfEnable[accountID] = true;
    await this.save();
  }
  static async setGuessMarkCoefficientEnabled(accountID, enabled) {
    this.guessMarkCoefficientEnabled[accountID] = enabled;
    this.didChooseIfEnable[accountID] = true;
    await this.save();
  }

  // Save and load
  static async save() {
    await AsyncStorage.setItem('coefficient-profiles', JSON.stringify({
      'profiles': this.choosenProfiles,
      'guessSubjectCoefficientEnabled': this.guessSubjectCoefficientEnabled,
      'guessMarkCoefficientEnabled': this.guessMarkCoefficientEnabled,
      'didChooseIfEnable': this.didChooseIfEnable,
    }));
  }
  static async load() {
    const jsonData = await AsyncStorage.getItem('coefficient-profiles');
    if (jsonData) {
      const data = JSON.parse(jsonData);
      this.choosenProfiles = data.profiles;
      this.guessSubjectCoefficientEnabled = data.guessSubjectCoefficientEnabled;
      this.guessMarkCoefficientEnabled = data.guessMarkCoefficientEnabled;
      this.didChooseIfEnable = data.didChooseIfEnable;
    }
  }

  static erase() {
    this.choosenProfiles = {};
    this.guessSubjectCoefficientEnabled = {};
    this.guessMarkCoefficientEnabled = {};
    this.didChooseIfEnable = {};
  }
}

export default CoefficientHandler;