import { Platform } from 'react-native';
import { MenuView } from '@expo/ui/community/menu';


// Icon for an item.
// - iOS: SF Symbol name (string).
// - Android: must be an ImageSourcePropType (e.g. require('@expo/material-symbols/edit.xml')),
//   drawable resource names like 'ic_delete' are NOT supported anymore, so they are ignored.
function getImageForItem(item) {
  if (Platform.OS === 'ios') {
    if (item.icon?.ios) return item.icon.ios;
    if (item.destructive && !item.hideDestructiveIcon) return 'trash';
    return undefined;
  }

  const androidIcon = item.icon?.android;
  return androidIcon && typeof androidIcon !== 'string' ? androidIcon : undefined;
}

// Custom chooser
function CustomChooser({
  title,
  defaultItem,
  getItemForSelected,
  selected,
  setSelected=()=>{},
  items=[],
  longPress=false,
  style,
}) {
  // The new MenuView has no `subtitle` support, so it is appended to the title on every platform
  const actions = items.map((item, index) => ({
    id: String(index),
    title: `${item.title}${item.subtitle ? ` : ${item.subtitle}` : ""}`,
    image: getImageForItem(item),
    attributes: item.destructive ? { destructive: true } : undefined,
  }));

  function handlePressAction({ nativeEvent }) {
    const item = items[Number(nativeEvent.event)];
    if (!item) return;

    item.onPress ? item.onPress() : setSelected(item.id);
  }

  return (
    <MenuView
      title={title}
      actions={actions}
      onPressAction={handlePressAction}
      shouldOpenOnLongPress={longPress}
      style={style}
    >
      {((selected || selected === 0) && getItemForSelected) ? getItemForSelected(selected) : defaultItem}
    </MenuView>
  );
}

export default CustomChooser;