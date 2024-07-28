import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';


async function iOSRequestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

function androidRequestUserPermission() {
  PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  ).then(result => {
    console.log('Notification permission result:', result);
  });
}

function setupNotifications() {
  if (Platform.OS === 'ios') {
    iOSRequestUserPermission();
  } else {
    androidRequestUserPermission();
  }
}

export { setupNotifications };