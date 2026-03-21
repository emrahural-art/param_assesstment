"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PipelineCardProps {
  application: {
    id: string;
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    listing: {
      title: string;
    };
    appliedAt: string;
  };
  isDragging?: boolean;
}

export function PipelineCard({ application, isDragging }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: application.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg border bg-background p-3 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-80 shadow-lg ring-2 ring-primary/30"
      )}
    >
      <Link
        href={`/candidates/${application.candidate.id}`}
        className="block"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-medium text-sm hover:underline">
          {application.candidate.firstName} {application.candidate.lastName}
        </p>
      </Link>
      <p className="text-xs text-muted-foreground mt-0.5">
        {application.candidate.email}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
          {application.listing.title}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(application.appliedAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
