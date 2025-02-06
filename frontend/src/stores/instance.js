import { defineStore } from 'pinia';

export const useInstanceStore = defineStore('instance', {
  state: () => ({
    instances: []
  }),
  
  actions: {
    async fetchInstances() {
      try {
        const response = await fetch('/api/instances');
        const data = await response.json();
        if (data.success) {
          this.instances = data.data;
          return data.data;
        }
        throw new Error(data.message);
      } catch (error) {
        console.error('Error fetching instances:', error);
        return [];
      }
    },

    async createInstance(instance) {
      try {
        const response = await fetch('/api/instances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(instance)
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        return data.data;
      } catch (error) {
        console.error('Error creating instance:', error);
        throw error;
      }
    },

    async startInstance(id) {
      try {
        const response = await fetch(`/api/instances/${id}/start`, {
          method: 'POST'
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        return data.data;
      } catch (error) {
        console.error('Error starting instance:', error);
        throw error;
      }
    },

    async stopInstance(id) {
      try {
        const response = await fetch(`/api/instances/${id}/stop`, {
          method: 'POST'
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        return data.data;
      } catch (error) {
        console.error('Error stopping instance:', error);
        throw error;
      }
    },

    async getInstanceLogs(id) {
      try {
        const response = await fetch(`/api/instances/${id}/logs`);
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        return data.data;
      } catch (error) {
        console.error('Error fetching instance logs:', error);
        throw error;
      }
    }
  }
}); 