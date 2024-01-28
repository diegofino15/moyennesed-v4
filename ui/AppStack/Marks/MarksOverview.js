import { useEffect } from "react";
import { View, Text } from "react-native";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { DefaultTheme } from "react-native-paper";
import AppData from "../../../core/AppData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";
import { ChevronDownIcon } from "lucide-react-native";


// Marks overview
function MarksOverview({
  selectedPeriod,
  setSelectedPeriod,
  gotMarks,
  gettingMarks,
  errorGettingMarks,
  showMarksAccount,
  displayRefresher,
}) {
  // Get periods of student and choose which to display
  const [periods, setPeriods, periodsRef] = useState({});
  useEffect(() => {
    console.log("Updated display !")
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (showMarksAccount.id in cacheData) {
        setPeriods(cacheData[showMarksAccount.id].data);

        // Choose period that isn't finished
        if (!selectedPeriod) {
          let shownPeriod = 0;
          Object.values(periodsRef.current).forEach(period => {
            if (period.isFinished) { shownPeriod += 1; }
          })
          if (shownPeriod == Object.keys(periodsRef.current).length) { shownPeriod -= 1; }
          setSelectedPeriod(Object.keys(periodsRef.current)[shownPeriod]);
        }
      }
    });
  }, [showMarksAccount.id, displayRefresher]);

  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderRadius: 20,
      padding: 20,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Text style={DefaultTheme.fonts.bodyMedium}>{gotMarks ? "À jour" : gettingMarks ? "Chargement..." : errorGettingMarks ? "Erreur" : "Pas à jour"}</Text>
        <ContextMenuButton menuConfig={{
          menuTitle: 'Choisissez une période',
          menuItems: Object.values(periods).map((period) => {
            return {
              actionKey: period.id,
              actionTitle: period.title,
            };
          }),
        }} onPressMenuItem={({ nativeEvent }) => {
          setSelectedPeriod(nativeEvent.actionKey);
        }} style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <ChevronDownIcon size={20} color={DefaultTheme.colors.primary} />
          <Text style={{ fontSize: 14, color: DefaultTheme.colors.primary }}>{selectedPeriod ? periods[selectedPeriod].title : "Chargement..."}</Text>
        </ContextMenuButton>
      </View>
      <Text style={DefaultTheme.fonts.headlineLarge}>{periods[selectedPeriod]?.average ? periods[selectedPeriod].average : "--"}</Text>
      <View style={{ height: 300 }}/>
    </View>
  );
}

export default MarksOverview;