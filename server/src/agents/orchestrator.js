const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const Notification = require('../models/Notification');
const socket = require('../config/socket');

// Check if LangGraph substrate is installed/available
let langGraphStatus = 'not-installed';
try {
  require('@langchain/langgraph');
  langGraphStatus = 'available';
} catch (e) {
  langGraphStatus = 'not-installed';
}

/**
 * Multi-Agent Orchestrator Pipeline Engine
 */
class AgenticOrchestrator {
  async executeWorkflow({ execution, workflow, userId }) {
    const executionId = execution._id || execution.id;
    const workflowId = workflow._id || workflow.id;

    let currentNodeId = null;
    const stepOutputs = {};

    try {
      // 1. Planner Agent Step
      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'info',
        message: 'Planner Agent analyzing graph topology and building execution plan.',
        metadata: { langGraph: langGraphStatus },
      });

      const planResult = plannerAgent.plan(workflow);

      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'success',
        message: `Plan generated: ${planResult.reasoning} (Confidence: ${Math.round(planResult.confidenceScore * 100)}%)`,
        metadata: { executionOrder: planResult.executionOrder, confidenceScore: planResult.confidenceScore },
      });

      const nodesMap = new Map((workflow.nodes || []).map((n) => [n.id, n]));

      // Iterate through planned steps
      for (const nodeId of planResult.executionOrder) {
        currentNodeId = nodeId;
        const node = nodesMap.get(nodeId);
        if (!node) continue;

        await monitoringAgent.emitEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'execution',
          level: 'info',
          message: `Executing node "${node.data?.label || nodeId}" (${node.type}).`,
          metadata: { nodeType: node.type, provider: node.data?.provider },
        });

        // 2. Execution Agent Step
        let execResult;
        let retryCount = 0;
        let success = false;

        while (!success) {
          try {
            execResult = await executionAgent.executeNode(node, stepOutputs, userId);
            success = true;
          } catch (err) {
            // 3. Recovery Agent Step on failure
            await monitoringAgent.emitEvent({
              executionId,
              workflowId,
              nodeId,
              agent: 'recovery',
              level: 'warning',
              message: `Error executing step "${node.data?.label}": ${err.message}`,
              metadata: { error: err.message, code: err.code },
            });

            const recoveryDecision = recoveryAgent.evaluateFailure(err, retryCount, 3);

            if (recoveryDecision.action === 'retry_with_backoff') {
              await monitoringAgent.emitEvent({
                executionId,
                workflowId,
                nodeId,
                agent: 'recovery',
                level: 'info',
                message: recoveryDecision.reason,
                metadata: recoveryDecision,
              });

              await new Promise((res) => setTimeout(res, Math.min(recoveryDecision.backoffDelayMs, 1500)));
              retryCount = recoveryDecision.nextRetryCount;
            } else {
              await monitoringAgent.emitEvent({
                executionId,
                workflowId,
                nodeId,
                agent: 'recovery',
                level: 'error',
                message: `Escalation triggered: ${recoveryDecision.reason}`,
                metadata: recoveryDecision,
              });

              throw err;
            }
          }
        }

        // 4. Validation Agent Step
        await monitoringAgent.emitEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'validation',
          level: 'info',
          message: `Validation Agent verifying output schema for node "${node.data?.label}".`,
        });

        const validation = validationAgent.validate(node, execResult);
        if (!validation.isValid) {
          throw new Error(`Validation failed for node ${nodeId}: ${validation.message}`);
        }

        await monitoringAgent.emitEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'validation',
          level: 'success',
          message: `Validation passed. Fields verified: [${validation.fieldsVerified.join(', ')}]`,
          metadata: validation,
        });

        stepOutputs[nodeId] = execResult.output;
      }

      // 5. Monitoring Agent Finalization
      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'success',
        message: `Workflow run completed successfully across ${planResult.executionOrder.length} steps.`,
        metadata: { langGraph: langGraphStatus, totalSteps: planResult.executionOrder.length },
      });

      // Create success notification
      const notificationData = {
        owner: userId,
        workflowId,
        executionId,
        type: 'success',
        title: 'Workflow Execution Completed',
        message: `Workflow "${workflow.name}" completed successfully.`,
      };

      try {
        const notifDoc = new Notification(notificationData);
        await notifDoc.save();
      } catch (e) {}

      socket.emitNotification(userId, notificationData);

      return {
        status: 'COMPLETED',
        outputs: stepOutputs,
        langGraph: langGraphStatus,
      };
    } catch (error) {
      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        nodeId: currentNodeId,
        agent: 'monitoring',
        level: 'error',
        message: `Execution failed on node ${currentNodeId || 'unknown'}: ${error.message}`,
        metadata: { error: error.message },
      });

      // Create failure notification
      const notificationData = {
        owner: userId,
        workflowId,
        executionId,
        type: 'error',
        title: 'Workflow Execution Failed',
        message: `Workflow "${workflow.name}" failed: ${error.message}`,
      };

      try {
        const notifDoc = new Notification(notificationData);
        await notifDoc.save();
      } catch (e) {}

      socket.emitNotification(userId, notificationData);

      return {
        status: 'FAILED',
        error: { message: error.message, nodeId: currentNodeId },
        langGraph: langGraphStatus,
      };
    }
  }
}

module.exports = new AgenticOrchestrator();
