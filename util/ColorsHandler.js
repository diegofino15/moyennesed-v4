import AsyncStorage from "@react-native-async-storage/async-storage";

// This class decides the color of each subject, that can be
// changed in the settings
class ColorsHandler {
  // The list of all default colors
  static defaultColors = [
    ['#FF6242', '#FF7C69'],   // Red
    ['#5BAEB7', '#81C8D1'],   // Blue
    ['#FA8072', '#FFA8A1'],   // Salmon
    ['#AA8E85', '#C2B4A9'],   // Gray
    ['#C58940', '#D9A468'],   // Brown
    ['#FFA07A', '#FFB59F'],   // Light Salmon
    ['#A17BB9', '#B99BCB'],   // Purple
    ['#87CEFA', '#A2D9FF'],   // Pastel Blue
    ['#FFC300', '#FFD955'],   // Vivid Yellow
    ['#FFB6C1', '#FFC3D0'],   // Pastel Pink
  ];

  static customColors = {};

  static attribuatedSubjectColors = {};
  static currentIndex = 0;

  static registerSubjectColor(accountID, subjectID) {
    this.createIfMissing(accountID);
    if (this.attribuatedSubjectColors[accountID][subjectID]) { return; }
    this.attribuatedSubjectColors[accountID][subjectID] = this.defaultColors[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.defaultColors.length;
  }

  static setSubjectColor(accountID, subjectID, lightColor, darkColor) {
    this.createIfMissing(accountID);
    this.customColors[accountID][subjectID] = [darkColor, lightColor];
    this.save();
  }

  static removeSubjectColor(accountID, subjectID) {
    this.createIfMissing(accountID);
    delete this.customColors[accountID][subjectID];
    this.save();
  }

  static getSubjectColors(accountID, subjectID) {
    this.createIfMissing(accountID);
    if (this.customColors[accountID][subjectID]) {
      return {
        "light": this.customColors[accountID][subjectID][1],
        "dark": this.customColors[accountID][subjectID][0],
      };
    }
    if (!this.attribuatedSubjectColors[accountID][subjectID]) {
      this.registerSubjectColor(accountID, subjectID);
      this.save();
    }
    return {
      "light": this.attribuatedSubjectColors[accountID][subjectID][1],
      "dark": this.attribuatedSubjectColors[accountID][subjectID][0],
    };
  }

  static isSubjectCustom(accountID, subjectID) {
    this.createIfMissing(accountID);
    return this.customColors[accountID][subjectID] !== undefined;
  }

  static resetSubjectColors() {
    this.currentIndex = 0;
    this.attribuatedSubjectColors = {};
    this.customColors = {};
    this.save();
  }

  static createIfMissing(accountID) {
    if (!this.attribuatedSubjectColors[accountID]) {
      this.attribuatedSubjectColors[accountID] = {};
    }
    if (!this.customColors[accountID]) {
      this.customColors[accountID] = {};
    }
  }

  static async save() { await AsyncStorage.setItem('colors', JSON.stringify({
    attribuatedSubjectColors: this.attribuatedSubjectColors,
    customColors: this.customColors,
  })); }
  static async load() {
    const cacheData = await AsyncStorage.getItem('colors');
    if (cacheData) {
      let data = JSON.parse(cacheData);
      this.attribuatedSubjectColors = data.attribuatedSubjectColors;
      this.customColors = data.customColors;
    }
  }
}

export default ColorsHandler;