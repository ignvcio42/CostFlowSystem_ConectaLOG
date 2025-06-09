import { FixedSizeList as List } from "react-window";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { normalizeText } from "@/components/Glosario/normalizeText";
import GlosarioItem from "./GlosarioItem";

export default function GlosarioSection({ title, items }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(
    (item) =>
      normalizeText(item.label).includes(normalizeText(search)) ||
      normalizeText(item.value).includes(normalizeText(search))
  );

  return (
    <Card className="p-4 my-4 hover:shadow-lg dark:bg-black/20 border-none">
      <h2 className="text-xl font-bold mb-2 dark:text-white">{title}</h2>
      <Input
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 rounded dark:bg-white dark:text-black dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        id="buscador-glosario"
      />
      {filtered.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          No se encontraron resultados.
        </p>
      ) : (
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
      )}
      <List height={400} itemCount={filtered.length} itemSize={60} width="100%">
        {({ index, style }) => (
          <div style={style}>
            <GlosarioItem item={filtered[index]} />
          </div>
        )}
      </List>
    </Card>
  );
}
