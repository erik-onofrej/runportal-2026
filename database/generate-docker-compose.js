#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generates docker-compose.yaml from template using environment variables
 */
function generateDockerCompose() {
  const scriptDir = __dirname;
  const templatePath = path.join(scriptDir, 'docker-compose.template.yaml');
  const outputPath = path.join(scriptDir, 'docker-compose.yaml');
  const envPath = path.join(scriptDir, '.env');

  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template file not found at ${templatePath}`);
    process.exit(1);
  }

  // Load environment variables from .env file if it exists
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Don't override existing environment variables
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }

  // Required environment variables
  const requiredVars = [
    'PROJECT_NAME',
    'POSTGRES_VERSION',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'PGADMIN_PORT',
    'PGADMIN_EMAIL',
    'PGADMIN_PASSWORD'
  ];

  // Check for missing required variables
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease create a .env file based on .env.example');
    process.exit(1);
  }

  // Read template
  let template = fs.readFileSync(templatePath, 'utf8');

  // Replace all environment variable placeholders
  requiredVars.forEach(varName => {
    const regex = new RegExp(`\\$\\{${varName}\\}`, 'g');
    template = template.replace(regex, process.env[varName]);
  });

  // Write output
  fs.writeFileSync(outputPath, template, 'utf8');
  console.log(`✓ Generated docker-compose.yaml successfully!`);
  console.log(`  Project: ${process.env.PROJECT_NAME}`);
  console.log(`  PostgreSQL Port: ${process.env.POSTGRES_PORT}`);
  console.log(`  pgAdmin Port: ${process.env.PGADMIN_PORT}`);
}

// Run the generator
try {
  generateDockerCompose();
} catch (error) {
  console.error('Error generating docker-compose.yaml:', error.message);
  process.exit(1);
}
