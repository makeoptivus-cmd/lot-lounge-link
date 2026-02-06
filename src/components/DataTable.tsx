import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: Record<string, any>[];
  onDelete: (id: string) => void;
}

export default function DataTable({ title, columns, data, onDelete }: DataTableProps) {
  if (data.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="font-display text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {columns.map(col => (
                  <th key={col.key} className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-3 py-2.5 text-foreground">
                        {row[col.key] || "—"}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
