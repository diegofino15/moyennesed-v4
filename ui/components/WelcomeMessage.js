import { useState, useEffect } from "react";
import { Text, Animated } from "react-native";
import { DefaultTheme } from "react-native-paper";
import AppData from "../../core/AppData";
import { OSvalue } from "../../util/Utils";


// Welcome message
function WelcomeMessage() {
  // Get if user is student or parent
  const [account, setAccount] = useState(false);
  useEffect(() => {
    async function setup() {
      setAccount(await AppData.getMainAccount());
    }
    setup();
  }, []);

  // Get random message
  function getWelcomeMessage() {
    var messages = [
      "Bienvenue dans l'application de gestion des notes !",
      `L'appli est aussi sur ${OSvalue({ iosValue: "Android", androidValue: "iOS" })} (au cas où) !`,
      "Vos avis sur l'appli sont toujours apprécies !",
    ];
    if (account.accountType == "E") {
      messages.push(
        "Allez, les cours sont bientôt finis !",
        "Plus que quelques jours avant le week-end...",
        "Pense juste pas au bac et tout va bien",
        "Allez, pense aux grandes vacances c'est pas si loin...",
        "Déjà des contrôles toutes les semaines...",

        `Quelques nouvelles notes pour ${account.gender == "M" ? "monsieur" : "madame"} ?`,
        `Tu seras ${account.gender == "M" ? "premier" : "première"} de classe un jour t'inquiète 🔥`,

        "Toute nouvelle version de l'appli, t'aimes bien ?",
        "Reste à l'affut des mises à jour !",
        "Signale un bug si l'appli ne fonctionne pas bien !",
      );
    } else {
      let numberOfChildren = Object.keys(account.children).length;
      messages.push(
        `Les résultats de ${numberOfChildren > 1 ? "vos" : "votre"} champion${numberOfChildren > 1 ? "s" : ".ne"} sont disponibles !`,
        `Le plus important c'est d'encourager ${numberOfChildren > 1 ? "vos" : "votre"} enfant${numberOfChildren > 1 ? "s" : ""} !`,
        `Pas toujours facile de devoir gérer ${numberOfChildren} enfant${numberOfChildren > 1 ? "s" : ""}...`,
        `La clé du succès de ${numberOfChildren > 1 ? "vos" : "votre"} enfant${numberOfChildren > 1 ? "s" : ""} ? Votre soutien !`,
        `Il${numberOfChildren > 1 ? "s" : ".Elle"} en donne${numberOfChildren > 1 ? "nt" : ""} du ${numberOfChildren > 1 ? "leur" : "sien"} !`,
        
        "Restez à l'affut des mises à jour !",
        "Signalez un bug si l'appli ne fonctionne pas bien !",
      );
    }

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Change message every 30 seconds
  const refreshRate = 30 * 1000;
  const [welcomeMessage, setWelcomeMessage] = useState("");
  useEffect(() => {
    function refreshWelcomeMessage(startAccountID) {
      if (account.id != startAccountID) { return; }

      setWelcomeMessage(getWelcomeMessage());
      setTimeout(() => {
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, refreshRate - 1000);
      setTimeout(() => refreshWelcomeMessage(startAccountID), refreshRate);
    }
    if (account.id) {
      refreshWelcomeMessage(account.id);
    }
  }, [account.id]);

  // Animation object
  let textOpacity = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [welcomeMessage]);
  
  return (
    <Animated.View style={{ opacity: textOpacity }}>
      <Text style={DefaultTheme.fonts.labelMedium}>{welcomeMessage}</Text>
    </Animated.View>
  );
}

export default WelcomeMessage;