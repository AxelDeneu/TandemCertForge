# Tandem Cert Forge

A zero-dependency Node.js CLI tool for generating SSL certificates using step-ca and seamlessly uploading them to Nginx Proxy Manager.

The name 'Tandem Cert Forge' carries a personal touch - 'Tandem' is a play on 'Tanden', which is formed by combining parts of the creator's and their wife's last names. The 'Cert Forge' part directly reflects the tool's purpose: forging (creating) certificates. Together, it represents both the personal connection behind the project and its primary function.

## Features

- Zero dependencies - uses only Node.js built-in modules
- Simple command-line interface with both full name and short alias commands
- Automatic certificate generation using step-ca
- Direct upload to Nginx Proxy Manager
- Interactive configuration wizard for easy setup
- Secure configuration storage in user's home directory
- Configurable domain suffix (defaults to .local)
- Automatic cleanup of temporary certificate files

## Prerequisites

- Node.js >= 18.0.0
- [step-cli](https://smallstep.com/docs/step-cli/installation) installed and configured
- Running step-ca instance
- Running Nginx Proxy Manager instance

## Installation

Install globally using npm:

```bash
npm install -g tandem-cert-forge
```

## Configuration

The tool uses a configuration file stored in `~/.tcf/config.json`. You can configure it in two ways:

1. **Interactive Configuration (Recommended)**
   
   Run the interactive configuration wizard:
   ```bash
   tcf configure
   ```
   This will guide you through setting up all required parameters.

2. **Manual Configuration**
   
   Edit `~/.tcf/config.json` directly. The configuration structure is:
   ```json
   {
     "stepCa": {
       "url": "https://ca.local",
       "root": "path/to/root_ca.pem",
       "provisioner": "admin"
     },
     "domain": {
       "suffix": "local"
     },
     "npm": {
       "url": "http://localhost:81",
       "email": "admin@example.com",
       "password": "your_npm_password"
     }
   }
   ```

The configuration file is automatically created with default values when you first run the tool or the configure command.

## Usage

First-time setup:
```bash
# Install globally
npm install -g tandem-cert-forge

# Configure the tool
tcf configure
```

Generate certificates:
```bash
# Using full command name
tandem-cert-forge mydomain

# Using short alias
tcf mydomain
```

The tool will:
1. Authenticate with your Nginx Proxy Manager instance
2. Generate a certificate for mydomain.local (or your configured domain suffix)
3. Upload the certificate to Nginx Proxy Manager
4. Clean up temporary certificate files

### Example

```bash
# Configure the tool
tcf configure

# Generate certificate for test.local
tcf test

# Generate certificate for custom domain suffix (if configured as mydomain.com)
tcf blog  # Creates certificate for blog.mydomain.com
```

## Configuration Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------| 
| stepCa.url | URL of your step-ca instance | Yes | https://ca.local |
| stepCa.root | Path to your step-ca root certificate | Yes | - |
| stepCa.provisioner | Step CA provisioner name | Yes | admin |
| domain.suffix | Suffix to append to domain names | No | local |
| npm.url | URL of your Nginx Proxy Manager instance | Yes | http://localhost:81 |
| npm.email | Nginx Proxy Manager admin email | Yes | - |
| npm.password | Nginx Proxy Manager admin password | Yes | - |

## Error Handling

The tool includes comprehensive error handling for common scenarios:
- Missing configuration values
- step-cli command failures
- NPM authentication issues
- Certificate generation errors
- Upload failures

Error messages are color-coded for better visibility.

## Security Considerations

- Configuration file is stored securely in the user's home directory
- Configuration directory permissions are set to 700 (user access only)
- Configuration file permissions are set to 600 (user read/write only)
- Temporary certificate files are automatically cleaned up
- No external dependencies to minimize security risks
- Uses secure HTTPS communication with NPM API

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

