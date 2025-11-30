import StorageHandler from "./StorageHandler";


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

  static registerSubjectColor(subjectID) {
    if (this.attribuatedSubjectColors[subjectID]) { return; }
    this.attribuatedSubjectColors[subjectID] = this.defaultColors[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.defaultColors.length;
  }

  static setSubjectColor(subjectID, lightColor, darkColor) {
    this.customColors[subjectID] = [darkColor, lightColor];
    this.save();
  }

  static removeSubjectColor(subjectID) {
    delete this.customColors[subjectID];
    this.save();
  }

  static getSubjectColors(subjectID) {
    if (this.customColors[subjectID]) {
      return {
        "light": this.customColors[subjectID][1],
        "dark": this.customColors[subjectID][0],
      };
    }
    if (!this.attribuatedSubjectColors[subjectID]) {
      this.registerSubjectColor(subjectID);
      this.save();
    }
    return {
      "light": this.attribuatedSubjectColors[subjectID][1],
      "dark": this.attribuatedSubjectColors[subjectID][0],
    };
  }

  static isSubjectCustom(subjectID) {
    return this.customColors[subjectID] !== undefined;
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

  static async save() { await StorageHandler.saveData('colors', {
    attribuatedSubjectColors: this.attribuatedSubjectColors,
    customColors: this.customColors,
  }); }
  static async load() {
    const data = await StorageHandler.getData('colors');
    if (data) {
      this.attribuatedSubjectColors = data.attribuatedSubjectColors;
      this.customColors = data.customColors;
    }
  }
}

export default ColorsHandler;