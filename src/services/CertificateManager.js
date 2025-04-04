import fs from 'fs';
import CommandExecutor from '../utils/CommandExecutor.js';
import HttpManager from '../utils/HttpManager.js';

/**
 * CertificateManager - Main service for certificate management
 * Handles certificate generation, validation, and upload to NPM
 */
class CertificateManager {
  /**
   * Creates a new CertificateManager instance
   * @param {Object} config - The application configuration
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Generates a certificate using step-ca
   * @param {string} domain - The domain to generate the certificate for
   * @returns {Promise<Object>} The generated certificate files
   * @throws {Error} If certificate generation fails
   */
  async generateCertificate(domain) {
    const { url, root } = this.config.stepCa;
    if (!url || !root) {
      throw new Error('Missing Step CA configuration. Please run: tcf configure');
    }

    const certFile = `${domain}.crt`;
    const keyFile = `${domain}.key`;

    const args = [
      'ca', 'certificate',
      domain,
      certFile,
      keyFile,
      '--not-after=87600h',  // 10 year validity (365 days * 24 hours)
      '--ca-url', url,
      '--root', root
    ];

    await CommandExecutor.execute('step', args);

    // Ensure certificate files exist
    if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
      throw new Error('Certificate files were not generated');
    }

    // Set proper permissions
    fs.chmodSync(certFile, 0o644);
    fs.chmodSync(keyFile, 0o644);

    return { certFile, keyFile };
  }

  /**
   * Authenticates with NPM
   * @returns {Promise<string>} The authentication token
   * @throws {Error} If authentication fails
   */
  async authenticateNPM() {
    const { url, email, password } = this.config.npm;
    if (!url || !email || !password) {
      throw new Error('Missing NPM configuration. Please run: tcf configure');
    }

    const httpModule = HttpManager.getHttpModule(url);
    const apiUrl = new URL('/api/tokens', url);
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || (apiUrl.protocol === 'https:' ? 443 : 80),
      path: apiUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const data = await HttpManager.makeRequest(options, JSON.stringify({
      identity: email,
      secret: password
    }), httpModule);

    if (!data.token) {
      throw new Error('Authentication failed: No token received');
    }

    return data.token;
  }

  /**
   * Validates certificates with NPM
   * @param {Object} certFiles - The certificate files
   * @param {string} token - The authentication token
   * @returns {Promise<void>}
   * @throws {Error} If validation fails
   */
  async validateCertificates(certFiles, token) {
    const { url } = this.config.npm;
    const { certFile, keyFile } = certFiles;

    const apiUrl = new URL('/api/nginx/certificates/validate', url);
    const httpModule = HttpManager.getHttpModule(url);

    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      path: apiUrl.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const files = {
      certificate: certFile,
      certificate_key: keyFile
    };

    await HttpManager.makeFileUploadRequest(options, files, httpModule);
  }

  /**
   * Gets or creates a certificate ID
   * @param {string} domain - The domain name
   * @param {string} token - The authentication token
   * @returns {Promise<string>} The certificate ID
   * @throws {Error} If operation fails
   */
  async getOrCreateCertificateId(domain, token) {
    const { url } = this.config.npm;
    const httpModule = HttpManager.getHttpModule(url);
    const apiUrl = new URL('/api/nginx/certificates', url);

    // Get existing certificates
    const listOptions = {
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      path: apiUrl.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const certificates = await HttpManager.makeRequest(listOptions, null, httpModule);
    const existingCert = certificates.find(cert => cert.nice_name === domain);

    if (existingCert) {
      return existingCert.id;
    }

    // Create new certificate entry
    const createOptions = {
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      path: apiUrl.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const createData = {
      nice_name: domain,
      provider: 'other'
    };

    const createResponse = await HttpManager.makeRequest(
      createOptions,
      JSON.stringify(createData),
      httpModule
    );

    if (!createResponse.id) {
      throw new Error('Failed to create certificate entry');
    }

    return createResponse.id;
  }

  /**
   * Uploads a certificate to NPM
   * @param {string} domain - The domain name
   * @param {Object} certFiles - The certificate files
   * @param {string} token - The authentication token
   * @returns {Promise<void>}
   * @throws {Error} If upload fails
   */
  async uploadCertificateToNPM(domain, certFiles, token) {
    const { url } = this.config.npm;
    const { certFile, keyFile } = certFiles;

    // First validate the certificates
    await this.validateCertificates(certFiles, token);

    // Get or create certificate ID
    const certId = await this.getOrCreateCertificateId(domain, token);

    // Upload the certificate files
    const uploadUrl = new URL(`/api/nginx/certificates/${certId}/upload`, url);
    const httpModule = HttpManager.getHttpModule(url);

    const options = {
      hostname: uploadUrl.hostname,
      port: uploadUrl.port,
      path: uploadUrl.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const files = {
      certificate: certFile,
      certificate_key: keyFile
    };

    await HttpManager.makeFileUploadRequest(options, files, httpModule);
  }
}

export default CertificateManager; 