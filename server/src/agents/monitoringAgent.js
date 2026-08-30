const ExecutionLog = require('../models/ExecutionLog');
const socket = require('../config/socket');

const inMemoryLogs = [];

/**
 * Monitoring Agent
 * Emits timeline events and records execution logs.
 */
class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  async emitEvent({ executionId, workflowId, nodeId, agent, level, message, metadata }) {
    const logData = {
      executionId,
      workflowId,
      nodeId: nodeId || null,
      agent,
      level: level || 'info',
      message,
      metadata: metadata || {},
      timestamp: new Date(),
    };

    // Save to DB or in-memory array
    try {
      const logDoc = new ExecutionLog(logData);
      await logDoc.save();
    } catch (err) {
      inMemoryLogs.push(logData);
    }

    // Real-time broadcast over Socket.IO
    socket.emitExecutionEvent(executionId, logData);

    return logData;
  }

  static getLogsForExecution(executionId) {
    return inMemoryLogs.filter((l) => l.executionId.toString() === executionId.toString());
  }
}

module.exports = new MonitoringAgent();
