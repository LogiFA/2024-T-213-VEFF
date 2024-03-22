module.exports = {
    // Defines the environment our code runs in
    env: {
      es2021: true, // Enables modern ECMAScript features
      node: true,  // Enables Node.js global variables and Node.js scoping
      jest: true   // Adds Jest testing global variables
    },
  
    // Extends configurations from eslint and a plugin
    extends: [
      "eslint:recommended", // Uses the recommended rules from eslint
      "plugin:node/recommended" // Uses the recommended rules from the eslint-plugin-node
    ],
  
    // Parser options help ESLint determine what is allowed
    parserOptions: {
      ecmaVersion: 12, // Allows for the parsing of modern ECMAScript features
      sourceType: "module" // Allows for the use of imports
    },
  
    // Custom rules configurations
    rules: {
      "no-var": "error", // Disallow the use of var, prefer let or const instead
      "prefer-const": "error", // Suggest using const for variables that are never reassigned after declared
      "arrow-body-style": ["error", "as-needed"], // Require braces in arrow function body only when necessary
      "prefer-arrow-callback": "error", // Suggest using arrow functions as callbacks
  
      // Node.js specific rules
      "node/no-unsupported-features/es-syntax": ["error", {
        "version": ">=14.0.0" // Specifies the supported Node.js version for syntax features
      }],
      "node/no-missing-import": ["error", {
        "tryExtensions": [".js", ".json", ".node"] // Specifies the file extensions to try when resolving imports
      }],
      "node/no-unpublished-import": "off", // Turn off checking for unpublished imports
      "node/no-unpublished-require": "off", // Turn off checking for unpublished require paths
      "node/no-extraneous-import": "off", // Turn off checking for extraneous imports
      "node/no-extraneous-require": "off", // Turn off checking for extraneous require paths
      "node/no-missing-require": ["error", {
        "tryExtensions": [".js", ".json", ".node"] // Specifies the file extensions to try when resolving require
      }]
    }
  };
  