/**
 * CoherynUI Assist — Types and Event Definitions
 */

export type AssistComponentType = 'modal' | 'drawer' | 'dropdown' | 'tabs' | 'collapse';

export interface AssistEventDetail {
  component: AssistComponentType;
  target: HTMLElement;
  trigger?: HTMLElement | null;
}

export type AssistEventType = 'cyn:show' | 'cyn:shown' | 'cyn:hide' | 'cyn:hidden';

export interface AssistOptions {
  autoInit?: boolean;
  debug?: boolean;
}

