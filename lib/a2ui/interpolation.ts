/**
 * A2UI Interpolation Utilities
 *
 * Handles JSON Pointer path resolution and string interpolation
 * for data binding in A2UI components.
 */

/**
 * Get a value from the data model using a JSON Pointer path
 * @param dataModel - The data model object
 * @param path - JSON Pointer path (e.g., "/user/name" or "/products/0/price")
 * @returns The value at the path, or undefined if not found
 */
export function getValueByPath(dataModel: Record<string, unknown>, path: string): unknown {
  if (!path) return undefined;

  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (!normalizedPath) return dataModel;

  const parts = normalizedPath.split('/');
  let current: unknown = dataModel;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Handle array indices
    if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (isNaN(index)) {
        return undefined;
      }
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set a value in the data model at a JSON Pointer path
 * @param dataModel - The data model object
 * @param path - JSON Pointer path
 * @param value - The value to set
 * @returns A new data model with the updated value
 */
export function setValueByPath(
  dataModel: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  if (!path) return dataModel;

  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (!normalizedPath) {
    if (typeof value === 'object' && value !== null) {
      return value as Record<string, unknown>;
    }
    return dataModel;
  }

  const parts = normalizedPath.split('/');
  const result = deepClone(dataModel);

  let current: Record<string, unknown> | unknown[] = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const isNextArray = !isNaN(parseInt(nextPart, 10));

    if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (current[index] === undefined || current[index] === null) {
        current[index] = isNextArray ? [] : {};
      }
      current = current[index] as Record<string, unknown> | unknown[];
    } else {
      if (current[part] === undefined || current[part] === null) {
        current[part] = isNextArray ? [] : {};
      }
      current = current[part] as Record<string, unknown> | unknown[];
    }
  }

  const lastPart = parts[parts.length - 1];
  if (Array.isArray(current)) {
    const index = parseInt(lastPart, 10);
    current[index] = value;
  } else {
    current[lastPart] = value;
  }

  return result;
}

/**
 * Interpolate a string with values from the data model
 * Supports ${/path/to/value} syntax
 * @param text - The string to interpolate
 * @param dataModel - The data model object
 * @returns The interpolated string
 */
export function interpolateString(text: string, dataModel: Record<string, unknown>): string {
  if (!text || typeof text !== 'string') return text;

  // Match ${...} patterns where ... is a JSON pointer path
  const pattern = /\$\{([^}]+)\}/g;

  return text.replace(pattern, (match, path) => {
    // Handle special paths for list iteration
    if (path === 'item' || path.startsWith('item.') || path.startsWith('item/')) {
      const itemPath = path === 'item' ? '' : path.replace(/^item[./]/, '');
      const item = dataModel.item;

      if (itemPath === '') {
        return item !== undefined ? String(item) : match;
      }

      if (typeof item === 'object' && item !== null) {
        const value = getValueByPath({ root: item }, `/root/${itemPath.replace(/\./g, '/')}`);
        return value !== undefined ? String(value) : match;
      }
      return match;
    }

    // Handle index for list iteration
    if (path === 'index') {
      const index = dataModel.index;
      return index !== undefined ? String(index) : match;
    }

    // Standard JSON pointer path
    const value = getValueByPath(dataModel, path);
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Resolve a value that might be a binding expression
 * @param value - The value to resolve (could be a string binding or direct value)
 * @param dataModel - The data model object
 * @returns The resolved value
 */
export function resolveValue(value: unknown, dataModel: Record<string, unknown>): unknown {
  if (typeof value !== 'string') return value;

  // Check if it's a simple binding expression (just a path)
  if (value.startsWith('${') && value.endsWith('}')) {
    const path = value.slice(2, -1);
    return getValueByPath(dataModel, path);
  }

  // Check if it's a plain path (starts with /)
  if (value.startsWith('/')) {
    return getValueByPath(dataModel, value);
  }

  // Otherwise, treat it as a string with potential interpolation
  return interpolateString(value, dataModel);
}

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone) as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
