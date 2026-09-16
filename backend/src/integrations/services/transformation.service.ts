import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformationService {
  /**
   * Transforms input JSON payload according to configured field mappings.
   * e.g., mapping: { "name": "customer_name", "phone": "mobile" }
   * Input: { "name": "John", "phone": "9876543210" }
   * Output: { "customer_name": "John", "mobile": "9876543210" }
   */
  transformPayload(input: Record<string, any>, mapping?: Record<string, string>): Record<string, any> {
    if (!input || typeof input !== 'object') return input;
    if (!mapping || Object.keys(mapping).length === 0) return input;

    const output: Record<string, any> = {};

    // Copy keys that are not explicitly mapped first or map them
    for (const [key, value] of Object.entries(input)) {
      const targetKey = mapping[key] || key;
      output[targetKey] = value;
    }

    return output;
  }
}
