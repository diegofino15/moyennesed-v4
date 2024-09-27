import { useState, useEffect } from "react";
import { Platform } from "react-native";

import AppData from "../../../core/AppData";
import CustomChangingText from "../../components/CustomChangingText";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";


// Welcome message
function WelcomeMessage({ currentAccount }) {
  const { theme } = useGlobalAppContext();
  
  // Get random message
  const [welcomeMessage, setWelcomeMessage] = useState("");
  async function getWelcomeMessage() {
    const currentConnectedAccount = await AppData.getMainAccount();
    if (!currentConnectedAccount) { return; }
    
    var messages = [
      "Bienvenue dans l'application de gestion des notes !",
      `L'appli est aussi sur ${Platform.select({ ios: "Android", android: "iOS" })} (au cas où) !`,
      "Vos avis sur l'appli sont toujours apprécies !",
    ];
    if (currentConnectedAccount.accountType == "E") {
      messages.push(
        "Allez, les cours sont bientôt finis !",
        "Plus que quelques jours avant le week-end...",
        "Pense juste pas au bac et tout va bien",
        "Allez, pense aux grandes vacances c'est pas si loin...",
        "Déjà des évaluations toutes les semaines...",

        `Quelques nouvelles notes pour ${currentConnectedAccount.gender == "M" ? "monsieur" : "madame"} ?`,
        `Tu seras ${currentConnectedAccount.gender == "M" ? "premier" : "première"} de classe un jour t'inquiète 🔥`,

        "Toute nouvelle version de l'appli, t'aimes bien ?",
        "Reste à l'affut des mises à jour !",
        "Signale un bug si l'appli ne fonctionne pas bien !",
      );
    } else {
      let numberOfChildren = Object.keys(currentConnectedAccount.children).length;
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

  // Update on account change
  useEffect(() => { getWelcomeMessage().then(message => setWelcomeMessage(message)); }, [currentAccount.id]);

  return (
    <CustomChangingText
      text={welcomeMessage}
      changeTextContent={async () => {
        let newMessage = await getWelcomeMessage();
        setWelcomeMessage(newMessage);
      }}
      refreshRate={30 * 1000}
      animationTime={500}
      style={theme.fonts.labelMedium}
      nof={2}
    />
  );
}

export default WelcomeMessage;