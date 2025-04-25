import { isValidWebhookUrl, isStrongSecret } from "@/utils/securityUtils";

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string;
  createdAt: string;
  updatedAt: string;
}

// Use Chrome storage if available, otherwise use localStorage as fallback
const storage = typeof chrome !== 'undefined' && chrome?.storage?.local ? {
  get: (key: string | string[] | object | null, callback: (items: { [key: string]: any }) => void) => {
    chrome.storage.local.get(key, callback);
  },
  set: (items: object, callback?: () => void) => {
    chrome.storage.local.set(items, callback);
  }
} : {
  get: (key: string | string[] | object | null, callback: (items: { [key: string]: any }) => void) => {
    const value = localStorage.getItem(typeof key === 'string' ? key : Object.keys(key || {})[0] || '');
    callback({ [typeof key === 'string' ? key : Object.keys(key || {})[0] || '']: value ? JSON.parse(value) : null });
  },
  set: (items: object, callback?: () => void) => {
    const key = Object.keys(items)[0];
    localStorage.setItem(key, JSON.stringify(items[key as keyof typeof items]));
    if (callback) callback();
  },
};

export const webhookService = {
  getAll: async (): Promise<WebhookConfig[]> => {
    try {
      return new Promise((resolve) => {
        storage.get('webhooks', (result) => {
          resolve(result.webhooks || []);
        });
      });
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      return [];
    }
  },

  add: async (webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookConfig> => {
    try {
      if (!webhook.name?.trim()) {
        throw new Error('Name is required');
      }
      
      if (!isValidWebhookUrl(webhook.url)) {
        throw new Error('Invalid webhook URL');
      }
      
      const webhooks = await webhookService.getAll();
      
      const newWebhook: WebhookConfig = {
        ...webhook,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return new Promise((resolve) => {
        storage.set({ 'webhooks': [...webhooks, newWebhook] }, () => {
          resolve(newWebhook);
        });
      });
    } catch (error) {
      console.error('Error adding webhook:', error);
      throw error;
    }
  },

  update: async (id: string, updateData: Partial<Omit<WebhookConfig, 'id' | 'createdAt'>>): Promise<WebhookConfig> => {
    try {
      if (updateData.url && !isValidWebhookUrl(updateData.url)) {
        throw new Error('Invalid webhook URL');
      }
      
      const webhooks = await webhookService.getAll();
      const index = webhooks.findIndex(hook => hook.id === id);
      
      if (index === -1) {
        throw new Error('Webhook not found');
      }
      
      const updatedWebhook: WebhookConfig = {
        ...webhooks[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      webhooks[index] = updatedWebhook;
      
      return new Promise((resolve) => {
        storage.set({ 'webhooks': webhooks }, () => {
          resolve(updatedWebhook);
        });
      });
    } catch (error) {
      console.error('Error updating webhook:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const webhooks = await webhookService.getAll();
      const filteredWebhooks = webhooks.filter(hook => hook.id !== id);
      
      if (webhooks.length === filteredWebhooks.length) {
        throw new Error('Webhook not found');
      }
      
      return new Promise((resolve) => {
        storage.set({ 'webhooks': filteredWebhooks }, () => {
          resolve();
        });
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw new Error('Failed to delete webhook');
    }
  },
};
