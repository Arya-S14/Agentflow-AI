const axios = require('axios');
const env = require('../config/env');

/**
 * Generate a complete workflow graph from a natural language prompt.
 */
const generateWorkflowFromPrompt = async (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required');
  }

  // 1. Try OpenRouter if key set
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log('[AI Service] Attempting workflow generation with OpenRouter API...');
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 12000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.nodes && parsed.edges) {
          return sanitizeGeneratedGraph(parsed, prompt);
        }
      }
    } catch (err) {
      console.warn('[AI Service Warning] OpenRouter generation failed, falling back to Gemini / Deterministic rule engine:', err.message);
    }
  }

  // 2. Try Gemini API if key set
  if (env.GEMINI_API_KEY) {
    try {
      console.log('[AI Service] Attempting workflow generation with Gemini API...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        { timeout: 12000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.nodes && parsed.edges) {
          return sanitizeGeneratedGraph(parsed, prompt);
        }
      }
    } catch (err) {
      console.warn('[AI Service Warning] Gemini generation failed, falling back to Deterministic rule engine:', err.message);
    }
  }

  // 3. Fallback: Deterministic Rule-Based Builder
  console.log('[AI Service] Generating workflow using Deterministic Rule-Based Engine.');
  return generateDeterministicGraph(prompt);
};

const SYSTEM_PROMPT = `
You are an expert AI Automation Architect for Agentflow_AI.
Generate a valid React Flow graph JSON for an automation workflow based on user intent.
Return ONLY valid JSON matching this schema:
{
  "name": "Workflow Name",
  "description": "Short description",
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger" | "ai" | "integration" | "condition" | "action",
      "position": { "x": 250, "y": 100 },
      "data": {
        "label": "Node Title",
        "provider": "gmail" | "slack" | "google-sheets" | "discord" | "openrouter" | "system",
        "actionType": "send_email" | "post_message" | "append_row" | "read_range" | "generate_summary" | "filter",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1_2",
      "source": "node_1",
      "target": "node_2",
      "animated": true,
      "label": "Optional label"
    }
  ]
}
`;

