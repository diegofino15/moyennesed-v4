import { View, SafeAreaView, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from 'react-native-pressable-scale';
import { ScaleIcon } from 'lucide-react-native';
import LottieView from 'lottie-react-native';

import CustomButton from '../components/CustomButton';
import { openLink } from "../../util/Utils";
import { useAppContext } from '../../util/AppContext';


// Main start page
function StartPage({ navigation }) {
  const { theme } = useAppContext();

  return (
    <LinearGradient colors={[
      theme.colors.primary,
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
            <Text style={[theme.fonts.titleLarge, { fontSize: 25, height: 35, color: theme.colors.onPrimary }]}>Bienvenue sur</Text>
            <Text style={[theme.fonts.titleLarge, { fontSize: 40, top: -15, color: theme.colors.onPrimary }]}>MoyennesED</Text>
            <Text style={[theme.fonts.labelLarge, { width: '80%', textAlign: 'center', top: -10 }]}>Rapide. Efficace. Vos moyennes en un clin d'oeil.</Text>
          </View>
          
          <View style={{ bottom: 10, position: 'absolute', width: '100%' }}>
            {/* Login button */}
            <CustomButton
              title={<Text style={[theme.fonts.bodyLarge, { height: 25, color: theme.colors.onPrimary }]}>Se connecter avec ÉcoleDirecte</Text>}
              onPress={() => navigation.navigate("LoginPage")}
              style={{ paddingHorizontal: 0 }}
            />

            {/* Footer */}
            <View style={{ alignItems: 'center' }}>
              <Text style={[
                theme.fonts.labelMedium,
                { marginTop: 10, textAlign: 'center', width: '80%' }
              ]}>Vous devez disposer d'un compte ÉcoleDirecte pour vous connecter.</Text>
              <View style={{ width: 5, height: 5, backgroundColor: theme.colors.onSurfaceDisabled, borderRadius: 5, margin: 10 }}/>
              <PressableScale onPress={() => openLink("https://moyennesed.dfino.dev/privacy-policy.html")}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <ScaleIcon size={15} color={theme.colors.onSurfaceDisabled}/>
                  <Text style={[theme.fonts.labelSmall, { marginLeft: 5 }]}>Conditions d'utilisation</Text>
                </View>
              </PressableScale>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </LinearGradient>
  );
}

export default StartPage;