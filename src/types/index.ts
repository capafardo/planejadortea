export type DirectionType = 'IDA' | 'VOLTA' | 'UNICA';

export interface Routine {
  id: string;
  title: string;
  direction_type: DirectionType;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Step {
  id: string;
  routine_id: string;
  step_order: number;
  title: string;
  media_path: string | null;
  duration_minutes: number;
}

export interface RoutineWithSteps extends Routine {
  steps: Step[];
}

export interface AgendaEvent {
  id: string;
  routine_id: string;
  scheduled_date: string;
  scheduled_time: string;
}

export interface AgendaEventWithRoutine extends AgendaEvent {
  routine_title: string;
  total_duration_minutes: number;
  direction_type: DirectionType;
}

export interface Pictogram {
  id: string;
  name: string;
  category: string;
  media_path: string;
}

declare global {
  interface Window {
    api: {
      printRoutine: () => Promise<boolean>;
      setFullscreen: (flag: boolean) => Promise<void>;
      
      getRoutines: () => Promise<Routine[]>;
      getRoutine: (id: string) => Promise<RoutineWithSteps | null>;
      saveFullRoutine: (routineData: Partial<Routine>, stepsData: Partial<Step>[]) => Promise<string>;
      deleteRoutine: (id: string) => Promise<boolean>;
      
      getPictograms: () => Promise<Pictogram[]>;
      addPictogram: (name: string, category: string, mediaPath: string) => Promise<Pictogram>;

      saveMedia: (sourcePath: string) => Promise<string | null>;
      getMediaUrl: (fileName: string) => Promise<string>;
      generateSpeech: (text: string) => Promise<string | null>;

      getAgendaEvents: (startDate: string, endDate: string) => Promise<AgendaEventWithRoutine[]>;
      createAgendaEvent: (data: Partial<AgendaEvent>) => Promise<string>;
      deleteAgendaEvent: (id: string) => Promise<boolean>;
    };
  }
}
