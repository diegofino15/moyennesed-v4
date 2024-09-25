import { useState, useEffect } from "react";
import { View, Text, Dimensions, Platform } from "react-native";
import { AlertTriangleIcon } from "lucide-react-native";
import LottieView from "lottie-react-native";

import CustomModal from "../../../components/CustomModal";
import CustomInformationCard from "../../../components/CustomInformationCard";
import { formatDate } from "../../../../util/Utils";
import AppData from "../../../../core/AppData";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";


// Information page
function HomeworkInformationPage({ navigation, route }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater } = useAppStackContext();
  
  const { accountID } = route.params;
  
  // Get last date updated marks
  const [lastDateUpdated, setLastDateUpdated] = useState(null);
  useEffect(() => {
    AppData.getLastTimeUpdatedHomework(accountID).then(setLastDateUpdated);
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
              source={require('../../../../assets/lottie/about-homework.json')}
              style={{
                width: '90%',
                height: windowWidth * 0.9,
                top: -30,
              }}
            />
            <Text style={[theme.fonts.titleMedium, { width: '90%', textAlign: 'center', top: -100 }]}>Comment sont trouvés les évaluations ?</Text>
          </View>
          
          {/* Text */}
          <View style={{
            padding: 20,
            top: -90,
          }}>
            <CustomInformationCard
              title="Il peut manquer certaines évaluations"
              description={`Certains professeurs ne cochent pas la case "évaluation", l'app ne les détectera pas.`}
              error={true}
              icon={<AlertTriangleIcon size={20} color={theme.colors.error}/>}
              style={{ marginBottom: 20 }}
            />
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 10 }]}>L'app récupère vos devoirs et détecte si une évaluation est prévue pour chaque matière dans les 3 prochaines semaines.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 30 }]}>Ils sont mis à jour en temps réel.</Text>
            <Text style={[theme.fonts.labelMedium, { fontFamily: 'Text-Italic' }]}>Dernière mise à jour : {formatDate(lastDateUpdated)}</Text>
          </View>
        </View>
      )}
    />
  );
}

export default HomeworkInformationPage;