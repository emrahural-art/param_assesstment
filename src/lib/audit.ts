interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Writes an audit log entry. Fire-and-forget (async, non-blocking).
 * Uses dynamic import to avoid pulling Prisma into edge runtime.
 */
export function auditLog(params: AuditParams): void {
  import("@/lib/prisma")
    .then(({ db }) =>
      db.auditLog.create({
        data: {
          userId: params.userId ?? null,
          userName: params.userName ?? null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId ?? null,
          metadata: params.metadata ?? undefined,
          ipAddress: params.ipAddress ?? null,
        },
      })
    )
    .catch(() => {});
}
