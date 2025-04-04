/**
 * DomainValidator - Handles domain validation
 * Provides methods for validating domain formats
 */
class DomainValidator {
  /**
   * Validates the domain format
   * @param {string} domain - The domain to validate
   * @returns {boolean} True if the domain is valid, false otherwise
   */
  static isValidDomain(domain) {
    return domain && /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(domain);
  }
}

export default DomainValidator; 