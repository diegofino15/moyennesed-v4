import { View, Text } from "react-native";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { DefaultTheme } from "react-native-paper";


// Marks overview
function MarksOverview({ selectedPeriod, setSelectedPeriod }) {
  const periods = {
    "A001": {
      "code": "A001",
      "title": "1er Trimestre",
      "start": "2022-01-01",
      "end": "2022-03-31",
    },
    "A002": {
      "code": "A002",
      "title": "2e Trimestre",
      "start": "2022-04-01",
      "end": "2022-06-30",
    },
    "A003": {
      "code": "A003",
      "title": "3e Trimestre",
      "start": "2022-07-01",
      "end": "2022-09-30",
    },
  };


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
              actionKey: period.code,
              actionTitle: period.title,
            };
          }),
        }} onPressMenuItem={({ nativeEvent }) => {
          setSelectedPeriod(nativeEvent.actionKey);
        }}>
          <Text style={{ fontSize: 14, color: DefaultTheme.colors.primary }}>{selectedPeriod ? periods[selectedPeriod].title : "Chargement..."}</Text>
        </ContextMenuButton>
      </View>
      <View style={{ height: 300 }}/>
    </View>
  );
}

export default MarksOverview;