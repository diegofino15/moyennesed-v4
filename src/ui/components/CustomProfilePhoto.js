import { useEffect, useState } from "react";
import { Image } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { UserRoundIcon } from "lucide-react-native";

import AccountHandler from "../../core/AccountHandler";
import { useGlobalAppContext } from "../../util/GlobalAppContext";
import StorageHandler from "../../core/StorageHandler";


// Custom profile photo
function CustomProfilePhoto({ accountID, onPress, size=60, style, hasOtherPressAction=false }) {
  const { theme } = useGlobalAppContext();

  // Auto-update photo
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    if (!accountID) { return; }

    StorageHandler.getData("photos").then(async (photos) => {
      // Use cache photo if less than three day old
      if (photos != null && (accountID in photos)) {
        if (Date.now() - new Date(photos[accountID].date) < (86400000 * 3)) {
          setPhoto(photos[accountID].photo);
          return;
        }
      }

      photos ??= {};
      getPhoto(accountID, async (newPhoto) => {
        photos[accountID] = {
          "date": new Date(),
          "photo": newPhoto,
        }
        await StorageHandler.saveData("photos", photos);
        setPhoto(newPhoto);
      });
    });
  }, [accountID]);

  // Parse photo
  async function getPhoto(id, callback) {
    // Get photo URL
    const account = await AccountHandler.getSpecificAccount(id);
    const photoURL = account.photoURL;

    // Fetch photo
    if (photoURL) {
      console.log(`Refreshing profile photo for account ${id}...`);
      const photoCookie = (await StorageHandler.getData("photoCookie")) ?? "";
      const response = await fetch(`https:${photoURL}`, {
        method: "GET",
        headers: {
          'Referer': `http:${photoURL}`,
          'Host': 'doc1.ecoledirecte.com',
          'User-Agent': process.env.EXPO_PUBLIC_ED_USER_AGENT,
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Cookie': photoCookie,
        }
      });
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