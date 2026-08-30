const crypto = require('crypto');
const Integration = require('../models/Integration');
const env = require('../config/env');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const ALGORITHM = 'aes-256-cbc';
const inMemoryIntegrations = new Map();

// Helper: Ensure 32-byte key
const getSecretKey = () => {
  const key = env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
  return crypto.createHash('sha256').update(key).digest();
};

const encryptData = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
  };
};

const decryptData = (encryptedObj) => {
  if (!encryptedObj || !encryptedObj.encryptedData || !encryptedObj.iv) return null;
  try {
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('[Encryption Error] Failed to decrypt credentials:', err.message);
    return null;
  }
};

const getProviderInstance = (provider) => {
  switch (provider) {
    case 'gmail':
      return gmailIntegration;
    case 'slack':
      return slackIntegration;
    case 'discord':
      return discordIntegration;
    case 'google-sheets':
      return googleSheetsIntegration;
    default:
      return null;
  }
};

const getIntegrationsForUser = async (userId) => {
  const providers = ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'];
  let dbIntegrations = [];
  try {
    dbIntegrations = await Integration.find({ owner: userId });
  } catch (err) {
    dbIntegrations = Array.from(inMemoryIntegrations.values()).filter((i) => i.owner === userId.toString());
  }

  const map = new Map(dbIntegrations.map((i) => [i.provider, i]));

  return providers.map((provider) => {
    const existing = map.get(provider);
    return {
      provider,
      isConnected: existing ? existing.isConnected : false,
      expiresAt: existing ? existing.expiresAt : null,
      scopes: existing ? existing.scopes : [],
      updatedAt: existing ? existing.updatedAt : null,
    };
  });
};

const saveIntegrationCredentials = async (userId, provider, rawTokens, scopes = []) => {
  const encryptedTokens = encryptData(rawTokens);
  const updateData = {
    owner: userId,
    provider,
    isConnected: true,
    scopes,
    encryptedTokens,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };

  try {
    return await Integration.findOneAndUpdate(
      { owner: userId, provider },
      updateData,
      { upsert: true, new: true }
    );
  } catch (err) {
    const key = `${userId}:${provider}`;
    const mockRecord = {
      _id: `int_${Date.now()}`,
      ...updateData,
      owner: userId.toString(),
      updatedAt: new Date(),
    };
    inMemoryIntegrations.set(key, mockRecord);
    return mockRecord;
  }
};

const getUserCredentials = async (userId, provider) => {
  let doc = null;
  try {
    doc = await Integration.findOne({ owner: userId, provider });
  } catch (err) {
    const key = `${userId}:${provider}`;
    doc = inMemoryIntegrations.get(key);
  }

  if (!doc || !doc.isConnected) return null;
  return decryptData(doc.encryptedTokens);
};

const getValidCredentials = async (userId, provider) => {
  const credentials = await getUserCredentials(userId, provider);
  if (!credentials) return null;

  // Transparent token refresh for expired credentials
  const isExpiring = credentials.expiresAt && Date.now() > (credentials.expiresAt - 60000);
  if (isExpiring && credentials.refreshToken) {
    const providerInstance = getProviderInstance(provider);
    if (providerInstance && typeof providerInstance.refreshToken === 'function') {
      try {
        const refreshed = await providerInstance.refreshToken(credentials.refreshToken);
        const updatedTokens = {
          ...credentials,
          accessToken: refreshed.accessToken || credentials.accessToken,
          expiresAt: refreshed.expiresAt || (Date.now() + (3600 * 1000)),
        };
        await saveIntegrationCredentials(userId, provider, updatedTokens, credentials.scope || []);
        return updatedTokens;
      } catch (err) {
        console.error(`[Token Refresh Failed] ${provider}:`, err.message);
      }
    }
  }

  return credentials;
};

const getIntegrationStatus = async (userId) => {
  const integrations = await getIntegrationsForUser(userId);
  const statusSummary = {};
  for (const item of integrations) {
    statusSummary[item.provider] = {
      isConnected: item.isConnected,
      expiresAt: item.expiresAt,
    };
  }
  return {
    providers: statusSummary,
    encryptionHealth: 'AES-256-CBC Active',
  };
};

module.exports = {
  encryptData,
  decryptData,
  getProviderInstance,
  getIntegrationsForUser,
  saveIntegrationCredentials,
  getUserCredentials,
  getValidCredentials,
  getIntegrationStatus,
};
