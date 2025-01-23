import { memo } from "react";
import useState from "react-usestateref";
import { Dimensions, Platform, Text, View } from "react-native";
import LottieView from "lottie-react-native";

import CustomModal from "../../../components/CustomModal";
import CustomButton from "../../../components/CustomButton";
import CustomAdBannerForOtherApp from "../../../components/CustomAdBannerForOtherApp";
import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";
import AdsHandler from "../../../../core/AdsHandler";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";


// Ad information page
function AdsInformationPage({ navigation }) {
  const { theme } = useGlobalAppContext();
  
  // Change ad choices
  const [needToRestartApp, setNeedToRestartApp] = useState(false);

  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);
  
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
            <Text style={[theme.fonts.labelLarge, { textAlign: "justify", marginBottom: 20 }]}>Vous pouvez changer à tout moment vos préférences de personnalisation des publicités.</Text>
            <CustomButton
              style={{
                backgroundColor: theme.colors.primaryLight,
                borderWidth: 2,
                borderColor: theme.colors.primary,
                paddingVertical: 10,
              }}
              onPress={() => {
                AdsHandler.resetAdChoices();
                setNeedToRestartApp(true);
              }}
              title={(
                <CustomAnimatedChangeableItem
                  animationTime={100}
                  updaters={[needToRestartApp]}
                  item={needToRestartApp ? (
                    <>
                      <Text style={[theme.fonts.bodyMedium, { textAlign: "center" }]}>Redémarrez l'app</Text>
                      <Text style={[theme.fonts.labelMedium, { textAlign: "center" }]}>pour choisir à nouveau</Text>
                    </>
                  ) : (
                    <Text style={[theme.fonts.bodyMedium, { color: theme.colors.primary }]}>Changer de choix</Text>
                  )}
                />
              )}
            />

            {/* Ad */}
            <View style={{
              paddingTop: 20,
              marginHorizontal: -20,
            }}>
              <CustomAdBannerForOtherApp alwaysShow/>
            </View>
          </View>
        </View>
      )}
    />
  );
}

export default memo(AdsInformationPage);