import * as DropdownMenu from 'zeego/dropdown-menu'


// Custom chooser
function CustomChooser({
  title,
  defaultItem,
  getItemForSelected,
  selected,
  setSelected,
  items,
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
          <DropdownMenu.Item key={index} onSelect={() => setSelected(item.id)}>
            <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default CustomChooser;