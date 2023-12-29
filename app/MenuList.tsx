import { useMenu, UseMenuProps } from 'react-instantsearch';
import { Select, SelectItem } from "@tremor/react";

export function MenuSelect(props: UseMenuProps) {
  const { items, refine } = useMenu(props);
  const { value: selectedValue } = items.find((item) => item.isRefined) || {
    value: '',
  };

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <Select value={selectedValue} onValueChange={refine}>
        <SelectItem value='' key='ALL'>All</SelectItem>
        {items.map((item) => (
          <SelectItem value={item.value} key={item.value}>
            {item.value} ({item.count})
          </SelectItem>
        ))}
      </Select>
    </div>

    // <select
    //   value={selectedValue}
    //   onChange={(event) => {
    //     refine((event.target as HTMLSelectElement).value);
    //   }}
    // >
    //   <option value={''} key={'ALL'}>All</option>      
    //   {items.map((item) => (
    //     <option value={item.value} key={item.value}>
    //       {item.value} ({item.count})
    //     </option>
    //   ))}
    // </select>
  );
}
