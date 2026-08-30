const workflowService = require('../services/workflowService');

const getDashboard = async (req, res) => {
  try {
    const data = await workflowService.getDashboardStats(req.user.id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const listWorkflows = async (req, res) => {
  try {
    const { search, status, tag } = req.query;
    const workflows = await workflowService.listWorkflows(req.user.id, { search, status, tag });
    return res.status(200).json({ workflows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createWorkflow = async (req, res) => {
  try {
    const workflow = await workflowService.createWorkflow(req.user.id, req.body);
    return res.status(201).json({ workflow });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const generateFromPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt string is required' });
    }
    const workflow = await workflowService.generateWorkflowFromPrompt(req.user.id, prompt);
    return res.status(201).json({ workflow });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getWorkflowById = async (req, res) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.user.id, req.params.id);
    return res.status(200).json({ workflow });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

const updateWorkflow = async (req, res) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.user.id, req.params.id, req.body);
    return res.status(200).json({ workflow });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const duplicateWorkflow = async (req, res) => {
  try {
    const workflow = await workflowService.duplicateWorkflow(req.user.id, req.params.id);
    return res.status(201).json({ workflow });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const executeWorkflow = async (req, res) => {
  try {
    const executionService = require('../services/executionService');
    const { inputs, nodes, edges } = req.body || {};
    const execution = await executionService.triggerExecution(
      req.user.id,
      req.params.id,
      inputs || {},
      { nodes, edges }
    );
    return res.status(202).json({
      message: 'Execution triggered successfully',
      executionId: execution._id || execution.id,
      execution,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const deleteWorkflow = async (req, res) => {
  try {
    await workflowService.deleteWorkflow(req.user.id, req.params.id);
    return res.status(200).json({ message: 'Workflow deleted' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getDashboard,
  listWorkflows,
  createWorkflow,
  generateFromPrompt,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  executeWorkflow,
  deleteWorkflow,
};
