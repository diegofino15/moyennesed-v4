import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { CheckIcon, CircleIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";
import CustomSeparator from "./CustomSeparator";
import { parseHtmlData } from "../../util/Utils";
import AppData from "../../core/AppData";
import HapticsHandler from "../../util/HapticsHandler";


// Double auth popup
function DoubleAuthPopup({ navigation, isLoggedIn, setIsLoggedIn }) {
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
        { headers: { "X-Token": AppData.temporaryLoginToken } },
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
      { headers: { "X-Token": AppData.temporaryLoginToken } },
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
            const reloginSuccessful = await AppData.refreshLogin();
            HapticsHandler.vibrate("light");
            if (reloginSuccessful) {
              if (isLoggedIn) {
                navigation.navigate("GlobalStack", { needToRefresh: true });
              } else {
                navigation.navigate("StartPage");
                setIsLoggedIn(true);
              }
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
          <Text style={[DefaultTheme.fonts.labelLarge, { marginBottom: 5 }]}>Répondez à cette question de sécurité afin de confirmer votre identité.</Text>
          <Text style={DefaultTheme.fonts.labelLarge}>Si vous choisissez la mauvaise réponse, votre compte sera suspendu.</Text>
          <CustomSeparator style={{
            backgroundColor: DefaultTheme.colors.surfaceOutline,
            marginVertical: 20,
          }}/>

          {isLoading ? (
            <ActivityIndicator size={"large"} color={DefaultTheme.colors.surfaceOutline} style={{
              marginTop: 20,
            }}/>
          ) : errorLoading ? (
            <>
              <Text style={[DefaultTheme.fonts.bodyLarge, {
                marginTop: 20,
                color: DefaultTheme.colors.error,
                textAlign: 'center',
              }]}>Une erreur est survenue.</Text>
              <Text style={[DefaultTheme.fonts.labelMedium, {
                marginTop: 10,
                textAlign: 'center',
              }]}>Impossible de récupérer la question de double authentification, veuillez réessayer plus tard.</Text>
            </>
          ) : wrongChoice ? (
            <>
              <Text style={[DefaultTheme.fonts.bodyLarge, {
                marginTop: 20,
                color: DefaultTheme.colors.error,
                textAlign: 'center',
              }]}>Cette réponse est incorrecte.</Text>
              <Text style={[DefaultTheme.fonts.labelMedium, {
                marginTop: 10,
                textAlign: 'center',
              }]}>Votre compte a été suspendu, un mail de réactivation a été envoyé.</Text>
            </>
          ) : (
            <>
              {/* Content */}
              <Text style={[DefaultTheme.fonts.bodyLarge, { marginBottom: 10 }]}>{question}</Text>
              {answers.map((answer, index) => (
                <PressableScale key={index} style={{
                  paddingLeft: 15,
                  paddingRight: 10,
                  paddingVertical: 10,
                  borderWidth: 2,
                  borderColor: index == selectedAnswer ? DefaultTheme.colors.primary : DefaultTheme.colors.surfaceOutline,
                  borderRadius: 10,
                  marginVertical: 5,
                  backgroundColor: DefaultTheme.colors.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }} onPress={() => {
                  setSelectedAnswer(index);
                  HapticsHandler.vibrate("light");
                }}>
                  <Text style={[DefaultTheme.fonts.bodyLarge, { flex: 1 }]}>{answer}</Text>
                  {index == selectedAnswer ? (
                    <View style={{
                      padding: 5,
                      borderRadius: 15,
                      backgroundColor: DefaultTheme.colors.primary,
                    }}>
                      <CheckIcon size={18} color={'black'}/>
                    </View>
                  ) : (
                    <CircleIcon size={28} color={DefaultTheme.colors.surfaceOutline}/>
                  )}
                </PressableScale>
              ))}

              {/* Confirm */}
              <CustomButton
                title={isConfirmingChoice ? (
                  <ActivityIndicator size={24} color={DefaultTheme.colors.onSurface}/>
                ) : errorConfirmingChoice ? (
                  <Text style={DefaultTheme.fonts.bodyLarge}>Une erreur est survenue</Text>
                ) : (
                  <Text style={DefaultTheme.fonts.bodyLarge}>Confirmer</Text>
                )}
                onPress={confirmChoice}
                style={{
                  marginVertical: 30,
                  backgroundColor: errorConfirmingChoice ? DefaultTheme.colors.error : DefaultTheme.colors.primary,
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