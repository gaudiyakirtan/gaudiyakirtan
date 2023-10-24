import isEqual from "lodash/isEqual";

import ISettings, { defaultSettings } from "../../data/models/local/ISettings";
import LocalFileSystem from "../fileSystem/LocalFileSystem";
import { LocalFileUris } from "../fileSystem/FileUris";
import Debug from "../debug/Debug";

export default class Settings {
  private static settings: ISettings;

  private static async readFromFile(): Promise<ISettings> {
    const localInfo = await LocalFileSystem.exists(LocalFileUris.settings);
    if (!localInfo.exists) {
      await this.writeToFile(defaultSettings);
    }

    const settingsStr = await LocalFileSystem.read(LocalFileUris.settings);
    return settingsStr ? JSON.parse(settingsStr) : defaultSettings;
  }

  private static async writeToFile(settings: ISettings): Promise<void> {
    await LocalFileSystem.write(LocalFileUris.settings, JSON.stringify(settings));
  }

  // Check if saved savedSettings format is out of date with latest 'ISettings' format. If yes, update it.
  private static async checkSavedSettingsFormat(savedSettings: ISettings): Promise<ISettings> {
    const consolidatedSettings: ISettings | {} = {};

    Object.keys(defaultSettings).forEach(key => {
      const savedValue = savedSettings[key];
      consolidatedSettings[key] =
        savedValue !== null && savedValue !== undefined ? savedValue : defaultSettings[key];
    });

    if (!isEqual(consolidatedSettings, savedSettings)) {
      Debug.log("\n\nISettings format changed. Updating saved Settings with new format.\n\n");
      await this.writeToFile(consolidatedSettings as ISettings);
    }

    return consolidatedSettings as ISettings;
  }

  public static async init(): Promise<void> {
    const savedSettings = await this.readFromFile();
    const consolidatedSettings = await this.checkSavedSettingsFormat(savedSettings);

    this.settings = consolidatedSettings;
  }

  public static get(): ISettings {
    return this.settings;
  }

  public static set(settings: ISettings): void {
    this.settings = settings;

    // Write to file asynchronously and return asap from this function call so as to not block UX rerendering
    setTimeout(async () => {
      await this.writeToFile(settings);
    }, 0);
  }
}
