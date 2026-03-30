"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Flag = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
};

export function FeatureFlagToggles({ initialFlags }: { initialFlags: Flag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function toggle(key: string, enabled: boolean) {
    setLoading(key);
    try {
      const res = await fetch("/api/settings/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });
      if (res.ok) {
        setFlags((prev) =>
          prev.map((f) => (f.key === key ? { ...f, enabled } : f))
        );
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div
          key={flag.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <p className="text-sm font-medium">{flag.label}</p>
            {flag.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {flag.description}
              </p>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={flag.enabled}
            disabled={loading === flag.key}
            onClick={() => toggle(flag.key, !flag.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${
              flag.enabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                flag.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
