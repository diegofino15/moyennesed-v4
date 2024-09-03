import { memo, useEffect } from "react";
import { View, Text, Dimensions, ScrollView, Platform } from "react-native";
import { ArrowDownUpIcon, CornerDownRightIcon, SchoolIcon, GraduationCapIcon, UserRoundCogIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import DisconnectModal from "./DisconnectModal";
import SwitchAccountModal from "./SwitchAccountModal";
import CustomSection from "../../../components/CustomSection";
import CustomModal from "../../../components/CustomModal";
import CustomProfilePhoto from "../../../components/CustomProfilePhoto";
import CustomInformationCard from "../../../components/CustomInformationCard";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import CustomButton from "../../../components/CustomButton";
import { useAppContext } from "../../../../util/AppContext";
import AppData from "../../../../core/AppData";
import HapticsHandler from "../../../../core/HapticsHandler";


// Profile settings page
function ProfilePage({ route, navigation }) {
  const { theme, setIsLoggedIn, setIsAutoTheme } = useAppContext();
  
  // Currently selected account
  const { currentAccount } = route.params;

  // Switch account
  const [canSwitchAccounts, setCanSwitchAccounts] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  useEffect(() => { AsyncStorage.getItem("accounts").then(jsonAccounts => {
    if (Object.keys(JSON.parse(jsonAccounts)).length > 1) { setCanSwitchAccounts(true); }
  }); }, []);
  async function switchAccount(newAccountID) {
    if (newAccountID != currentAccount.id) {
      await AsyncStorage.setItem("selectedAccount", `${newAccountID}`);
      navigation.navigate("MainPage", { newAccountID: newAccountID });
      console.log(`Switched to account ${newAccountID} !`);
      HapticsHandler.vibrate("light");
    }
    setIsSwitchingAccount(false);
  }

  // Disconnect
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  async function disconnect() {
    setIsAutoTheme(true);
    
    await AppData.eraseData();
    setIsDisconnecting(false);
    navigation.navigate("MainPage", { newAccountID: 0 });
    setIsLoggedIn(false);
    console.log("Logged out !");
    HapticsHandler.vibrate("light");
  }

  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);

  return (
    <CustomModal
      title="Profil"
      goBackFunction={() => navigation.pop()}
      style={{ padding: 0 }}
      showScrollView={false}
      setWidth={setWindowWidth}
      children={(
        <View style={{
          backgroundColor: theme.colors.backdrop,
          height: '100%',
        }}>
          {/* Blurred background */}
          <View style={{
            position: 'absolute',
            overflow: 'hidden',
          }}>
            <CustomProfilePhoto accountID={currentAccount?.id} size={windowWidth} style={{ height: 280, top: -50 }}/>
            <BlurView intensity={Platform.select({ ios: currentAccount?.photoURL ? 50 : 30, android: 100 })} tint="dark" style={{ width: '100%', height: 230, position: 'absolute', }}/>
          </View>
          
          {/* Actual page */}
          <ScrollView showsVerticalScrollIndicator={false} style={{
            zIndex: 0,
          }}>
            <LinearGradient colors={[
              'transparent',
              'black',
            ]} style={{ width: '100%', height: 230 }}>
              {/* Account ID */}
              <PressableScale style={{
                position: 'absolute',
                top: 20,
                right: 20,
                overflow: 'hidden',
                borderRadius: 5,
              }}>
                <BlurView tint="light" style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}>
                  <Text style={[theme.fonts.bodyMedium, { height: 22, color: 'white' }]}>ID - {currentAccount?.id}</Text>
                </BlurView>
              </PressableScale>

              {/* Name */}
              <View style={{ position: 'absolute', bottom: 20, width: '80%', alignSelf: 'center' }}>
                <Text style={[theme.fonts.titleMedium, { alignSelf: 'center', textAlign: 'center', color: 'white' }]}>{currentAccount?.firstName} {currentAccount?.lastName}</Text>
                <Text style={[theme.fonts.labelLarge, { alignSelf: 'center', textAlign: 'center' }]}>{currentAccount?.accountType == "E" ? currentAccount?.grade : "Compte parent"}</Text>
              </View>
            </LinearGradient>

            <View style={{ backgroundColor: 'black' }}>
              <View style={{
                backgroundColor: theme.colors.backdrop,
                padding: 20,
                borderWidth: 2,
                borderColor: theme.colors.surfaceOutline,
                borderRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderBottomWidth: 0,
                width: windowWidth + 4,
                left: -2,
              }}>
                {/* Informations */}
                {currentAccount?.accountType == "E" && (
                  <CustomSimpleInformationCard
                    icon={<GraduationCapIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                    content={currentAccount?.grade}
                    textStyle={{
                      ...theme.fonts.bodyLarge,
                      width: windowWidth - 100,
                    }}
                    style={{ marginBottom: 10 }}
                  />
                )}

                {/* Show children for parent accounts */}
                <CustomSimpleInformationCard
                  icon={currentAccount?.accountType == "E" ? (
                    <SchoolIcon size={25} color={theme.colors.onSurfaceDisabled}/>
                  ) : (
                    <UserRoundCogIcon size={25} color={theme.colors.onSurfaceDisabled}/>
                  )}
                  content={currentAccount?.accountType == "E" ? currentAccount?.school : "Élèves associés"}
                  textStyle={{
                    ...theme.fonts.bodyLarge,
                    width: windowWidth - 100,
                  }}
                />
                {currentAccount?.accountType == "P" && Object.keys(currentAccount?.children).map(childID => {
                  const child = currentAccount?.children[childID];
                  return (
                    <View key={childID} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                      <CornerDownRightIcon size={30} color={theme.colors.onSurfaceDisabled}/>
                      <CustomProfilePhoto accountID={childID} size={60} style={{ marginLeft: 10, borderWidth: 0 }}/>
                      <View style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: 10,
                        paddingHorizontal: 15,
                        marginLeft: 10,
                        width: windowWidth - 150,
                        height: 60,
                        justifyContent: 'center',
                      }}>
                        <Text style={[theme.fonts.bodyMedium, { height: 20 }]} numberOfLines={1}>{child.firstName} {child.lastName}</Text>
                        <Text style={theme.fonts.labelMedium}>{child.grade}</Text>
                      </View>
                    </View>
                  );
                })}
                
                {/* Switch account if available */}
                {canSwitchAccounts && <View>
                  <CustomSection title={"Compte sélectionné"}/>
                  <CustomInformationCard
                    title={"Changer de compte"}
                    description={"Plusieurs comptes ont été détectés, cliquez ici pour changer."}
                    icon={<ArrowDownUpIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
                    onPress={() => setIsSwitchingAccount(true)}
                  />
                </View>}
                
                {/* Destructive actions */}
                <CustomSection title={"Danger zone"}/>
                <CustomButton
                  title={<Text style={[theme.fonts.bodyLarge, { color: theme.colors.error, height: 25 }]}>Se déconnecter</Text>}
                  onPress={() => setIsDisconnecting(true)}
                  style={{
                    backgroundColor: theme.colors.errorLight,
                    borderWidth: 2,
                    borderColor: theme.colors.error,
                    paddingVertical: 10,
                  }}
                />
              </View>
            </View>

            <View style={{ height: 250 }}/>
          </ScrollView>
          
          {/* MODALS */}
          <SwitchAccountModal
            isSwitchingAccount={isSwitchingAccount}
            setIsSwitchingAccount={setIsSwitchingAccount}
            switchAccount={switchAccount}
            selectedAccount={currentAccount?.id}
          />
          <DisconnectModal
            isDisconnecting={isDisconnecting}
            setIsDisconnecting={setIsDisconnecting}
            disconnect={disconnect}
          />
        </View>
      )}
    />
  );
}

export default memo(ProfilePage);