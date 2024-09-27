import { Platform } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu'


// Custom chooser
function CustomChooser({
  title,
  defaultItem,
  getItemForSelected,
  selected,
  setSelected=()=>{},
  items=[],
  longPress=false,
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger action={longPress ? "longPress" : undefined}>
        {((selected || selected === 0) && getItemForSelected) ? getItemForSelected(selected) : defaultItem}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>{title}</DropdownMenu.Label>

        {items.map((item, index) => (
          <DropdownMenu.Item key={index} onSelect={() => {
            item.onPress ? item.onPress() : setSelected(item.id)
          }} destructive={item.destructive} >
            {item.destructive && !item.hideDestructiveIcon && <DropdownMenu.ItemIcon ios={{ name: 'trash' }} androidIconName='ic_delete'/>}
            {item.icon ? <DropdownMenu.ItemIcon ios={{ name: item.icon.ios }} androidIconName={item.icon.android}/> : null}
            <DropdownMenu.ItemTitle>{`${item.title}${item.subtitle ? Platform.OS !== "ios" ? ` : ${item.subtitle}` : "" : ""}`}</DropdownMenu.ItemTitle>
            {item.subtitle ? Platform.OS == "ios" && <DropdownMenu.ItemSubtitle>{item.subtitle}</DropdownMenu.ItemSubtitle> : null}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default CustomChooser;