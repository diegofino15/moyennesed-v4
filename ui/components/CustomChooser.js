import { Text } from "react-native";
import { ChevronsUpDownIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import * as DropdownMenu from 'zeego/dropdown-menu'


// Period chooser for Android
function CustomChooser({
  title,
  defaultLabel,
  items,
  getTitleForSelected,
  selected,
  setSelected,
  color=DefaultTheme.colors.primary,
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger style={{
        flexDirection: "row",
        alignItems: "center",
      }}>
        <Text style={[DefaultTheme.fonts.labelMedium, { color: color }]}>{selected ? getTitleForSelected(selected) : defaultLabel}</Text>
        <ChevronsUpDownIcon size={16} color={color} style={{ marginLeft: 5 }} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>{title}</DropdownMenu.Label>

        {items.map((item) => (
          <DropdownMenu.Item key={item.id} onSelect={() => setSelected(item.id)} >
            <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default CustomChooser;