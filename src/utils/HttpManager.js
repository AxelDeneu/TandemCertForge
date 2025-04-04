import http from 'http';
import https from 'https';
import fs from 'fs';

/**
 * HttpManager - Handles HTTP and HTTPS requests
 * Provides methods for making HTTP requests with proper error handling
 */
class HttpManager {
  /**
   * Determines the appropriate HTTP module based on the URL protocol
   * @param {string} url - The URL to check
   * @returns {Object} The appropriate HTTP module (http or https)
   */
  static getHttpModule(url) {
    return url.startsWith('https') ? https : http;
  }

  /**
   * Makes an HTTP request
   * @param {Object} options - The request options
   * @param {string|null} postData - The data to send with POST requests
   * @param {Object} module - The HTTP module to use (http or https)
   * @returns {Promise<Object>} The response data
   */
  static async makeRequest(options, postData = null, module = https) {
    return new Promise((resolve, reject) => {
      const req = module.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(data);
            }
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * Makes a multipart form data request with file uploads
   * @param {Object} options - The request options
   * @param {Object} files - Object containing file paths and their form field names
   * @param {Object} module - The HTTP module to use (http or https)
   * @returns {Promise<Object>} The response data
   */
  static async makeFileUploadRequest(options, files, module = https) {
    return new Promise((resolve, reject) => {
      const boundary = `------------------------${Date.now().toString(16)}`;
      const chunks = [];

      // Add files to the form data
      for (const [fieldName, filePath] of Object.entries(files)) {
        const fileContent = fs.readFileSync(filePath);
        chunks.push(
          `--${boundary}\r\n`,
          `Content-Disposition: form-data; name="${fieldName}"; filename="${filePath}"\r\n`,
          'Content-Type: application/octet-stream\r\n\r\n',
          fileContent,
          '\r\n'
        );
      }
      chunks.push(`--${boundary}--\r\n`);

      // Update options with proper headers
      options.headers = {
        ...options.headers,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': chunks.reduce((acc, chunk) => acc + (typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length), 0)
      };

      const req = module.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(data);
            }
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);

      // Write all chunks to the request
      for (const chunk of chunks) {
        req.write(chunk);
      }
      req.end();
    });
  }
}

export default HttpManager; 