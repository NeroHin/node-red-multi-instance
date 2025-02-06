const Docker = require('dockerode');

class ContainerService {
  constructor() {
    this.docker = new Docker();
  }

  async startContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
      return true;
    } catch (error) {
      console.error('Error starting container:', error);
      throw error;
    }
  }

  async stopContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      return true;
    } catch (error) {
      console.error('Error stopping container:', error);
      throw error;
    }
  }

  async deleteContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      await container.remove();
      return true;
    } catch (error) {
      console.error('Error deleting container:', error);
      throw error;
    }
  }

  async getContainerLogs(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 100,
        timestamps: true
      });
      return logs.toString('utf8').split('\n');
    } catch (error) {
      console.error('Error getting container logs:', error);
      throw error;
    }
  }

  async listContainers() {
    try {
      const containers = await this.docker.listContainers({ all: true });
      return containers
        .filter(container => container.Names[0].startsWith('/nodered-'))
        .map(container => ({
          id: container.Id,
          name: container.Labels['custom.display.name'] || container.Names[0].replace('/nodered-', ''),
          description: container.Labels['custom.description'] || '',
          status: container.State,
          port: container.Ports.find(p => p.PrivatePort === 1880)?.PublicPort || null
        }));
    } catch (error) {
      console.error('Error listing containers:', error);
      throw new Error('Failed to list containers: ' + error.message);
    }
  }
}

module.exports = new ContainerService(); 