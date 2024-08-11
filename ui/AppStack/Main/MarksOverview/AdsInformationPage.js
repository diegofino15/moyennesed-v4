import { useEffect } from "react";
import useState from "react-usestateref";
import { ActivityIndicator, Dimensions, Platform, Text, View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from '@react-native-firebase/firestore';

import CustomModal from "../../../components/CustomModal";
import CustomSection from "../../../components/CustomSection";
import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";
import CustomTextArea from "../../../components/CustomTextArea";
import CustomButton from "../../../components/CustomButton";
import { useAppContext } from "../../../../util/AppContext";
import { hashString } from "../../../../util/Utils";
import AdsHandler from "../../../../core/AdsHandler";


// Ad information page
function AdsInformationPage({ navigation }) {
  const { theme } = useAppContext();
  
  const [_hashedUsername, setHashedUsername, hashedUsernameRef] = useState(null);

  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get if user has already voted
  useEffect(() => { getIfVoted(); }, []);
  async function getIfVoted() {
    // Check if already saved in cache
    const votes = JSON.parse(await AsyncStorage.getItem("votes") ?? "{}");
    if (votes.votedForAddPaidAccounts != null) {
      setHasAlreadyVoted(votes.votedForAddPaidAccounts);
      setIsLoading(false);
      return;
    }
    
    const { username } = JSON.parse(await AsyncStorage.getItem("credentials"));
    setHashedUsername(hashString(username));

    const votePoll = firestore().collection("votes").doc("add-paid-accounts");
    const yesVoters = votePoll.collection("yes-voters");
    const noVoters = votePoll.collection("no-voters");
    const alreadyVoted = (await yesVoters.doc(hashedUsernameRef.current).get()).exists || (await noVoters.doc(hashedUsernameRef.current).get()).exists;

    await AsyncStorage.setItem("votes", JSON.stringify({ ...votes, votedForAddPaidAccounts: alreadyVoted }));
    setHasAlreadyVoted(alreadyVoted);

    setIsLoading(false);
  }

  // Vote
  const [confirmingVote, setConfirmingVote] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  async function submitVote(answer) {
    setConfirmingVote(true);
    const votePoll = firestore().collection("votes").doc("add-paid-accounts");
    if (answer) {
      await votePoll.collection("yes-voters").doc(hashedUsernameRef.current).set({});
    } else {
      await votePoll.collection("no-voters").doc(hashedUsernameRef.current).set({});
    }
    await AsyncStorage.setItem("votes", JSON.stringify({ ...JSON.parse(await AsyncStorage.getItem("votes") ?? "{}"), votedForAddPaidAccounts: true }));
    setHasVoted(true);
    setConfirmingVote(false);
  }

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
              source={require('../../../../assets/lottie/about-ads.json')}
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
            
            {/* Vote */}
            {isLoading ? (
              <>
                <ActivityIndicator size={30} color={theme.colors.onSurfaceDisabled} style={{
                  marginTop: 20,
                }}/>
              </>
            ) : !hasAlreadyVoted && (
              <>
                <CustomSection
                  title={"Sondage"}
                />
                <CustomTextArea
                  children={(
                    <>
                      <Text style={theme.fonts.bodyLarge}>Seriez-vous interessé.e par une version payante de l'app, sans publicités ?</Text>
                      <View style={{
                        height: 50,
                        width: '100%',
                        marginTop: 10,
                        alignContent: "center",
                        justifyContent: "center",
                      }}>
                        {confirmingVote ? (
                          <ActivityIndicator size={30} color={theme.colors.onSurfaceDisabled}/>
                        ) : hasVoted ? (
                          <Text style={[theme.fonts.labelMedium, { textAlign: "center" }]}>Merci</Text>
                        ) : (
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: '100%' }}>
                            <PressableScale style={{
                              backgroundColor: theme.colors.successLight,
                              borderWidth: 2,
                              borderColor: theme.colors.success,
                              flexGrow: 1,
                              alignItems: "center",
                              justifyContent: "center",
                              height: '100%',
                              borderRadius: 20,
                              marginRight: 5,
                            }} onPress={() => submitVote(true)}>
                              <Text style={[theme.fonts.bodyLarge, { color: theme.colors.success }]}>Oui</Text>
                            </PressableScale>

                            <PressableScale style={{
                              backgroundColor: theme.colors.errorLight,
                              borderWidth: 2,
                              borderColor: theme.colors.error,
                              flexGrow: 1,
                              alignItems: "center",
                              justifyContent: "center",
                              height: '100%',
                              borderRadius: 20,
                              marginLeft: 5,
                            }} onPress={() => submitVote(false)}>
                              <Text style={[theme.fonts.bodyLarge, { color: theme.colors.error }]}>Non</Text>
                            </PressableScale>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                />
                <Text style={[theme.fonts.labelLarge, { textAlign: "center", marginTop: 10, }]}>
                  Aucune information personnelle n'est collectée, le vote est anonyme.
                </Text>
              </>
            )}
          </View>
        </View>
      )}
    />
  );
}

export default AdsInformationPage;