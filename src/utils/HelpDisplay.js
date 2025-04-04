import ConsoleColors from './ConsoleColors.js';

/**
 * HelpDisplay - Handles displaying help information
 * Provides methods for showing usage instructions and examples
 */
class HelpDisplay {
  /**
   * Displays usage information
   */
  static showUsage() {
    ConsoleColors.info('Usage:');
    console.log('  tcf <domain>     # Generate certificate for domain');
    console.log('  tcf configure    # Configure settings');
    console.log('\nExamples:');
    console.log('  tcf example.com  # Generate certificate for example.com');
    console.log('  tcf configure    # Configure settings');
  }
}

export default HelpDisplay; 