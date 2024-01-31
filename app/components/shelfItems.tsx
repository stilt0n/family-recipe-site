interface ShelfItemProps {
  items: { id: string; name: string }[];
}

export const ShelfItems = (props: ShelfItemProps) => {
  return (
    <ul>
      {props.items.map(({ id, name }) => (
        <li key={id} className="py-2">
          {name}
        </li>
      ))}
    </ul>
  );
};
