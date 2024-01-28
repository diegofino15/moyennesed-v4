import { useEffect } from "react";
import { View, Text } from "react-native";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { DefaultTheme } from "react-native-paper";
import AppData from "../../../core/AppData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";


// Marks overview
function MarksOverview({ selectedPeriod, setSelectedPeriod }) {
  const [periods, setPeriods, periodsRef] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("marks").then(async (data) => {
      const cacheData = JSON.parse(data);
      const selectedAccount = await AppData.getSelectedAccount();
      if (selectedAccount in cacheData) {
        setPeriods(cacheData[selectedAccount]);

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
  }, [AppData.marksUpdateCount]);

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
        <Text style={DefaultTheme.fonts.bodyMedium}>Marks Overview</Text>
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
        }}>
          <Text style={{ fontSize: 14, color: DefaultTheme.colors.primary }}>{selectedPeriod ? periods[selectedPeriod].title : "Chargement..."}</Text>
        </ContextMenuButton>
      </View>
      <Text style={DefaultTheme.fonts.headlineLarge}>{periods[selectedPeriod].average ? periods[selectedPeriod].average : "--"}</Text>
      <View style={{ height: 300 }}/>
    </View>
  );
}

export default MarksOverview;