import { View, SafeAreaView, Text, Dimensions } from 'react-native';
import { DefaultTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from 'react-native-pressable-scale';
import { ScaleIcon } from 'lucide-react-native';
import LottieView from 'lottie-react-native';

import CustomButton from '../components/CustomButton';
import { openLink } from "../../util/Utils";


// Main start page
function StartPage({ navigation }) {
  return (
    <LinearGradient colors={[
      DefaultTheme.colors.primary,
      'black',
    ]}>
      <View style={{
        width: '100%',
        height: '100%',
        paddingHorizontal: 20
      }}>
        <SafeAreaView style={{
          flexDirection: 'column',
          height: '100%',
        }}>
          {/* Animation */}
          <View style={{
            width: '130%',
            left: '-15%',
          }}>
            <LottieView
              autoPlay
              source={require('../../assets/lottie/login.json')}
              resizeMode="contain"
              style={{
                height: Dimensions.get('window').width,
              }}
            />
          </View>
          
          {/* Title */}
          <View style={{
            flexDirection: 'column',
            alignItems: 'center',
            top: -75,
          }}>
            <Text style={[DefaultTheme.fonts.titleLarge, { fontSize: 25, height: 35 }]}>Bienvenue sur</Text>
            <Text style={[DefaultTheme.fonts.titleLarge, { fontSize: 40, top: -15 }]}>MoyennesED</Text>
            <Text style={[DefaultTheme.fonts.labelLarge, { width: '80%', textAlign: 'center', top: -10 }]}>Rapide. Efficace. Vos moyennes en un clin d'oeil.</Text>
          </View>
          
          {/* Login button */}
          <CustomButton
            title={<Text style={[DefaultTheme.fonts.bodyLarge, { height: 25 }]}>Se connecter avec ÉcoleDirecte</Text>}
            onPress={() => navigation.navigate("LoginPage")}
            style={{ paddingHorizontal: 0 }}
          />

          {/* Footer */}
          <View style={{ alignItems: 'center' }}>
            <Text style={[
              DefaultTheme.fonts.labelMedium,
              { marginTop: 10, textAlign: 'center', width: '80%' }
            ]}>Vous devez disposer d'un compte ÉcoleDirecte pour vous connecter.</Text>
            <View style={{ width: 5, height: 5, backgroundColor: DefaultTheme.colors.onSurfaceDisabled, borderRadius: 5, margin: 10 }}/>
            <PressableScale onPress={() => openLink("https://moyennesed.dfino.dev/privacy-policy.html")}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <ScaleIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
                <Text style={[DefaultTheme.fonts.labelSmall, { marginLeft: 5 }]}>Conditions d'utilisation</Text>
              </View>
            </PressableScale>
          </View>
        </SafeAreaView>
      </View>
    </LinearGradient>
  );
}

export default StartPage;