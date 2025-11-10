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
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
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

export interface StoragePreferences {
  mode: 'local' | 'automatic' | 'external';
  default_storage_id?: string;
}

export interface StorageTarget {
  uid: string;
  data: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: Record<string, any>;
    provider: string;
  };
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  updatedBy: string;
}

export interface StorageConfig {
  preferences: StoragePreferences;
  target: StorageTarget[];
}

export interface SettingsData {
  general: GeneralSettings;
  ai: AIConfig;
  storage?: StorageConfig;
}

export interface Settings {
  uid: string;
  data: SettingsData;
  createdAt: Date | string;
  createdBy: 'system';
  updatedAt: Date | string;
  updatedBy: string;
}

export interface UpdateSettingsRequest {
  general?: Partial<GeneralSettings>;
  ai?: Partial<AIConfig>;
  storage?: Partial<StorageConfig>;
}

export interface UpdateGeneralSettingsRequest {
  appName?: string;
  appDescription?: string;
  timeZone?: string;
  isMaintenance?: boolean;
  [key: string]: any;
}

export interface UpdateAISettingsRequest {
  preferences?: Partial<AIPreferences>;
  local?: AIModel[];
  external?: AIModel[];
}

export interface UpdateStorageSettingsRequest {
  preferences?: Partial<StoragePreferences>;
  target?: StorageTarget[];
}

