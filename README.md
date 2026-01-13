# Async Script Loader

[![npm version](https://img.shields.io/npm/v/@zoltanradics/async-script-loader.svg)](https://www.npmjs.com/package/@zoltanradics/async-script-loader)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight TypeScript library for dynamically loading external JavaScript files with promise-based API and automatic timeout handling.

## Features

- Promise-based API for script loading
- Automatic timeout handling (2 second default)
- Proper event listener cleanup to prevent memory leaks
- URL encoding for query parameters
- TypeScript support with full type definitions
- Works in both ES modules and browser environments
- Small bundle size (~1 KB)

## Why not use `import()`?

This library is **not** a replacement for the native `import()` function. They serve different purposes:

**Use `import()`** when:
- Loading ES modules with exports you need to access
- Working with your own modular code
- You need tree-shaking and modern module features

**Use this library** when:
- Loading third-party scripts that aren't ES modules (analytics, ads, legacy libraries)
- Scripts that set global variables or have side effects
- You need to append query parameters to the script URL
- Loading scripts that don't have exports (just execute code)
- You need timeout handling for unreliable external scripts
- Working with scripts designed to be loaded via `<script>` tags

**Example:** Google Analytics, payment SDKs, chat widgets, and many third-party services provide scripts meant to be loaded as `<script src="...">` rather than ES modules. This library makes loading such scripts programmatic and promise-based.

## Installation

```bash
npm install @zoltanradics/async-script-loader
```

## Usage

### ES Module (Bundlers, Modern JavaScript)

```javascript
import { asyncScriptLoader } from '@zoltanradics/async-script-loader';

// Load a script with query parameters
asyncScriptLoader('https://example.com/script.js', {
  version: '1.0',
  apiKey: 'your-api-key',
  env: 'production'
})
  .then(() => {
    console.log('Script loaded successfully');
    // Script is now available and can be used
  })
  .catch((error) => {
    console.error('Failed to load script:', error);
  });
```

### Direct Browser Usage (CDN)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Async Script Loader Example</title>
</head>
<body>
  <!-- Load from unpkg -->
  <script src="https://unpkg.com/@zoltanradics/async-script-loader"></script>

  <!-- Or load from jsDelivr -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/@zoltanradics/async-script-loader"></script> -->

  <script>
    // Access via global AsyncScriptLoader object
    AsyncScriptLoader.asyncScriptLoader(
      'https://example.com/analytics.js',
      { userId: '12345', tracking: 'enabled' }
    )
      .then(() => console.log('Analytics loaded'))
      .catch((err) => console.error('Failed to load analytics', err));
  </script>
</body>
</html>
```

### TypeScript

The library includes TypeScript definitions out of the box:

```typescript
import { asyncScriptLoader } from '@zoltanradics/async-script-loader';

const loadScript = async (): Promise<void> => {
  try {
    await asyncScriptLoader('https://api.example.com/sdk.js', {
      version: '2.0',
      debug: 'true'
    });
    // Script loaded successfully
  } catch (error) {
    // Handle error
    console.error(error);
  }
};

loadScript();
```

## API

### `asyncScriptLoader(baseUrl, queryParamObject)`

Dynamically injects a script tag into the document head and returns a Promise.

#### Parameters

- `baseUrl` (string): The base URL of the script to load
- `queryParamObject` (object): An object containing query parameters to append to the URL
  - Keys and values will be automatically URL-encoded
  - Example: `{ key: 'value', foo: 'bar' }` becomes `?key=value&foo=bar`

#### Returns

- `Promise<void>`: Resolves when the script loads successfully, rejects on error or timeout

#### Behavior

- The script is injected into the `<head>` element with `async` attribute
- Automatically times out after 2 seconds if the script hasn't loaded
- On timeout, the promise resolves (not rejects) with a console warning
- On error, the promise rejects with an error message
- Event listeners are automatically cleaned up after load/error/timeout

## Examples

### Loading Google Analytics

```javascript
import { asyncScriptLoader } from '@zoltanradics/async-script-loader';

asyncScriptLoader('https://www.googletagmanager.com/gtag/js', {
  id: 'G-XXXXXXXXXX'
})
  .then(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  });
```

### Loading Multiple Scripts Sequentially

```javascript
import { asyncScriptLoader } from '@zoltanradics/async-script-loader';

async function loadScripts() {
  try {
    await asyncScriptLoader('https://cdn.example.com/library.js', {});
    console.log('Library loaded');

    await asyncScriptLoader('https://cdn.example.com/plugin.js', {
      theme: 'dark'
    });
    console.log('Plugin loaded');

    // Both scripts are now loaded
  } catch (error) {
    console.error('Script loading failed:', error);
  }
}

loadScripts();
```

### Loading Scripts in Parallel

```javascript
import { asyncScriptLoader } from '@zoltanradics/async-script-loader';

Promise.all([
  asyncScriptLoader('https://cdn.example.com/script1.js', {}),
  asyncScriptLoader('https://cdn.example.com/script2.js', {}),
  asyncScriptLoader('https://cdn.example.com/script3.js', {})
])
  .then(() => {
    console.log('All scripts loaded successfully');
  })
  .catch((error) => {
    console.error('One or more scripts failed to load:', error);
  });
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT © [Zoltan Radics](https://github.com/zoltanradics)

Made with ❤️ by [Zoltan Radics](https://github.com/zoltanradics)
