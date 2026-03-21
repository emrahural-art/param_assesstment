"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { PipelineColumn } from "./pipeline-column";
import { PipelineCard } from "./pipeline-card";

type Application = {
  id: string;
  stage: string;
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

const STAGES = [
  { id: "NEW_APPLICATION", label: "Yeni Başvuru", color: "#6366f1" },
  { id: "SCREENING", label: "Ön Eleme", color: "#8b5cf6" },
  { id: "INTERVIEW", label: "Mülakat", color: "#a855f7" },
  { id: "ASSESSMENT", label: "Değerlendirme", color: "#d946ef" },
  { id: "OFFER", label: "Teklif", color: "#22c55e" },
  { id: "HIRED", label: "İşe Alındı", color: "#16a34a" },
  { id: "REJECTED", label: "Reddedildi", color: "#ef4444" },
];

export function PipelineBoard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetch("/api/pipeline/applications")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const applicationId = active.id as string;
    const newStage = over.id as string;

    const app = applications.find((a) => a.id === applicationId);
    if (!app || app.stage === newStage) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, stage: newStage } : a))
    );

    try {
      const res = await fetch(`/api/candidates/${app.candidate.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, newStage }),
      });

      if (!res.ok) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === applicationId ? { ...a, stage: app.stage } : a
          )
        );
      }
    } catch {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, stage: app.stage } : a
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.stage === stage.id);
          return (
            <PipelineColumn
              key={stage.id}
              id={stage.id}
              label={stage.label}
              color={stage.color}
              count={stageApps.length}
            >
              {stageApps.map((app) => (
                <PipelineCard key={app.id} application={app} />
              ))}
            </PipelineColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeApp && <PipelineCard application={activeApp} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
