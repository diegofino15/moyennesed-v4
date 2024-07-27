import { loadAsync } from 'expo-font';
import { DefaultTheme } from 'react-native-paper';


// Themes
class Themes {
  static DarkTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
      background: '#020409',
      onBackground: '#E7EDF2',
  
      backdrop: '#0E1116',
    
      surface: '#171B21',
      surfaceOutline: '#31363C',
      onSurface: '#E7EDF2',
      onSurfaceDisabled: '#868D96',
    
      primary: '#1985A1',
      primaryLight: '#162831',
      onPrimary: '#FFF',
      success: '#4CAF50',
      successLight: '#1F3023',
      error: '#DA3633',
      errorLight: '#33191C',
    },
  };

  static LightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      background: '#FFF',
      onBackground: '#020409',
  
      backdrop: '#E7EDF2',
  
      surface: '#E7EDF2',
      surfaceOutline: '#E7EDF2',
      onSurface: '#020409',
      onSurfaceDisabled: '#868D96',
  
      primary: '#1985A1',
      primaryLight: '#FFF',
      onPrimary: '#FFF',
      success: '#4CAF50',
      successLight: '#FFF',
      error: '#DA3633',
      errorLight: '#FFF',
    },
  };
};


// Load all fonts used in the app
const useFonts = async () => await loadAsync({
  'Text-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  'Text-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  'Text-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  'Text-Italic': require('../assets/fonts/Poppins-MediumItalic.ttf'),
  
  'MainTitle': require('../assets/fonts/Playball-Regular.ttf'),

  'Numbers-Regular': require('../assets/fonts/Rubik-Regular.ttf'),
  'Numbers-Medium': require('../assets/fonts/Rubik-Medium.ttf'),
  'Numbers-Bold': require('../assets/fonts/Rubik-Bold.ttf'),
});

// Set all fonts in app
function initThemeFonts(theme) {
  theme.fonts = {
    titleLarge: {
      fontSize: 35.0,
      fontFamily: 'Text-Medium',
      color: theme.colors.onBackground,
    },
    titleMedium: {
      fontSize: 25.0,
      fontFamily: 'Text-Medium',
      color: theme.colors.onBackground,
    },
    titleSmall: {
      fontSize: 20.0,
      fontFamily: 'Text-Medium',
      color: theme.colors.onBackground,
    },
  
    headlineLarge: {
      fontSize: 35.0,
      fontFamily: 'Numbers-Bold',
      color: theme.colors.onBackground,
    },
    headlineMedium: {
      fontSize: 20.0,
      fontFamily: 'Numbers-Medium',
      color: theme.colors.onBackground,
    },
    headlineSmall: {
      fontSize: 12.0,
      fontFamily: 'Numbers-Medium',
      color: theme.colors.onBackground,
    },
  
    bodyLarge: {
      fontSize: 17.0,
      fontWeight: 'normal',
      fontFamily: 'Text-Medium',
      color: theme.colors.onSurface,
    },
    bodyMedium: {
      fontSize: 15.0,
      fontWeight: 'normal',
      fontFamily: 'Text-Medium',
      color: theme.colors.onSurface,
    },
    bodySmall: {
      fontSize: 13.0,
      fontWeight: 'normal',
      fontFamily: 'Text-Medium',
      color: theme.colors.onSurface,
    },
  
    labelLarge: {
      fontSize: 17.0,
      fontWeight: 'normal',
      fontFamily: 'Text-Regular',
      color: theme.colors.onSurfaceDisabled,
    },
    labelMedium: {
      fontSize: 15.0,
      fontWeight: 'normal',
      fontFamily: 'Text-Regular',
      color: theme.colors.onSurfaceDisabled,
    },
    labelSmall: {
      fontSize: 13.0,
      fontWeight: 'normal',
      fontFamily: 'Text-Regular',
      color: theme.colors.onSurfaceDisabled,
    },
  }
}

// Main load function
async function initFontsAndThemes() {
  await useFonts();
  initThemeFonts(Themes.DarkTheme);
  initThemeFonts(Themes.LightTheme);
}

export { initFontsAndThemes, Themes };