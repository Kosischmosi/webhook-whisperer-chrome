
// Type definitions for Chrome extension API
interface Chrome {
  runtime: {
    id: string;
    // Add other Chrome runtime properties as needed
  };
  storage: {
    local: {
      get: (keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void) => void;
      set: (items: object, callback?: () => void) => void;
      remove: (keys: string | string[], callback?: () => void) => void;
    };
    // Add other Chrome storage properties as needed
  };
}

declare global {
  const chrome: Chrome | undefined;
}

export {};
