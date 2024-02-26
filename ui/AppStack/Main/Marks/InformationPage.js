import { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { AlertTriangleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import LottieView from "lottie-react-native";

import CustomModal from "../../../components/CustomModal";
import CustomInformationCard from "../../../components/CustomInformationCard";
import { formatDate } from "../../../../util/Utils";
import AppData from "../../../../core/AppData";


// Information page
function InformationPage({ navigation, route }) {
  // Get last time the marks were updated
  const { accountID } = route.params;
  const [lastTimeUpdatedMarks, setLastTimeUpdatedMarks] = useState(null);
  useEffect(() => { AppData.getLastTimeUpdatedMarks(accountID).then(setLastTimeUpdatedMarks); }, []);
  
  return (
    <CustomModal
      goBackFunction={() => navigation.pop()}
      style={{ padding: 0 }}
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
                height: Dimensions.get('window').width * 0.9,
                top: -30,
              }}
            />
            <Text style={[DefaultTheme.fonts.titleMedium, { width: '90%', textAlign: 'center', top: -120 }]}>Comment sont calculées les moyennes ?</Text>
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
              icon={<AlertTriangleIcon size={20} color={DefaultTheme.colors.error}/>}
              style={{ marginBottom: 20 }}
            />
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Dépendant de votre établissement, il est possible que les coefficients de chaque note et chaque matière ne soient pas exacts.</Text>
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>Vous pouvez modifier manuellement les coefficients des notes et des matières pour améliorer la précision des moyennes.</Text>
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 30 }]}>La moyenne est mise à jour en temps réel, mais elle peut être différente de celle finale affichée sur votre bulletin.</Text>
            <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: 'Text-Italic' }]}>Dernière mise à jour : {formatDate(lastTimeUpdatedMarks)}</Text>
          </View>
        </View>
      )}
    />
  );
}

export default InformationPage;