import { Text } from "react-native";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { ChevronDownIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";


// Period chooser for iOS
function CustomChooser({ title, defaultLabel, items, getTitleForSelected, selected, setSelected }) {
  return (
    <ContextMenuButton menuConfig={{
      menuTitle: title,
      menuItems: items,
    }} onPressMenuItem={({ nativeEvent }) => {
      setSelected(nativeEvent.actionKey);
    }} style={{
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <ChevronDownIcon size={20} color={DefaultTheme.colors.primary} />
      <Text style={{ fontSize: 14, color: DefaultTheme.colors.primary }}>{selected ? getTitleForSelected(selected) : defaultLabel}</Text>
    </ContextMenuButton>
  );
}

export default CustomChooser;