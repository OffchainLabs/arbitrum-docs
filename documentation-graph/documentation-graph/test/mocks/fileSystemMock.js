/**
 * File System Mock
 *
 * In-memory file system for testing without actual I/O
 */

import { jest } from '@jest/globals';

/**
 * Create a mock file system
 */
export function createMockFileSystem() {
  const files = new Map();
  const directories = new Set();

  return {
    // Internal state
    files,
    directories,

    // Mock methods
    readJsonFile: jest.fn(async (filePath) => {
      if (!files.has(filePath)) {
        const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        error.code = 'ENOENT';
        throw error;
      }
      const content = files.get(filePath);
      return JSON.parse(content);
    }),

    writeFile: jest.fn(async (filePath, content) => {
      files.set(filePath, content);
      // Auto-create parent directory
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      if (dir) {
        directories.add(dir);
      }
    }),

    readFile: jest.fn(async (filePath, encoding = 'utf8') => {
      if (!files.has(filePath)) {
        const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        error.code = 'ENOENT';
        throw error;
      }
      return files.get(filePath);
    }),

    writeJson: jest.fn(async (filePath, data) => {
      const content = JSON.stringify(data, null, 2);
      files.set(filePath, content);
    }),

    pathExists: jest.fn(async (filePath) => {
      return files.has(filePath) || directories.has(filePath);
    }),

    ensureDir: jest.fn(async (dirPath) => {
      directories.add(dirPath);
    }),

    emptyDir: jest.fn(async (dirPath) => {
      // Remove all files in directory
      for (const [path] of files) {
        if (path.startsWith(dirPath + '/')) {
          files.delete(path);
        }
      }
    }),

    // Synchronous versions
    existsSync: jest.fn((filePath) => {
      return files.has(filePath) || directories.has(filePath);
    }),

    readFileSync: jest.fn((filePath, encoding = 'utf8') => {
      if (!files.has(filePath)) {
        const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        error.code = 'ENOENT';
        throw error;
      }
      return files.get(filePath);
    }),

    writeFileSync: jest.fn((filePath, content) => {
      files.set(filePath, content);
    }),

    statSync: jest.fn((filePath) => {
      if (!files.has(filePath)) {
        const error = new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
        error.code = 'ENOENT';
        throw error;
      }
      const content = files.get(filePath);
      return {
        size: Buffer.byteLength(content, 'utf8'),
        isDirectory: () => false,
        isFile: () => true,
      };
    }),

    // Test utilities
    addFile: (filePath, content) => {
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      files.set(filePath, contentStr);
    },

    addDirectory: (dirPath) => {
      directories.add(dirPath);
    },

    getFile: (filePath) => {
      return files.get(filePath);
    },

    hasFile: (filePath) => {
      return files.has(filePath);
    },

    reset: () => {
      files.clear();
      directories.clear();
    },

    listFiles: () => {
      return Array.from(files.keys());
    },

    getFileCount: () => {
      return files.size;
    },
  };
}

/**
 * Create mock for specific fileUtils module
 */
export function mockFileUtils() {
  const mockFs = createMockFileSystem();

  return {
    ...mockFs,
    // Additional utilities specific to fileUtils
    ensureDirectoryExists: jest.fn(async (dirPath) => {
      mockFs.directories.add(dirPath);
    }),

    getFileSize: jest.fn((filePath) => {
      if (!mockFs.files.has(filePath)) {
        return 0;
      }
      const content = mockFs.files.get(filePath);
      return Buffer.byteLength(content, 'utf8');
    }),

    formatBytes: jest.fn((bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }),
  };
}

export default createMockFileSystem;
