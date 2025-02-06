const Docker = require('dockerode');
const docker = new Docker();
const ContainerService = require('../services/ContainerService');

class InstanceController {
  static async createInstance(req, res) {
    try {
      const { name, description, port } = req.body;
      
      const containerId = `nodered-${port}`;
      
      const container = await docker.createContainer({
        Image: 'nodered/node-red',
        name: containerId,
        Labels: {
          'custom.display.name': name,
          'custom.description': description || ''
        },
        ExposedPorts: {
          '1880/tcp': {}
        },
        HostConfig: {
          PortBindings: {
            '1880/tcp': [{ HostPort: port.toString() }]
          }
        }
      });
      
      await container.start();
      
      res.status(201).json({
        success: true,
        message: 'Instance created successfully',
        data: {
          id: container.id,
          name,
          description,
          port
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAllInstances(req, res) {
    try {
      const instances = await ContainerService.listContainers();
      res.json({
        success: true,
        data: instances
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getInstance(req, res) {
    try {
      const container = docker.getContainer(req.params.id);
      const info = await container.inspect();
      
      res.json({
        success: true,
        data: {
          id: info.Id,
          name: info.Labels['custom.display.name'] || info.Name.replace('/nodered-', ''),
          status: info.State.Status,
          port: info.NetworkSettings.Ports['1880/tcp']?.[0]?.HostPort,
          created: info.Created,
          settings: info.Config.Env
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Instance not found'
      });
    }
  }

  static async startInstance(req, res) {
    try {
      await ContainerService.startContainer(req.params.id);
      res.json({
        success: true,
        message: 'Instance started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async stopInstance(req, res) {
    try {
      await ContainerService.stopContainer(req.params.id);
      res.json({
        success: true,
        message: 'Instance stopped successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteInstance(req, res) {
    try {
      await ContainerService.deleteContainer(req.params.id);
      res.json({
        success: true,
        message: 'Instance deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getInstanceLogs(req, res) {
    try {
      const logs = await ContainerService.getContainerLogs(req.params.id);
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getInstanceFlows(req, res) {
    try {
      const container = docker.getContainer(req.params.id);
      const info = await container.inspect();
      const port = info.NetworkSettings.Ports['1880/tcp'][0].HostPort;
      
      const response = await fetch(`http://localhost:${port}/flows`);
      const flows = await response.json();
      
      res.json({
        success: true,
        data: flows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getInstanceNodes(req, res) {
    try {
      const container = docker.getContainer(req.params.id);
      const info = await container.inspect();
      const port = info.NetworkSettings.Ports['1880/tcp'][0].HostPort;
      
      const response = await fetch(`http://localhost:${port}/nodes`);
      const nodes = await response.json();
      
      res.json({
        success: true,
        data: nodes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getInstanceSettings(req, res) {
    try {
      const container = docker.getContainer(req.params.id);
      const info = await container.inspect();
      
      const settings = {
        port: info.NetworkSettings.Ports['1880/tcp'][0].HostPort,
        environment: info.Config.Env,
        volumes: info.HostConfig.Binds,
        created: info.Created,
        status: info.State.Status
      };
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = InstanceController; 