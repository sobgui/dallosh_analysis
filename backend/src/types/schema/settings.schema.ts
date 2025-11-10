export type AIMode = 'local' | 'automatic' | 'external';

export interface AIModel {
  uid: string;
  data: {
    model: string;
    baseUrl: string;
    apiKey: string;
    retryRequests: number; // max 10
    paginateRowsLimit: number; // max 5000
  };
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface AIPreferences {
  mode: AIMode;
  default_local_model_id?: string;
  default_external_model_id?: string;
}

export interface AIConfig {
  preferences: AIPreferences;
  local: AIModel[];
  external: AIModel[];
}

export interface GeneralSettings {
  appName: string;
  appDescription: string;
  timeZone: string;
  isMaintenance: boolean;
  [key: string]: any;
}

export interface StorageConfig {
  preferences?: Record<string, any>;
  target?: string;
}

export interface SettingsData {
  general: GeneralSettings;
  ai: AIConfig;
  storage?: StorageConfig;
}

export interface Settings {
  uid: string;
  data: SettingsData;
  createdAt: Date;
  createdBy: 'system';
  updatedAt: Date;
  updatedBy: string;
}

