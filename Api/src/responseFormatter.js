export const formatResponse = (message, action = null, data = null) => ({
  message,
  action,
  data,
  timestamp: new Date().toISOString()
});

export const formatError = (error) => ({
  message: `❌ Erro: ${error.message}`,
  action: 'error',
  data: null,
  timestamp: new Date().toISOString()
});
