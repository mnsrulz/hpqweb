import { useMenu, UseMenuProps } from 'react-instantsearch';

export function MenuSelect(props: UseMenuProps) {
  const { items, refine } = useMenu(props);
  const { value: selectedValue } = items.find((item) => item.isRefined) || {
    value: '',
  };

  return (
    <select
      value={selectedValue}
      onChange={(event) => {
        refine((event.target as HTMLSelectElement).value);
      }}
    >
      <option value={''} key={'ALL'}>All</option>      
      {items.map((item) => (
        <option value={item.value} key={item.value}>
          {item.value} ({item.count})
        </option>
      ))}
    </select>
  );
}
