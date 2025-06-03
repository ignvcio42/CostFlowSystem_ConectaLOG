import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function GlosarioItem({ item }) {
  const isLong = item.label.length > 1;

  return (
    <div className="p-2 border rounded mb-2 flex justify-between items-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 dark:bg-black/20">
      <span className="truncate max-w-[75%] dark:text-white">{item.label}</span>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm dark:text-gray-400">
          {item.value}
        </span>
        {isLong && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                id="contenedor-ver-mas"
                size="sm"
                variant="ghost"
                className="dark:text-white dark:hover:text-gray-400 hover:text-gray-600"
              >
                Ver
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-gray-700
  [&>button]:dark:text-white
  [&>button]:text-gray-600
  [&>button]:hover:text-gray-800
  [&>button]:dark:hover:text-gray-300
"
            >
              <p className="text-base dark:text-white">{item.label}</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Código: {item.value}
              </p>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
