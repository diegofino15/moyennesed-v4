// This class decides the color of each subject, that can be
// changed in the settings
class ColorsHandler {
  // The list of all available colors
  static availableColors = [
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

  static attribuatedSubjectColors = {};
  static currentIndex = 0;

  static registerSubjectColor(subjectID) {
    if (this.attribuatedSubjectColors[subjectID]) { return; }
    this.attribuatedSubjectColors[subjectID] = this.availableColors[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.availableColors.length;
  }

  static getSubjectColor(subjectID, isLight = false) {
    if (this.attribuatedSubjectColors[subjectID]) {
      if (isLight) { return this.attribuatedSubjectColors[subjectID][1]; }
      return this.attribuatedSubjectColors[subjectID][0];
    }

    this.registerSubjectColor(subjectID);
    if (isLight) { return this.attribuatedSubjectColors[subjectID][1]; }
    return this.attribuatedSubjectColors[subjectID][0];
  }

  static getSubjectColors(subjectID) {
    if (!this.attribuatedSubjectColors[subjectID]) {
      this.registerSubjectColor(subjectID);
    }
    return {
      "light": this.attribuatedSubjectColors[subjectID][1],
      "dark": this.attribuatedSubjectColors[subjectID][0],
    };
  }

  static resetSubjectColors() {
    this.currentIndex = 0;
    this.attribuatedSubjectColors = {};
  }
}

export default ColorsHandler;