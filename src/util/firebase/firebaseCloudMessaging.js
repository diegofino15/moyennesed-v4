import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';


async function iOSRequestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log(`Notifications are ${enabled ? "allowed" : "not allowed"} !`);
  }
}

async function androidRequestUserPermission() {
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  console.log('Notification permission result:', result);
}

async function setupNotifications() {
  if (Platform.OS === 'ios') {
    await iOSRequestUserPermission();
  } else {
    await androidRequestUserPermission();
  }
}

export { setupNotifications };