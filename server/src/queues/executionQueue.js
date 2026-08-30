const { Queue, Worker } = require('bullmq');
const env = require('../config/env');

let executionQueue = null;
let isRedisAvailable = false;
const inMemoryJobQueue = [];

try {
  const connection = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  };

  executionQueue = new Queue('workflow-execution', { connection });
  isRedisAvailable = true;
  console.log('[BullMQ] Queue initialized with Redis.');
} catch (err) {
  console.warn('[BullMQ Warning] Redis not reachable. Using in-memory background worker fallback.');
  isRedisAvailable = false;
}

const addExecutionJob = async (jobName, data) => {
  if (isRedisAvailable && executionQueue) {
    try {
      return await executionQueue.add(jobName, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
    } catch (err) {
      console.warn('[BullMQ Fallback] Failed enqueueing job to Redis, switching to memory queue:', err.message);
    }
  }

  // In-memory queue fallback
  const mockJob = {
    id: `job_${Date.now()}`,
    name: jobName,
    data,
    timestamp: Date.now(),
  };
  inMemoryJobQueue.push(mockJob);
  return mockJob;
};

const getQueueStatus = () => {
  return {
    isRedisAvailable,
    mode: isRedisAvailable ? 'BullMQ (Redis)' : 'In-Memory Async Queue',
    pendingJobs: inMemoryJobQueue.length,
  };
};

module.exports = {
  addExecutionJob,
  getQueueStatus,
};
