import readline from 'readline';
import ConsoleColors from './ConsoleColors.js';
import ConfigManager from './ConfigManager.js';

/**
 * ConfigSetup - Handles interactive configuration setup
 * Provides methods for setting up the application configuration through user interaction
 */
class ConfigSetup {
  /**
   * Interactive configuration setup
   * Guides the user through setting up the application configuration
   */
  static async configureInteractive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
      ConsoleColors.info('Tandem Cert Forge Configuration');
      console.log('Press Enter to keep current value\n');

      const config = ConfigManager.loadConfig();

      // Step CA Configuration
      ConsoleColors.info('Step CA Configuration:');
      const stepCaUrl = await question(`Step CA URL [${config.stepCa.url}]: `);
      const stepCaRoot = await question(`Path to Step CA Root file [${config.stepCa.root}]: `);
      const stepCaProvisioner = await question(`Step CA Provisioner [${config.stepCa.provisioner}]: `);

      // Domain Configuration
      ConsoleColors.info('\nDomain Configuration:');
      const domainSuffix = await question(`Domain Suffix [${config.domain.suffix}]: `);

      // NPM Configuration
      ConsoleColors.info('\nNginx Proxy Manager Configuration:');
      const npmUrl = await question(`NPM URL [${config.npm.url}]: `);
      const npmEmail = await question(`NPM Email [${config.npm.email}]: `);
      const npmPassword = await question(`NPM Password [${config.npm.password}]: `);

      const newConfig = {
        stepCa: {
          url: stepCaUrl || config.stepCa.url,
          root: stepCaRoot || config.stepCa.root,
          provisioner: stepCaProvisioner || config.stepCa.provisioner
        },
        domain: {
          suffix: domainSuffix || config.domain.suffix
        },
        npm: {
          url: npmUrl || config.npm.url,
          email: npmEmail || config.npm.email,
          password: npmPassword || config.npm.password
        }
      };

      ConfigManager.saveConfig(newConfig);
      ConsoleColors.success('Configuration saved successfully!');
    } finally {
      rl.close();
    }
  }
}

export default ConfigSetup; 