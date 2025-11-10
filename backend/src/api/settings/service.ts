import { BaseService } from '@common/services/BaseService';
import { Settings, SettingsData, StorageConfig } from '@/types/schema/settings.schema';
import { generateUID } from '@utils';
import { COLLECTIONS } from '@configs/constants';

export class SettingsService extends BaseService {
  async getSettings(): Promise<Settings | null> {
    return (await this.db.findOne(COLLECTIONS.SETTINGS, {})) as Settings | null;
  }

  async createOrUpdate(settingsData: SettingsData, updatedBy: string): Promise<Settings> {
    const existing = await this.getSettings();
    const now = new Date();

    if (existing) {
      // Update existing settings
      await this.db.updateOne(
        COLLECTIONS.SETTINGS,
        { uid: existing.uid },
        {
          data: settingsData,
          updatedAt: now,
          updatedBy,
        }
      );
      return (await this.getSettings()) as Settings;
    } else {
      // Create new settings
      const settings: Settings = {
        uid: generateUID(),
        data: settingsData,
        createdAt: now,
        createdBy: 'system',
        updatedAt: now,
        updatedBy,
      };

      await this.db.insertOne(COLLECTIONS.SETTINGS, settings);
      return settings;
    }
  }

  async updateGeneral(general: Partial<SettingsData['general']>, updatedBy: string): Promise<Settings | null> {
    const existing = await this.getSettings();
    if (!existing) {
      throw new Error('Settings not found');
    }

    const updatedData = {
      ...existing.data.general,
      ...general,
    };

    await this.db.updateOne(
      COLLECTIONS.SETTINGS,
      { uid: existing.uid },
      {
        'data.general': updatedData,
        updatedAt: new Date(),
        updatedBy,
      }
    );

    return await this.getSettings();
  }

  async updateAI(ai: Partial<SettingsData['ai']>, updatedBy: string): Promise<Settings | null> {
    const existing = await this.getSettings();
    if (!existing) {
      throw new Error('Settings not found');
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy,
    };

    if (ai.preferences) {
      updateData['data.ai.preferences'] = ai.preferences;
    }
    if (ai.local) {
      updateData['data.ai.local'] = ai.local;
    }
    if (ai.external) {
      updateData['data.ai.external'] = ai.external;
    }

    await this.db.updateOne(COLLECTIONS.SETTINGS, { uid: existing.uid }, updateData);
    return await this.getSettings();
  }

  async updateStorage(storage: Partial<StorageConfig>, updatedBy: string): Promise<Settings | null> {
    const existing = await this.getSettings();
    if (!existing) {
      throw new Error('Settings not found');
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy,
    };

    if (storage.preferences) {
      updateData['data.storage.preferences'] = storage.preferences;
    }
    if (storage.target) {
      updateData['data.storage.target'] = storage.target;
    }

    await this.db.updateOne(COLLECTIONS.SETTINGS, { uid: existing.uid }, updateData);
    return await this.getSettings();
  }
}

