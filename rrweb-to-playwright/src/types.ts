/**
 * rrweb Event Type Definitions
 * Based on: https://github.com/rrweb-io/rrweb/blob/master/packages/types/src/index.ts
 */

export enum EventType {
  DomContentLoaded = 0,
  Load = 1,
  FullSnapshot = 2,
  IncrementalSnapshot = 3,
  Meta = 4,
  Custom = 5,
}

export enum IncrementalSource {
  Mutation = 0,
  MouseMove = 1,
  MouseInteraction = 2,
  Scroll = 3,
  ViewportResize = 4,
  Input = 5,
  TouchMove = 6,
  MediaInteraction = 7,
  StyleSheetRule = 8,
  CanvasMutation = 9,
  Font = 10,
  Log = 11,
  Drag = 12,
  StyleDeclaration = 13,
}

export enum MouseInteractions {
  MouseUp = 0,
  MouseDown = 1,
  Click = 2,
  ContextMenu = 3,
  DblClick = 4,
  Focus = 5,
  Blur = 6,
  TouchStart = 7,
  TouchMove_Departed = 8,
  TouchEnd = 9,
  TouchCancel = 10,
}

export type RRwebEvent = {
  type: EventType;
  data: any;
  timestamp: number;
};

export type MetaEvent = RRwebEvent & {
  type: EventType.Meta;
  data: {
    href: string;
    width: number;
    height: number;
  };
};

export type MouseInteractionData = {
  source: IncrementalSource.MouseInteraction;
  type: MouseInteractions;
  id: number;
  x: number;
  y: number;
};

export type InputData = {
  source: IncrementalSource.Input;
  text: string;
  isChecked: boolean;
  id: number;
};

export type ScrollData = {
  source: IncrementalSource.Scroll;
  id: number;
  x: number;
  y: number;
};

/**
 * Parsed action from rrweb events
 */
export interface ParsedAction {
  type: 'navigation' | 'click' | 'input' | 'scroll' | 'viewport' | 'unknown';
  timestamp: number;
  selector?: string;
  value?: string;
  x?: number;
  y?: number;
  url?: string;
  width?: number;
  height?: number;
  nodeId?: number;
}

/**
 * Generated Playwright test
 */
export interface PlaywrightTest {
  url: string;
  viewport?: { width: number; height: number };
  actions: ParsedAction[];
  duration: number;
}
