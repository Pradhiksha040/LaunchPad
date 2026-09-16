import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { EventEmitter } from 'events';
import { WorkflowsService } from '../workflows.service';

export interface ApplicationEventPayload {
  eventName: string;
  organizationId: string;
  applicationId: string;
  data: Record<string, any>;
  userId?: string;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private emitter = new EventEmitter();

  constructor(
    @Inject(forwardRef(() => WorkflowsService))
    private workflowsService: WorkflowsService,
  ) {
    this.emitter.on('app.event', (event: ApplicationEventPayload) => {
      this.handleEvent(event);
    });
  }

  emitEvent(event: ApplicationEventPayload) {
    this.logger.log(`[EventBus] Emitting event '${event.eventName}' for app '${event.applicationId}'`);
    this.emitter.emit('app.event', event);
  }

  private async handleEvent(event: ApplicationEventPayload) {
    try {
      await this.workflowsService.processEvent(event);
    } catch (err: any) {
      this.logger.error(`Error processing event '${event.eventName}': ${err.message}`);
    }
  }
}
