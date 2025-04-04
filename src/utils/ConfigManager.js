import fs from 'fs';
import path from 'path';
import os from 'os';
import ConsoleColors from './ConsoleColors.js';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  stepCa: {
    url: 'https://ca.local',
    root: '',
    provisioner: 'admin'
  },
  domain: {
    suffix: 'local'
  },
  npm: {
    url: 'http://localhost:81',
    email: '',
    password: ''
  }
};

/**
 * ConfigManager - Handles configuration loading and saving
 * Manages the application's configuration stored in a JSON file
 */
class ConfigManager {
  static CONFIG_DIR = path.join(os.homedir(), '.tcf');
  static CONFIG_FILE = path.join(this.CONFIG_DIR, 'config.json');

  /**
   * Ensures the configuration directory and file exist
   * Creates them if they don't exist
   */
  static ensureConfigExists() {
    if (!fs.existsSync(this.CONFIG_DIR)) {
      fs.mkdirSync(this.CONFIG_DIR, { mode: 0o700 });
    }
    if (!fs.existsSync(this.CONFIG_FILE)) {
      fs.writeFileSync(this.CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), { mode: 0o600 });
    }
  }

  /**
   * Loads the configuration from file
   * @returns {Object} The loaded configuration
   */
  static loadConfig() {
    this.ensureConfigExists();
    try {
      const config = JSON.parse(fs.readFileSync(this.CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...config };
    } catch (error) {
      ConsoleColors.error(`Error loading configuration: ${error.message}`);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Saves the configuration to file
   * @param {Object} config - The configuration to save
   */
  static saveConfig(config) {
    this.ensureConfigExists();
    fs.writeFileSync(this.CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
  }
}

export default ConfigManager; 