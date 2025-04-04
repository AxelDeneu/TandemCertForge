import { spawn } from 'child_process';

/**
 * CommandExecutor - Handles execution of shell commands
 * Provides methods for running shell commands with proper error handling
 */
class CommandExecutor {
  /**
   * Executes a shell command
   * @param {string} command - The command to execute
   * @param {Array<string>} args - The command arguments
   * @returns {Promise<void>}
   * @throws {Error} If the command fails
   */
  static async execute(command, args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { stdio: 'inherit' });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      proc.on('error', (err) => {
        reject(new Error(`Execution error: ${err.message}`));
      });
    });
  }
}

export default CommandExecutor; 