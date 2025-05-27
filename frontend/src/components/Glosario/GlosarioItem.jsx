import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function GlosarioItem({ item }) {
  const isLong = item.label.length > 1;

  return (
    <div className="p-2 border rounded mb-2 flex justify-between items-center">
      <span className="truncate max-w-[75%] dark:text-white">{item.label}</span>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm dark:text-gray-400">{item.value}</span>
        {isLong && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="dark:text-white dark:hover:text-gray-400 hover:text-gray-600">Ver</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-xl">
              <p className="text-base">{item.label}</p>
              <p className="text-sm text-muted-foreground ">Codigo: {item.value}</p>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}