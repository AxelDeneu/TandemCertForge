#!/usr/bin/env node

import ConsoleColors from './utils/ConsoleColors.js';
import ConfigManager from './utils/ConfigManager.js';
import DomainValidator from './utils/DomainValidator.js';
import HelpDisplay from './utils/HelpDisplay.js';
import ConfigSetup from './utils/ConfigSetup.js';
import CertificateManager from './services/CertificateManager.js';

/**
 * Main application entry point
 * Handles command line arguments and orchestrates the certificate generation process
 */
async function main() {
  try {
    const command = process.argv[2];

    if (!command) {
      HelpDisplay.showUsage();
      process.exit(1);
    }

    if (command === 'configure') {
      await ConfigSetup.configureInteractive();
      return;
    }

    if (!DomainValidator.isValidDomain(command)) {
      ConsoleColors.error('Invalid domain format');
      HelpDisplay.showUsage();
      process.exit(1);
    }

    const config = ConfigManager.loadConfig();
    const domain = `${command}.${config.domain.suffix}`;
    const certManager = new CertificateManager(config);

    // Generate and upload certificate
    ConsoleColors.info(`Generating certificate for ${domain}...`);
    const certFiles = await certManager.generateCertificate(domain);

    ConsoleColors.info('Authenticating with NPM...');
    const token = await certManager.authenticateNPM();

    ConsoleColors.info('Uploading certificate to NPM...');
    await certManager.uploadCertificateToNPM(domain, certFiles, token);

    ConsoleColors.success(`Certificate for ${domain} successfully generated and uploaded!`);
  } catch (error) {
    ConsoleColors.error(error.message);
    process.exit(1);
  }
}

// Execute the application
main().catch(error => {
  ConsoleColors.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
