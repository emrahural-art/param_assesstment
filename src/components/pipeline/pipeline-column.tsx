"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface PipelineColumnProps {
  id: string;
  label: string;
  color: string;
  count: number;
  children: React.ReactNode;
}

export function PipelineColumn({
  id,
  label,
  color,
  count,
  children,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 min-w-[288px] flex-col rounded-lg border bg-muted/30 transition-colors",
        isOver && "bg-accent/50 border-primary/40"
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-2 p-2 min-h-[120px]">{children}</div>
    </div>
  );
}
