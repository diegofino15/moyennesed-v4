import { useState, useEffect } from "react";
import { View, Text, Dimensions, Platform } from "react-native";
import { AlertTriangleIcon } from "lucide-react-native";
import LottieView from "lottie-react-native";

import CustomModal from "../../../components/CustomModal";
import CustomInformationCard from "../../../components/CustomInformationCard";
import { formatDate } from "../../../../util/Utils";
import AppData from "../../../../core/AppData";
import { useAppContext } from "../../../../util/AppContext";


// Information page
function MarksInformationPage({ globalDisplayUpdater, navigation, route }) {
  const { theme } = useAppContext();
  
  const { accountID } = route.params;
  
  // Get last date updated marks
  const [lastDateUpdated, setLastDateUpdated] = useState(null);
  useEffect(() => {
    AppData.getLastTimeUpdatedMarks(accountID).then(setLastDateUpdated);
  }, [globalDisplayUpdater]);

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
              source={require('../../../../assets/lottie/about-marks.json')}
              style={{
                width: '90%',
                height: windowWidth * 0.9,
                top: -30,
              }}
            />
            <Text style={[theme.fonts.titleMedium, { width: '90%', textAlign: 'center', top: -120 }]}>Comment sont calculées les moyennes ?</Text>
          </View>
          
          {/* Text */}
          <View style={{
            padding: 20,
            top: -110,
          }}>
            <CustomInformationCard
              title="Les moyennes ne sont pas exactes"
              description="Les moyennes affichées sont des approximations, ne vous y fiez pas à 100%."
              error={true}
              icon={<AlertTriangleIcon size={20} color={theme.colors.error}/>}
              style={{ marginBottom: 20 }}
            />
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>L'app récupère vos notes et calcule la moyenne pondérée par matière, puis la moyenne générale.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Dépendant de votre établissement, il est possible que les coefficients de chaque note et chaque matière ne soient pas exacts.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Vous pouvez modifier manuellement les coefficients des notes et des matières pour améliorer la précision des moyennes.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 30 }]}>Elles sont mises à jour en temps réel.</Text>
            <Text style={[theme.fonts.labelMedium, { fontFamily: 'Text-Italic' }]}>Dernière mise à jour : {formatDate(lastDateUpdated)}</Text>
          </View>
        </View>
      )}
    />
  );
}

export default MarksInformationPage;