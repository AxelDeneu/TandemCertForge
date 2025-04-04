/**
 * ConsoleColors - Utility class for managing console output with colors
 * Provides methods for consistent and colored console output throughout the application
 */
class ConsoleColors {
  static reset = '\x1b[0m';
  static red = '\x1b[31m';
  static green = '\x1b[32m';
  static yellow = '\x1b[33m';
  static blue = '\x1b[34m';

  /**
   * Display a success message with a green checkmark
   * @param {string} message - The message to display
   */
  static success(message) {
    console.log(`${this.green}✔${this.reset} ${message}`);
  }

  /**
   * Display an error message with a red cross
   * @param {string} message - The error message to display
   */
  static error(message) {
    console.error(`${this.red}✗${this.reset} ${message}`);
  }

  /**
   * Display a warning message with a yellow exclamation mark
   * @param {string} message - The warning message to display
   */
  static warning(message) {
    console.warn(`${this.yellow}!${this.reset} ${message}`);
  }

  /**
   * Display an informational message with a blue info icon
   * @param {string} message - The informational message to display
   */
  static info(message) {
    console.log(`${this.blue}ℹ${this.reset} ${message}`);
  }
}

export default ConsoleColors; 