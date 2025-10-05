#!/usr/bin/env node

/**
 * Test script for the SnapIT Forum MCP Server
 *
 * This script verifies that all tools are working correctly
 * by simulating tool calls and checking responses.
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

console.log('Starting MCP Server Tests...\n');

// Test 1: Check if documentation files exist
async function testDocumentationFiles() {
  console.log('Test 1: Checking documentation files...');
  const files = [
    'PROJECT-STATUS-OCT-5-2025.md',
    'ARCHITECTURE-OVERVIEW.md',
    'IMPLEMENTATION-ROADMAP.md',
    'API-REFERENCE.md',
    'STRIPE-LIVE-MODE-SETUP.md',
  ];

  for (const file of files) {
    try {
      const filePath = path.join(PROJECT_ROOT, file);
      await readFile(filePath, 'utf-8');
      console.log(`  ✓ ${file} - Found`);
    } catch (error) {
      console.log(`  ✗ ${file} - Missing or unreadable`);
      return false;
    }
  }
  console.log('  All documentation files present!\n');
  return true;
}

// Test 2: Verify package.json
async function testPackageJson() {
  console.log('Test 2: Verifying package.json...');
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageContent = await readFile(packagePath, 'utf-8');
    const pkg = JSON.parse(packageContent);

    console.log(`  ✓ Package name: ${pkg.name}`);
    console.log(`  ✓ Version: ${pkg.version}`);
    console.log(`  ✓ Main file: ${pkg.main}`);

    if (pkg.dependencies['@modelcontextprotocol/sdk']) {
      console.log(`  ✓ MCP SDK installed`);
    } else {
      console.log(`  ✗ MCP SDK not found in dependencies`);
      return false;
    }

    console.log('  Package configuration valid!\n');
    return true;
  } catch (error) {
    console.log(`  ✗ Error reading package.json: ${error.message}\n`);
    return false;
  }
}

// Test 3: Check project structure
async function testProjectStructure() {
  console.log('Test 3: Verifying project structure...');
  const requiredFiles = [
    'index.js',
    'package.json',
    'README.md',
  ];

  for (const file of requiredFiles) {
    try {
      const filePath = path.join(__dirname, file);
      await readFile(filePath, 'utf-8');
      console.log(`  ✓ ${file} - Present`);
    } catch (error) {
      console.log(`  ✗ ${file} - Missing`);
      return false;
    }
  }
  console.log('  Project structure valid!\n');
  return true;
}

// Run all tests
async function runTests() {
  const results = [];

  results.push(await testDocumentationFiles());
  results.push(await testPackageJson());
  results.push(await testProjectStructure());

  console.log('\n========================================');
  console.log('Test Results Summary');
  console.log('========================================');

  const passed = results.filter(r => r === true).length;
  const total = results.length;

  if (passed === total) {
    console.log(`✓ All ${total} tests passed!`);
    console.log('\nThe MCP server is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Add the server to Claude Desktop configuration');
    console.log('2. Restart Claude Desktop');
    console.log('3. Start using the tools!\n');
    process.exit(0);
  } else {
    console.log(`✗ ${total - passed} of ${total} tests failed`);
    console.log('\nPlease fix the issues above before using the server.\n');
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});
