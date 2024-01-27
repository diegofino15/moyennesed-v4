import { useState, useEffect } from "react";
import { Text } from "react-native";
import { DefaultTheme } from "react-native-paper";


// Welcome message
function WelcomeMessage() {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  useEffect(() => {
    var welcomeMessages = [];
    welcomeMessages.push(
      "Allez, les cours sont bientôt finis !",
      "Plus que quelques jours avant le week-end...",
      "Perd pas la forme, les notes c'est pas tout !",
      "Pense juste pas au bac et tout va bien",
      "Allez, pense aux grandes vacances c'est pas si loin...",
      "Déjà des contrôles toutes les semaines...",
      "Si t'aimes bien l'appli hésite pas à aller la noter !",
      "Corrige les coefs manuellement si ceux-ci ne sont pas bons !",
      "Alors, les graphiques ?",
      "Signale un bug si l'appli ne fonctionne pas bien !",
      "Reste à l'affut des mises à jour !",
    );
    setWelcomeMessage(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
  }, []);
  
  return (
    <Text style={DefaultTheme.fonts.labelMedium}>{welcomeMessage}</Text>
  );
}

export default WelcomeMessage;