const generateDeterministicGraph = (prompt) => {
  const p = prompt.toLowerCase();

  const nodes = [
    {
      id: 'node_1',
      type: 'trigger',
      position: { x: 250, y: 100 },
      data: {
        label: 'Manual / Webhook Trigger',
        provider: 'system',
        actionType: 'webhook_event',
        config: { payload: 'Sample JSON Data' },
      },
    },
  ];

  const edges = [];
  let name = 'Automated Agent Flow';
  let description = 'Generated automation graph based on operator input prompt.';

  if (p.includes('sheet') || p.includes('row') || p.includes('excel') || p.includes('table')) {
    nodes.push({
      id: 'node_2',
      type: 'integration',
      position: { x: 250, y: 240 },
      data: {
        label: 'Fetch Google Sheet Rows',
        provider: 'google-sheets',
        actionType: 'read_range',
        config: { spreadsheetId: 'sheet_demo_101', range: 'Sheet1!A1:E50' },
      },
    });
    edges.push({ id: 'e1-2', source: 'node_1', target: 'node_2', animated: true });
  }

  const aiNodeId = `node_${nodes.length + 1}`;
  nodes.push({
    id: aiNodeId,
    type: 'ai',
    position: { x: 250, y: 100 + nodes.length * 140 },
    data: {
      label: 'AI Data Processing & Analysis',
      provider: 'openrouter',
      actionType: 'generate_summary',
      config: {
        systemPrompt: 'Extract key insights, detect urgency, and format structured summary output.',
        temperature: 0.2,
      },
    },
  });
  edges.push({
    id: `e_${nodes.length - 1}_${nodes.length}`,
    source: nodes[nodes.length - 2].id,
    target: aiNodeId,
    animated: true,
  });

  if (p.includes('email') || p.includes('gmail') || p.includes('mail')) {
    const emailNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: emailNodeId,
      type: 'integration',
      position: { x: 100, y: 100 + nodes.length * 140 },
      data: {
        label: 'Send Email Alert via Gmail',
        provider: 'gmail',
        actionType: 'send_email',
        config: {
          to: 'operator@company.com',
          subject: 'Agentflow_AI: Critical Automation Dispatch',
          body: '{{ai_summary_output}}',
        },
      },
    });
    edges.push({ id: `e_${aiNodeId}_${emailNodeId}`, source: aiNodeId, target: emailNodeId, animated: true, label: 'Email Dispatch' });
  }

  if (p.includes('slack') || p.includes('channel') || p.includes('team')) {
    const slackNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: slackNodeId,
      type: 'integration',
      position: { x: 420, y: 100 + nodes.length * 140 },
      data: {
        label: 'Notify Slack Channel',
        provider: 'slack',
        actionType: 'post_message',
        config: { channel: '#ops-automation', text: '⚡ Agentflow AI execution alert: {{ai_summary_output}}' },
      },
    });
    edges.push({ id: `e_${aiNodeId}_${slackNodeId}`, source: aiNodeId, target: slackNodeId, animated: true, label: 'Slack Broadcast' });
  }

  if (p.includes('discord') || p.includes('bot')) {
    const discordNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: discordNodeId,
      type: 'integration',
      position: { x: 580, y: 100 + nodes.length * 140 },
      data: {
        label: 'Post to Discord Bot Channel',
        provider: 'discord',
        actionType: 'post_message',
        config: { channelId: '109283749', content: '🤖 Discord Bot Notification: Automation step finalized.' },
      },
    });
    edges.push({ id: `e_${aiNodeId}_${discordNodeId}`, source: aiNodeId, target: discordNodeId, animated: true });
  }

  if (nodes.length <= 2) {
    // Standard 3-step pipeline fallback
    const notifyNodeId = `node_${nodes.length + 1}`;
    nodes.push({
      id: notifyNodeId,
      type: 'integration',
      position: { x: 250, y: 100 + nodes.length * 140 },
      data: {
        label: 'Post Slack Dispatch',
        provider: 'slack',
        actionType: 'post_message',
        config: { channel: '#general', text: 'Automated workflow executed successfully.' },
      },
    });
    edges.push({ id: `e_${aiNodeId}_${notifyNodeId}`, source: aiNodeId, target: notifyNodeId, animated: true });
  }

  if (p.includes('invoice') || p.includes('payment')) {
    name = 'Automated Invoice Processing & Notification Pipeline';
    description = 'Parses incoming invoice data, runs AI validation, appends records to Google Sheets, and alerts Slack.';
  } else if (p.includes('email') && p.includes('slack')) {
    name = 'Email Sync & Slack Operations Bridge';
    description = 'Ingests emails, analyzes priority via AI agent, and broadcasts formatted summaries to Slack.';
  } else {
    name = `AI Flow: ${prompt.substring(0, 35)}...`;
  }

  return sanitizeGeneratedGraph({ name, description, nodes, edges }, prompt);
};

const sanitizeGeneratedGraph = (graph, prompt) => {
  return {
    name: graph.name || 'AI Generated Automation',
    description: graph.description || `Workflow generated from prompt: "${prompt}"`,
    nodes: (graph.nodes || []).map((node, idx) => ({
      id: node.id || `node_${idx + 1}`,
      type: node.type || 'action',
      position: node.position || { x: 250, y: (idx + 1) * 120 },
      data: {
        label: node.data?.label || `Step ${idx + 1}`,
        provider: node.data?.provider || 'system',
        actionType: node.data?.actionType || 'execute',
        config: node.data?.config || {},
      },
    })),
    edges: (graph.edges || []).map((edge, idx) => ({
      id: edge.id || `edge_${idx + 1}`,
      source: edge.source,
      target: edge.target,
      animated: edge.animated !== undefined ? edge.animated : true,
      label: edge.label || '',
    })),
  };
};

module.exports = {
  generateWorkflowFromPrompt,
};
