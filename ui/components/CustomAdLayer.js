import { useEffect } from "react";
import useState from "react-usestateref";
import { Platform, View, Text, ActivityIndicator } from "react-native";
import { TestIds, RewardedAd, AdEventType, RewardedAdEventType } from "react-native-google-mobile-ads";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PressableScale } from "react-native-pressable-scale";
import { BlurView } from "expo-blur";
import { HelpCircleIcon, VideoIcon } from "lucide-react-native";

import CustomChooser from "./CustomChooser";
import AdsHandler from "../../core/AdsHandler";
import { useAppContext } from "../../util/AppContext";


// Places an ad on top of a component
function CustomAdLayer({ width, height, child, setCanShowAverage, navigation }) {
  const { theme, canServeAds } = useAppContext();
  
  // Show the ad ?
  const [canShowContent, setCanShowContent, canShowContentRef] = useState(false);
  
  // Ad objects
  const AD_COOLDOWN = 12 * 60 * 60 * 1000;
  const [rewardedAd, setRewardedAd, rewardedAdRef] = useState(null);
  const [loadingAd, setLoadingAd] = useState(true);

  // Check if ad should be shown
  useEffect(() => { checkIfAdShouldBeShown(); }, [canServeAds]);
  async function checkIfAdShouldBeShown() {
    if (rewardedAd) { return; }
    const lastAdTime = await AsyncStorage.getItem('lastAdTime');
    if (lastAdTime == null) {
      console.log("First time opening app, no ad");
      setCanShowContent(true);
      setCanShowAverage(true);
      AsyncStorage.setItem("lastAdTime", Date.now().toString());
    } else if (Date.now() - parseInt(lastAdTime) < AD_COOLDOWN) {
      console.log("Ad cooldown not finished");
      setCanShowAverage(true);
      setCanShowContent(true);
    } else if (canServeAds) {
      console.log("Should show ad !");
      loadAd();
    }
  }

  // Ad helper functions
  function getAdUnitID() { return __DEV__ ? TestIds.REWARDED : Platform.select({
    ios: process.env.EXPO_PUBLIC_IOS_REWARDED_AD_UNIT_ID,
    android: process.env.EXPO_PUBLIC_ANDROID_REWARDED_AD_UNIT_ID,
  })}
  function getNewAd() { return RewardedAd.createForAdRequest(getAdUnitID(), {
    keywords: ['élève', 'lycéen', 'collège', 'lycée', 'école', 'éducation'],
    requestNonPersonalizedAdsOnly: !AdsHandler.servePersonalizedAds,
  });}
  async function loadAd() {
    setLoadingAd(true);
    setRewardedAd(getNewAd());

    rewardedAdRef.current.addAdEventsListener(event => {
      if (event.type === RewardedAdEventType.LOADED) {
        console.log("Ad loaded !")
        setLoadingAd(false);
      } else if (event.type === RewardedAdEventType.EARNED_REWARD || event.type === AdEventType.ERROR) {
        console.log("Ad finished, granting reward !");
        setCanShowContent(true);
        setCanShowAverage(true);
        AsyncStorage.setItem("lastAdTime", Date.now().toString());
      } else if (event.type === AdEventType.CLOSED && !canShowContentRef.current) {
        console.log("Closed ad before end !");
        setRewardedAd(null);
        loadAd();
      }
    });

    console.log("Loading ad...");
    rewardedAdRef.current.load();
  }

  return canShowContent ? child : (
    <View style={{ justifyContent: 'center' }}>
      {child}
      <PressableScale style={{
        width: width,
        height: height,
        borderWidth: 2,
        borderColor: theme.colors.background,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'absolute',
        alignSelf: 'center',
      }} onPress={() => {
        if (rewardedAd.loaded) { rewardedAd.show(); }
      }}>
        <BlurView tint="light" intensity={25} style={{
          padding: 10,
          width: '100%',
          height: '100%',
          borderRadius: 10,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Platform.select({ ios: null, android: theme.colors.background }),
        }}>
          {loadingAd ? (
            <ActivityIndicator size={"large"} color={theme.colors.onSurface}/>
          ) : (
            <>
              <VideoIcon size={40} color={theme.colors.onSurface}/>
              <Text style={[theme.fonts.labelMedium, { textAlign: 'center' }]}>DÉVOILER LA MOYENNE</Text>
            </>
          )}
        </BlurView>
      </PressableScale>
      <View style={{
        position: 'absolute',
        right: 0,
      }}>
        <CustomChooser
          title={"Dev options"}
          items={__DEV__ ? [
            { id: "ad-inspector", title: "Open Ad Inspector" },
          ] : []}
          setSelected={(_) => AdsHandler.openDebugger()}
          defaultItem={(
            <PressableScale onPress={() => navigation.navigate("AdsInformationPage")} onLongPress={__DEV__ ? () => {} : undefined}>
              <HelpCircleIcon size={25} color={theme.colors.onSurfaceDisabled}/>
            </PressableScale>
          )}
          longPress
        />
      </View>
    </View>
  );
}

export default CustomAdLayer;