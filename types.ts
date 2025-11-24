export enum ITBCategory {
  CALCIFICATION = 'CALCIFICATION',
  NORMAL = 'NORMAL',
  BORDERLINE = 'BORDERLINE',
  MILD_PAD = 'MILD_PAD',
  MODERATE_PAD = 'MODERATE_PAD',
  SEVERE_PAD = 'SEVERE_PAD'
}

export interface ITBResult {
  score: number;
  category: ITBCategory;
  color: string;
  message: string;
  recommendation: string;
}

export interface PressureData {
  armSystolic: string;
  ankleSystolic: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}