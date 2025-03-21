import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, Platform } from "react-native";
import { CheckIcon, ChevronsUpDownIcon, CircleIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";
import CustomChooser from "./CustomChooser";
import CustomSeparator from "./CustomSeparator";
import AccountHandler from "../../core/AccountHandler";
import HapticsHandler from "../../core/HapticsHandler";
import { parseHtmlData } from "../../util/Utils";
import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Double auth popup
function DoubleAuthPopup({ navigation }) {
  const { theme, setIsLoggedIn } = useGlobalAppContext();
  
  // Is loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  // Whether the user chose the right answer
  const [wrongChoice, setWrongChoice] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(0);

  // Question content
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [rawAnswers, setRawAnswers] = useState([]);

  // Parse the question
  useEffect(() => {
    async function getQuestion() {
      setIsLoading(true);
      
      var response = await axios.post(
        'https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=get&v=4',
        'data={}',
        { headers: { "X-Token": AccountHandler.temporaryLoginToken, "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT } },
      ).catch(error => {
        console.warn(`An error occured while parsing double auth : ${error}`);
        setErrorLoading(true);
      });
      response ??= {};

      switch (response.status) {
        case 200:
          console.log("API request successful");
          switch (response.data.code) {
            case 200:
              console.log("Got double auth content !");
              setQuestion(parseHtmlData(response.data.data?.question ?? ""))
              var tempAnswers = [];
              response.data.data?.propositions?.forEach(answer => {
                tempAnswers.push(parseHtmlData(answer));
              });
              setAnswers(tempAnswers);
              setRawAnswers(response.data.data?.propositions ?? []);
              break;
            default:
              console.warn(`API responded with unknown code ${response.data.code}`);
              setErrorLoading(true);
              break;
          }
          break;
        default:
          console.warn("API request failed");
          setErrorLoading(true);
          break;
      }

      setIsLoading(false);
    }

    if (!question && !isLoading) { getQuestion(); }
  }, []);

  // Confirm choice
  const [isConfirmingChoice, setIsConfirmingChoice] = useState(false);
  const [errorConfirmingChoice, setErrorConfirmingChoice] = useState(false);
  async function confirmChoice() {
    HapticsHandler.vibrate("light");
    setIsConfirmingChoice(true);

    console.log("Confirming choice...");

    var response = await axios.post(
      'https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=post&v=4',
      `data=${JSON.stringify({
        "choix": rawAnswers[selectedAnswer],
      })}`,
      { headers: { "X-Token": AccountHandler.temporaryLoginToken, "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT } },
    ).catch(error => {
      console.warn(`An error occured while confirming choice : ${error}`);
      setErrorConfirmingChoice(true);
    });
    response ??= {};

    switch (response.status) {
      case 200:
        console.log("API request successful");
        switch (response.data.code) {
          case 200:
            console.log("Right answer, got login IDs !");
            const { cn, cv } = response.data.data;
            await AsyncStorage.setItem("double-auth-tokens", JSON.stringify({ cn, cv }));
            const reloginSuccessful = await AccountHandler.refreshLogin();
            HapticsHandler.vibrate("light");
            if (reloginSuccessful) {
              navigation.pop();
              setIsLoggedIn(true);
            }
            else {
              console.warn("Relogin failed...");
            }
            break;
          default:
            console.warn("Wrong answer, account suspended");
            setWrongChoice(true);
            break;
        }
        break;
      default:
        console.warn("API request failed");
        setErrorConfirmingChoice(true);
        break;
    }

    setIsConfirmingChoice(false);
  }
  
  return (
    <CustomModal
      title={"Double authentification"}
      children={(
        <View>
          <Text style={[theme.fonts.labelLarge, { marginBottom: 5 }]}>Répondez à cette question de sécurité afin de confirmer votre identité.</Text>
          <Text style={theme.fonts.labelLarge}>Si vous choisissez la mauvaise réponse, votre compte pourrait être suspendu.</Text>
          <CustomSeparator style={{
            backgroundColor: theme.colors.surfaceOutline,
            marginVertical: 20,
          }}/>

          {isLoading ? (
            <ActivityIndicator size={"large"} color={theme.colors.surfaceOutline} style={{
              marginTop: 20,
            }}/>
          ) : errorLoading ? (
            <>
              <Text style={[theme.fonts.bodyLarge, {
                marginTop: 20,
                color: theme.colors.error,
                textAlign: 'center',
              }]}>Une erreur est survenue.</Text>
              <Text style={[theme.fonts.labelMedium, {
                marginTop: 10,
                textAlign: 'center',
              }]}>Impossible de récupérer la question de double authentification, veuillez réessayer plus tard.</Text>
            </>
          ) : wrongChoice ? (
            <>
              <Text style={[theme.fonts.bodyLarge, {
                marginTop: 20,
                color: theme.colors.error,
                textAlign: 'center',
              }]}>Cette réponse est incorrecte.</Text>
              <Text style={[theme.fonts.labelMedium, {
                marginTop: 10,
                textAlign: 'center',
              }]}>Votre compte a été suspendu, un mail de réactivation a été envoyé.</Text>
            </>
          ) : (
            <>
              {/* Content */}
              <Text style={[theme.fonts.bodyLarge, { marginBottom: 10 }]}>{question}</Text>
              
              {Platform.select({ ios: (
                <View>
                  {answers.map((answer, index) => (
                    <PressableScale key={index} style={{
                      paddingLeft: 15,
                      paddingRight: 10,
                      paddingVertical: 10,
                      borderWidth: 2,
                      borderColor: index == selectedAnswer ? theme.colors.primary : theme.colors.surfaceOutline,
                      borderRadius: 10,
                      marginVertical: 5,
                      backgroundColor: theme.colors.surface,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }} onPress={() => {
                      setSelectedAnswer(index);
                      HapticsHandler.vibrate("light");
                    }}>
                      <Text style={[theme.fonts.bodyLarge, { flex: 1 }]}>{answer}</Text>
                      {index == selectedAnswer ? (
                        <View style={{
                          padding: 5,
                          borderRadius: 15,
                          backgroundColor: theme.colors.primary,
                        }}>
                          <CheckIcon size={18} color={theme.colors.onPrimary}/>
                        </View>
                      ) : (
                        <CircleIcon size={28} color={theme.dark ? theme.colors.surfaceOutline : theme.colors.backdrop}/>
                      )}
                    </PressableScale>
                  ))}
                </View>
              ), android: (
                <View>
                  <CustomChooser
                    title={"Réponse"}
                    getItemForSelected={(index) => (
                      <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: "center", paddingHorizontal: 20 }}>
                        <Text style={theme.fonts.labelLarge}>{answers[index]}</Text>
                        <ChevronsUpDownIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                      </View>
                    )}
                    selected={selectedAnswer}
                    setSelected={(index) => {
                      setSelectedAnswer(index);
                      HapticsHandler.vibrate("light");
                    }}
                    items={answers.map((answer, index) => {
                      return { id: index, title: answer };
                    })}
                  />
                </View>
              ) })}

              {/* Confirm */}
              <CustomButton
                title={isConfirmingChoice ? (
                  <ActivityIndicator size={24} color={theme.colors.onPrimary}/>
                ) : errorConfirmingChoice ? (
                  <Text style={[theme.fonts.bodyLarge, { color: theme.colors.onPrimary }]}>Une erreur est survenue</Text>
                ) : (
                  <Text style={[theme.fonts.bodyLarge, { color: theme.colors.onPrimary }]}>Confirmer</Text>
                )}
                onPress={confirmChoice}
                style={{
                  marginVertical: 30,
                  backgroundColor: errorConfirmingChoice ? theme.colors.error : theme.colors.primary,
                }}
              />
            </>
          )}
        </View>
      )}
    />
  );
}

export default DoubleAuthPopup;