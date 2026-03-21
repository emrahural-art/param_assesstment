export const APP_NAME = "Assessment Center";

export const PIPELINE_STAGES = [
  { name: "Yeni Başvuru", order: 1, color: "#6366f1" },
  { name: "Ön Eleme", order: 2, color: "#8b5cf6" },
  { name: "Mülakat", order: 3, color: "#a855f7" },
  { name: "Değerlendirme Testi", order: 4, color: "#d946ef" },
  { name: "Teklif", order: 5, color: "#22c55e" },
  { name: "İşe Alındı", order: 6, color: "#16a34a" },
  { name: "Reddedildi", order: 7, color: "#ef4444" },
] as const;

export const KVKK_RETENTION_DAYS = 730; // 2 years

export const MAX_EXAM_VIOLATIONS = 3;

export const DEFAULT_EXAM_DURATION_MINUTES = 60;
