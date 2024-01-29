import { Text } from "react-native";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { ChevronDownIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";


// Period chooser for iOS
function PeriodChooser({ periods, selectedPeriod, setSelectedPeriod }) {
  return (
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
  );
}

export default PeriodChooser;