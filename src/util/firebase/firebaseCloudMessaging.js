import { Platform } from 'react-native';
import { RESULTS, checkNotifications, requestNotifications } from 'react-native-permissions';


async function requestUserPermission() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const authorizationStatus = await checkNotifications();
    if (authorizationStatus.status === RESULTS.DENIED) {
      const newAuthorizationStatus = await requestNotifications();
      return newAuthorizationStatus.status === RESULTS.GRANTED;
    }
    return authorizationStatus.status === RESULTS.GRANTED;
  }
  return false;
}

async function setupNotifications() {
  try {
    const result = await requestUserPermission();
    console.log(`Notification setup done, authorization: ${result ? "granted" : "denied"}`);
  } catch (error) {
    console.warn('Notifications setup failed:', error);
  }
}

export { setupNotifications };