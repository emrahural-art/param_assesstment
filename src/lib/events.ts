type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

interface EventMap {
  "assessment.completed": { candidateId: string; assessmentId: string; score: number };
  "candidate.statusChanged": { candidateId: string; newStatus: string };
  "candidate.stageChanged": { applicationId: string; candidateId: string; newStage: string };
  "email.sent": { candidateId: string; templateType: string };
  "email.opened": { communicationLogId: string };
}

type EventName = keyof EventMap;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on<T extends EventName>(event: T, handler: EventHandler<EventMap[T]>) {
    const existing = this.handlers.get(event) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(event, existing);
  }

  async emit<T extends EventName>(event: T, payload: EventMap[T]) {
    const handlers = this.handlers.get(event) ?? [];
    await Promise.allSettled(handlers.map((h) => h(payload)));
  }

  off<T extends EventName>(event: T, handler: EventHandler<EventMap[T]>) {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(
      event,
      existing.filter((h) => h !== handler)
    );
  }
}

export const eventBus = new EventBus();
