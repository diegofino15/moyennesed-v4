import { View, Text, Dimensions, ScrollView } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import LottieView from "lottie-react-native";

import CustomInformationCard from "../../components/CustomInformationCard";
import { AlertTriangleIcon, ChevronLeftIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import AppData from "../../../core/AppData";
import { formatDate } from "../../../util/Utils";


// Information page
function InformationPage({ navigation }) {
  // Get last time the marks were updated
  const [lastTimeUpdatedMarks, setLastTimeUpdatedMarks] = useState(null);
  useEffect(() => {
    async function getLastTimeUpdatedMarks() {
      const currentAccountID = await AppData.getSelectedChildAccount();
      setLastTimeUpdatedMarks(await AppData.getLastTimeUpdatedMarks(currentAccountID));
    }
    getLastTimeUpdatedMarks();
  }, []);
  
  
  return (
    <View>
      <ScrollView style={{
        backgroundColor: DefaultTheme.colors.surface,
        width: '100%',
        height: '100%',
      }} showsVerticalScrollIndicator={false}>
        {/* Animation and title */}
        <View style={{
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <LottieView
            autoPlay
            source={require('../../../assets/lottie/about-marks.json')}
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
          width: '100%',
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
          <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'justify', marginBottom: 30 }]}>La moyenne est mise à jour en temps réel, mais elle peut être différente de celle finale affichée sur votre bulletin.</Text>
          <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: 'Text-Italic' }]}>Dernière mise à jour : {formatDate(lastTimeUpdatedMarks)}</Text>
        </View>
      </ScrollView>

      {/* Back button (at the top) */}
      <PressableScale style={{
        position: 'absolute',
        top: 10,
        left: 10,
        borderWidth: 2,
        borderColor: DefaultTheme.colors.surfaceOutline,
        backgroundColor: DefaultTheme.colors.surface,
        padding: 5,
        borderRadius: 10,
      }} onPress={() => navigation.pop()}>
        <ChevronLeftIcon size={30} color={DefaultTheme.colors.onPrimary}/>
      </PressableScale>
    </View>
  );
}

export default InformationPage;