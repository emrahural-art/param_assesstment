import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { eventBus } from "@/lib/events";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === "email.opened" && body.data?.email_id) {
      const log = await db.communicationLog.findFirst({
        where: { id: body.data.email_id },
      });

      if (log) {
        await db.communicationLog.update({
          where: { id: log.id },
          data: { openedAt: new Date(), status: "OPENED" },
        });

        await eventBus.emit("email.opened", { communicationLogId: log.id });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", "webhook.email", {
      error: String(error),
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
