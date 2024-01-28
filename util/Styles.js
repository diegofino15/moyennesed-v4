import { loadAsync } from 'expo-font';


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

// Set all colors and fonts in app
function initTheme(theme) {
  // Light
  // theme.colors = {
  //   background: '#FEF7F7',
  //   onBackground: '#222222',
  
  //   surface: '#ECECEC',
  //   onSurface: '#000',
  //   onSurfaceDisabled: '#888',
  
  //   primary: '#1985A1',
  //   onPrimary: '#FFF',
  //   onPrimaryDisabled: '#888',

  //   secondary: '#4CAF50',
  //   onSecondary: '#000',

  //   tertiary: '#DA3633',
  //   onTertiary: '#FFF',
  // };

  // Dark
  theme.colors = {
    background: '#020409',
    onBackground: '#E7EDF2',

    backdrop: '#0E1116',
  
    surface: '#171B21',
    onSurface: '#E7EDF2',
    onSurfaceDisabled: '#868D96',
    surfaceOutline: '#31363C',
  
    primary: '#1985A1',
    onPrimary: '#FFF',

    success: '#4CAF50',
    onSuccess: '#000',
    error: '#DA3633',
    onError: '#FFF',
  };

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

export { useFonts, initTheme };