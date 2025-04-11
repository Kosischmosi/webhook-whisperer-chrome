
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string;
  createdAt: string;
  updatedAt: string;
}

// Use Chrome storage if available, otherwise use localStorage as fallback
const storage = chrome?.storage?.local || {
  get: async (key: string) => {
    const value = localStorage.getItem(key);
    return { [key]: value ? JSON.parse(value) : null };
  },
  set: async (data: Record<string, any>) => {
    const key = Object.keys(data)[0];
    localStorage.setItem(key, JSON.stringify(data[key]));
    return true;
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
      throw new Error('Failed to add webhook');
    }
  },

  update: async (id: string, updateData: Partial<Omit<WebhookConfig, 'id' | 'createdAt'>>): Promise<WebhookConfig> => {
    try {
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
      throw new Error('Failed to update webhook');
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
