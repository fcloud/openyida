# Yida Publish Scripts Tests

## Overview

This directory contains tests for the Yida publish scripts.

## Running Tests

```bash
# Install test dependencies
cd .claude/skills/yida-publish/scripts
npm install --save-dev jest

# Run tests
npm test
```

## Test Structure

```
tests/
├── publish.test.js      # Tests for publish functionality
├── babel-transform.test.js  # Tests for JSX compilation
└── jsx-utils.test.js   # Tests for JSX utilities
```

## Adding Tests

1. Create a new test file in the `tests` directory
2. Use Jest to write test cases
3. Run `npm test` to execute all tests
