import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkflowsService {
  private workflows = [
    {
      id: 'wf_001',
      name: 'Order Creation -> SAP Sync -> Email Notification',
      triggerEvent: 'order.created',
      status: 'ACTIVE',
      steps: ['Capture Order Payload', 'Transform to SAP VBELN', 'Invoke SAP Connector', 'Send Confirmation Email'],
    },
    {
      id: 'wf_002',
      name: 'Patient Appointment Scheduled -> SMS Alert',
      triggerEvent: 'appointment.created',
      status: 'ACTIVE',
      steps: ['Validate Patient ID', 'Check Doctor Schedule', 'Dispatch SMS Notification'],
    },
  ];

  async getWorkflows() {
    return this.workflows;
  }

  async createWorkflow(dto: { name: string; triggerEvent: string; steps: string[] }) {
    const newWf = {
      id: `wf_${Date.now()}`,
      name: dto.name,
      triggerEvent: dto.triggerEvent,
      status: 'ACTIVE',
      steps: dto.steps,
    };
    this.workflows.push(newWf);
    return newWf;
  }
}
