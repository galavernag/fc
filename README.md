# FC - File Converter

FC is a file converter for your terminal, inspired by the plugin management style of [asdf](https://github.com/asdf-vm/asdf). This tool allows you to convert files between different formats using an extensible plugin system.

## About the Project

FC (File Converter) is a CLI written in TypeScript using the [Bun](https://bun.sh) runtime that facilitates file conversion. The project was inspired by ASDF's style, adopting a modular approach where converters are added as plugins from GitHub repositories.

Key features:

- Extensible plugin system
- Simple converter management via CLI
- Automatic installation of converters from GitHub
- Clear API for developing new converters

## How to Install

```bash
# With NPM
npm install -g file-converter-cli

# With Yarn
yarn global add file-converter-cli

# With Bun
bun install -g file-converter-cli
```

## How to Use

### Basic Commands

```bash
# Convert a file
fc convert input.json output.yaml

# Add a new converter
fc add https://github.com/username/fc-json-yaml

# List available converters
fc converter list

# Remove a converter
fc converter remove fc-json-yaml
```

### Advanced Options

```bash
# Force overwrite of output file
fc convert input.json output.yaml --force

# Run with debug messages
DEBUG=true fc convert input.json output.yaml
```

## Features

- **File Conversion**: Convert files between different formats
- **Plugin System**: Add, remove, and manage conversion plugins
- **Extensible Base**: Easily create new converters for custom formats
- **Automatic Management**: Automatic installation and building of plugins
- **Validated Schema**: Each converter follows a defined schema to ensure compatibility

## How to Contribute

### Local Development

1. Clone the repository

   ```bash
   git clone https://github.com/guigalaverna/fc.git
   cd fc
   ```

2. Install dependencies

   ```bash
   bun install
   ```

3. Run in development mode
   ```bash
   bun run dev
   ```

### Creating a Converter

A converter is a package that implements the `Converter` interface defined in the schema. Here's a basic example:

```typescript
// index.ts
import fs from "fs/promises";

const converter = {
  name: "json-yaml-converter",
  description: "Converts files between JSON and YAML",
  sourceFormats: ["json", "yaml"],
  targetFormats: ["yaml", "json"],

  async convert(
    input: string,
    output: string,
    options: Record<string, any>
  ): Promise<boolean> {
    try {
      // Conversion logic here
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getOptions() {
    return {
      prettify: {
        description: "Format the output",
        required: false,
        default: true,
      },
    };
  },
};

export default converter;
```

### Repository Structure for Converters

```
my-converter/
├── src/
│   └── index.ts
├── dist/
│   └── index.js (compiled)
├── package.json
└── README.md
```

Make sure to include a build script that compiles to `dist/index.js`.

## License

This project is licensed under the [MIT License](LICENSE).
