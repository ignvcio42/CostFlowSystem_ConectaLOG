import { FixedSizeList as List } from 'react-window';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { normalizeText } from "@/components/Glosario/normalizeText";
import GlosarioItem from "./GlosarioItem";

export default function GlosarioSection({ title, items }) {
  const [search, setSearch] = useState('');
  const filtered = items.filter(item =>
    normalizeText(item.label).includes(normalizeText(search)) ||
    normalizeText(item.value).includes(normalizeText(search))
  );

  return (
    <Card className="p-4 my-4">
      <h2 className="text-xl font-bold mb-2 dark:text-white">{title}</h2>
      <Input
        placeholder="Buscar..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 rounded dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <List
        height={400}
        itemCount={filtered.length}
        itemSize={60}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>
            <GlosarioItem item={filtered[index]} />
          </div>
        )}
      </List>
    </Card>
  );
}