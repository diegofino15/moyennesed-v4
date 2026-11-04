import { memo, useEffect } from "react";
import useState from "react-usestateref";
import { Alert, Dimensions, Text, View } from "react-native";
import LottieView from "lottie-react-native";

import CustomModal from "../../../components/CustomModal";
import CustomButton from "../../../components/CustomButton";
import CustomLink from "../../../components/CustomLink";
import CustomAdBannerForOtherApp from "../../../components/CustomAdBannerForOtherApp";
import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";
import AdsHandler from "../../../../core/AdsHandler";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";


// Ad information page
function AdsInformationPage({ navigation }) {
  const { theme } = useGlobalAppContext();
  
  // Consent form state
  const [canShowAdChoices, setCanShowAdChoices] = useState(false);
  const [feedback, setFeedback] = useState("idle"); // idle | updated | error
  const [, setIsUpdating, isUpdatingRef] = useState(false);

  useEffect(() => {
    let mounted = true;
    AdsHandler.canShowAdChoices().then((canShow) => {
      if (mounted) { setCanShowAdChoices(canShow); }
    });
    return () => { mounted = false; };
  }, []);

  // Open the privacy options form
  async function changeAdChoices() {
    if (isUpdatingRef.current) { return; }

    setIsUpdating(true);
    setFeedback("idle");
    try {
      await AdsHandler.showAdChoices();
      setFeedback("updated");
      setCanShowAdChoices(await AdsHandler.canShowAdChoices());
    } catch (e) {
      console.warn("Unable to show privacy options form:", e);
      setFeedback("error");
    } finally {
      setIsUpdating(false);
    }
  }

  // Open the Ad Inspector (dev only). It only works on registered test devices.
  async function openAdInspector() {
    const opened = await AdsHandler.openDebugger();
    if (!opened) {
      Alert.alert(
        "Ad Inspector indisponible",
        "Cet appareil doit être enregistré comme appareil de test. Ajoutez son identifiant (affiché dans les logs) à EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS, puis redémarrez l'app."
      );
    }
  }

  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  return (
    <CustomModal
      goBackFunction={() => navigation.pop()}
      style={{ paddingVertical: 0 }}
      horizontalPadding={0}
      setWidth={setWindowWidth}
      children={(
        <View>
          {/* Animation and title */}
          <View style={{
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <LottieView
              autoPlay
              hardwareAccelerationAndroid
              loop={false}
              source={require('../../../../../assets/lottie/about-ads.json')}
              style={{
                width: '70%',
                height: windowWidth * 0.7,
              }}
            />
            <Text style={[theme.fonts.titleMedium, { width: '90%', textAlign: 'center' }]}>Pourquoi les publicités ?</Text>
          </View>
          
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={[theme.fonts.labelLarge, { textAlign: "justify", marginBottom: 10 }]}>Les publicités permettent le financement du développement de l'app, afin qu'elle soit mise à jour régulièrement et que les bugs soient réglés au plus vite.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: "justify", marginBottom: 20 }]}>Les publicités restent toujours non personnalisées : vos données ne servent pas à vous profiler et aucun suivi entre applications ne vous est demandé. Vous pouvez modifier vos choix de consentement à tout moment.</Text>
            {canShowAdChoices ? (
              <CustomButton
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  paddingVertical: 10,
                }}
                onPress={changeAdChoices}
                title={(
                  <CustomAnimatedChangeableItem
                    animationTime={100}
                    updaters={[feedback]}
                    item={feedback === "updated" ? (
                      <>
                        <Text style={[theme.fonts.bodyMedium, { textAlign: "center" }]}>Préférences mises à jour</Text>
                        <Text style={[theme.fonts.labelMedium, { textAlign: "center" }]}>Vous pouvez les modifier à nouveau</Text>
                      </>
                    ) : feedback === "error" ? (
                      <>
                        <Text style={[theme.fonts.bodyMedium, { textAlign: "center" }]}>Réessayer</Text>
                        <Text style={[theme.fonts.labelMedium, { textAlign: "center" }]}>Impossible d'ouvrir le formulaire</Text>
                      </>
                    ) : (
                      <Text style={[theme.fonts.bodyMedium, { color: theme.colors.primary }]}>Gérer mes choix</Text>
                    )}
                  />
                )}
              />
            ) : null}

            {/* Ad */}
            <View style={{
              paddingVertical: 20,
              marginHorizontal: -20,
            }}>
              <Text style={[theme.fonts.labelLarge, { textAlign: "justify", margin: 20 }]}>Vous voulez profiter d'une expérience sans aucune publicité ? MoyennesED Sans Pubs est conçue pour cela.</Text>
              <CustomAdBannerForOtherApp alwaysShow/>
            </View>

            {/* Ad debugger */}
            {__DEV__ ? (
              <CustomLink
                onPress={openAdInspector}
                title={"Open ad debugger"}
              />
            ) : null}
          </View>
        </View>
      )}
    />
  );
}

export default memo(AdsInformationPage);
