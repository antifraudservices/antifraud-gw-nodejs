// src/utils/naming.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

/**
 * Creates a unique and informative name for a job to be placed in the queue.
 * The name follows the structure: <timestamp>_<tenantId>_<resourceType>_<action>
 * 
 * @param tenantId The ID of the tenant context.
 * @param resourceType The type of the resource being processed.
 * @param action The action being performed (e.g., '_batch', '_update').
 * @returns A unique job name string.
 */
export function createJobName(tenantId: string, resourceType: string, action: string): string {
  const timestamp = Date.now();
  // Remove the leading underscore from the action for a cleaner name.
  const cleanAction = action.startsWith('_') ? action.substring(1) : action;
  return `${timestamp}_${tenantId}_${resourceType}_${cleanAction}`;
}

/**
 * Parses a job name to extract its constituent parts.
 * 
 * @param jobName The unique job name.
 * @returns An object containing the parts of the name, or null if the name is invalid.
 */
export function parseJobName(jobName: string): { timestamp: number, tenantId: string, resourceType: string, action: string } | null {
  const parts = jobName.split('_');
  if (parts.length !== 4) {
    return null;
  }
  return {
    timestamp: parseInt(parts[0], 10),
    tenantId: parts[1],
    resourceType: parts[2],
    action: `_${parts[3]}` // Re-add the underscore for consistency with API actions
  };
}

/**
 * Creates a unique and informative identifier for a messaging section (e.g., an inbox or sent folder).
 * The name follows the structure: <timestamp>_<parentId>_<destinationId>_<type>
 * 
 * @param parentId The ID of the containing vault (e.g., a Group ID, a List ID).
 * @param destinationId The ID of the group or member the message is for/from.
 * @param type The type of the box (e.g., 'inbox', 'sent').
 * @returns A unique section ID string.
 */
export function createMessageSectionId(parentId: string, destinationId: string, type: 'inbox' | 'sent'): string {
  const timestamp = Date.now();
  return `${timestamp}_${parentId}_${destinationId}_${type}`;
}
