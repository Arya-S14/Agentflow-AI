const executionService = require('../services/executionService');

const listExecutions = async (req, res) => {
  try {
    const { workflowId, status, page, limit } = req.query;
    const result = await executionService.listExecutions({ workflowId, status, page, limit });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getExecutionById = async (req, res) => {
  try {
    const execution = await executionService.getExecutionById(req.params.id);
    return res.status(200).json({ execution });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

const getExecutionTimeline = async (req, res) => {
  try {
    const logs = await executionService.getExecutionTimeline(req.params.id);
    return res.status(200).json({ logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const pauseExecution = async (req, res) => {
  try {
    const execution = await executionService.pauseExecution(req.params.id);
    return res.status(200).json({ message: 'Execution paused', execution });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const resumeExecution = async (req, res) => {
  try {
    const execution = await executionService.resumeExecution(req.params.id);
    return res.status(200).json({ message: 'Execution resumed', execution });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const cancelExecution = async (req, res) => {
  try {
    const execution = await executionService.cancelExecution(req.params.id);
    return res.status(200).json({ message: 'Execution cancelled', execution });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listExecutions,
  getExecutionById,
  getExecutionTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
