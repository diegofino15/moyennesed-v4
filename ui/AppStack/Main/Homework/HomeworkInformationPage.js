import { useState, useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { AlertTriangleIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import LottieView from "lottie-react-native";

import CustomModal from "../../../components/CustomModal";
import CustomInformationCard from "../../../components/CustomInformationCard";
import { formatDate } from "../../../../util/Utils";
import AppData from "../../../../core/AppData";


// Information page
function HomeworkInformationPage({ globalDisplayUpdater, navigation, route }) {
  const { accountID } = route.params;
  
  // Get last date updated marks
  const [lastDateUpdated, setLastDateUpdated] = useState(null);
  useEffect(() => {
    AppData.getLastTimeUpdatedHomework(accountID).then(setLastDateUpdated);
  }, [globalDisplayUpdater]);

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
              source={require('../../../../assets/lottie/about-homework.json')}
              style={{
                width: '90%',
                height: Dimensions.get('window').width * 0.9,
                top: -30,
              }}
            />
            <Text style={[DefaultTheme.fonts.titleMedium, { width: '90%', textAlign: 'center', top: -100 }]}>Comment sont trouvés les contrôles ?</Text>
          </View>
          
          {/* Text */}
          <View style={{
            padding: 20,
            top: -90,
          }}>
            <CustomInformationCard
              title="Il peut manquer certains contrôles"
              description={`Certains professeurs ne cochent pas la case "contrôle", l'app ne les détectera pas.`}
              error={true}
              icon={<AlertTriangleIcon size={20} color={DefaultTheme.colors.error}/>}
              style={{ marginBottom: 20 }}
            />
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>L'app récupère vos devoirs et détecte si un contrôle est prévu pour chaque matière.</Text>
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 30 }]}>Ils sont mis à jour en temps réel.</Text>
            <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: 'Text-Italic' }]}>Dernière mise à jour : {formatDate(lastDateUpdated)}</Text>
          </View>
        </View>
      )}
    />
  );
}

export default HomeworkInformationPage;