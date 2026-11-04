import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ChartNoAxesColumnIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";

import { useGlobalAppContext } from "../../util/GlobalAppContext";


// Consent button. Both choices use the same visual weight so accepting is not
// easier than refusing.
function ConsentButton({ title, onPress, disabled, loading, bgColor, color }) {
  const { theme } = useGlobalAppContext();

  return (
    <PressableScale style={{
      flex: 1,
      minHeight: 44,
      backgroundColor: bgColor,
      borderWidth: 2,
      borderColor: color,
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.6 : 1,
    }} onPress={onPress} disabled={disabled}>
      {loading ? (
        <ActivityIndicator size={"small"} color={color}/>
      ) : (
        <Text style={[theme.fonts.bodyMedium, {
          color: color,
          textAlign: "center",
        }]}>{title}</Text>
      )}
    </PressableScale>
  );
}


// Banner asking for analytics consent. It is displayed until the user has
// made a choice, and replaces the "MoyennesED Sans Pubs" banner so the two
// never show together.
function CustomAnalyticsConsentBanner() {
  const { theme, changeAnalyticsConsent } = useGlobalAppContext();
  const [loading, setLoading] = useState(null); // "granted" | "denied" | null

  async function choose(choice) {
    if (loading) { return; }
    setLoading(choice);
    try {
      await changeAnalyticsConsent(choice);
    } finally {
      setLoading(null);
    }
  }

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.surfaceOutline,
      padding: 15,
      marginBottom: 10,
      marginHorizontal: 20,
    }}>
      {/* Title */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: theme.colors.primaryLight,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}>
          <ChartNoAxesColumnIcon size={24} color={theme.colors.primary}/>
        </View>
        <Text style={[theme.fonts.titleSmall, { flex: 1 }]}>Aider à améliorer MoyennesED</Text>
      </View>

      {/* Explanation */}
      <Text style={[theme.fonts.labelLarge, {
        textAlign: "justify",
        marginBottom: 12,
      }]}>
        Acceptez-vous de partager des statistiques d'utilisation ? Aucune information personnelle n'est envoyée.
      </Text>

      {/* Choices */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ConsentButton
          title={"Oui, j'accepte"}
          onPress={() => choose("granted")}
          disabled={loading != null}
          loading={loading === "granted"}
          bgColor={theme.colors.primaryLight}
          color={theme.colors.primary}
        />
        <ConsentButton
          title={"Non merci"}
          onPress={() => choose("denied")}
          disabled={loading != null}
          loading={loading === "denied"}
          bgColor={theme.colors.surface}
          color={theme.colors.onSurfaceDisabled}
        />
      </View>

      <Text style={[theme.fonts.labelMedium, {
        color: theme.colors.onSurfaceDisabled,
        textAlign: "center",
        marginTop: 10,
      }]}>Modifiable à tout moment dans les paramètres avancés.</Text>
    </View>
  );
}

export default CustomAnalyticsConsentBanner;
