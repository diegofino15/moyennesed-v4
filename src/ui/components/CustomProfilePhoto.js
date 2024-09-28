import { useEffect, useState } from "react";
import { Image } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { UserRoundIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppData from "../../core/AppData";
import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Custom profile photo
function CustomProfilePhoto({ accountID, onPress, size=60, style, hasOtherPressAction=false }) {
  const { theme } = useGlobalAppContext();

  // Auto-update photo
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    if (!accountID) { return; }

    AsyncStorage.getItem("photos").then(async (cachePhotos) => {
      let photos = JSON.parse(cachePhotos);
      photos ??= {};

      // Use cache photo if less than three day old
      if (accountID in photos) {
        if (Date.now() - new Date(photos[accountID].date) < (86400000 * 3)) {
          setPhoto(photos[accountID].photo);
          return;
        }
      }
      getPhoto(accountID, async (newPhoto) => {
        photos[accountID] = {
          "date": new Date(),
          "photo": newPhoto,
        }
        await AsyncStorage.setItem("photos", JSON.stringify(photos));
        setPhoto(newPhoto);
      });
    });
  }, [accountID]);

  // Parse photo
  async function getPhoto(id, callback) {
    // Get photo URL
    const account = await AppData.getSpecificAccount(id);
    const photoURL = account.photoURL;

    // Fetch photo
    if (photoURL) {
      console.log(`Refreshing profile photo for account ${id}...`);
      const response = await fetch(`https:${photoURL}`, { headers: { 'Referer': `http:${photoURL}`, 'Host': 'doc1.ecoledirecte.com' } });
      let blob = await response.blob(); // Works for some reason
      let fileReaderInstance = new FileReader();
      fileReaderInstance.readAsDataURL(blob); 
      fileReaderInstance.onload = () => {
        let base64data = fileReaderInstance.result;
        callback(base64data);
      }
    } else { callback(null); }
  }

  return (
    <PressableScale style={{
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.surfaceOutline,
      ...style,
    }} onPress={onPress} activeScale={onPress ? 0.95 : 1} onLongPress={hasOtherPressAction ? () => {} : undefined}>
      {photo ? <Image source={{ uri: photo }} style={{
        width: size + 10,
        height: size + 10,
        borderRadius: 10,
        transform: [{ translateY: 5 }],
      }}/> : <UserRoundIcon size={size / 2} color={theme.colors.onSurfaceDisabled}/>}
    </PressableScale>
  );
}

export default CustomProfilePhoto;