import AuditLogService from '../services/auditLog.service.js';


export const auditMiddleware = (options = {}) => {
  return async (req, res, next) => {
    if (req.method === 'GET') {
      return next();
    }

    const skipPaths = [
      '/health',
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh-token',
      '/api/guest/session',
    ];
    
    if (skipPaths.includes(req.path) || req.path === '/') {
      return next();
    }

    const originalJson = res.json;

    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        const guestSessionId = req.guest?.guestSessionId;
        
        if (userId || guestSessionId) {
          const action = getAction(req);
          const entity = getEntity(req);
          const entityId = getEntityId(req, data);
          
          const finalEntityId = entityId || getEntityIdFromResponse(data);
          
          const finalEntity = entity !== 'Unknown' ? entity : getEntityFromPath(req);

          if (finalEntityId) {
            const entityName = getEntityName(req, data);
            
            const details = {
              entityName: entityName || finalEntityId,
              method: req.method,
              url: req.originalUrl,
              path: req.path,
              body: req.body,
              query: req.query,
              params: req.params,
              timestamp: new Date().toISOString(),
            };

            const logData = {
              action,
              entity: finalEntity,
              entityId: finalEntityId,
              userId: userId || null,
              guestSessionId: guestSessionId || null,
              details: details,
            };

            AuditLogService.createLog(logData).catch(err => {
              console.error('❌ Audit log error:', err.message);
            });
          }
        }
      }

      originalJson.call(this, data);
    };

    next();
  };
};


function getAction(req) {
  const method = req.method;
  const actions = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
  };
  return actions[method] || method;
}


function getEntity(req) {
  const path = req.path;
  const parts = path.split('/').filter(Boolean);
  
  const filteredParts = parts.filter(p => p !== 'api');
  
  if (filteredParts.length === 0) return 'Unknown';
  
  const lastPart = filteredParts[filteredParts.length - 1];
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastPart) || /^\d+$/.test(lastPart);
  
  if (isId && filteredParts.length >= 2) {
    return capitalize(filteredParts[filteredParts.length - 2]);
  }
  
  return capitalize(filteredParts[filteredParts.length - 1]);
}


function getEntityFromPath(req) {
  const path = req.path;
  const parts = path.split('/').filter(Boolean);
  const filteredParts = parts.filter(p => p !== 'api');
  
  if (filteredParts.length === 0) return 'Unknown';
  
  const lastPart = filteredParts[filteredParts.length - 1];
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastPart) || /^\d+$/.test(lastPart);
  
  if (isId && filteredParts.length >= 2) {
    return capitalize(filteredParts[filteredParts.length - 2]);
  }
  
  return capitalize(filteredParts[filteredParts.length - 1]);
}


function getEntityId(req, data) {
  if (req.params.id) {
    return req.params.id;
  }
  
  if (data?.data?.id) {
    return data.data.id;
  }
  
  if (data?.id) {
    return data.id;
  }
  
  if (req.body?.id) {
    return req.body.id;
  }
  
  const path = req.path;
  const parts = path.split('/').filter(Boolean);
  
  for (const part of parts) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part) || /^\d+$/.test(part)) {
      return part;
    }
  }
  
  return null;
}


function getEntityIdFromResponse(data) {
  if (data?.data?.id) return data.data.id;
  if (data?.id) return data.id;
  if (data?.data?.insertId) return data.data.insertId;
  if (data?.insertId) return data.insertId;
  return null;
}


function getEntityName(req, data) {
  if (req.body?.name) return req.body.name;
  if (req.body?.fullName) return req.body.fullName;
  if (req.body?.title) return req.body.title;
  if (req.body?.email) return req.body.email;
  
  if (data?.data?.name) return data.data.name;
  if (data?.data?.fullName) return data.data.fullName;
  if (data?.data?.title) return data.data.title;
  if (data?.data?.email) return data.data.email;
  if (data?.name) return data.name;
  if (data?.fullName) return data.fullName;
  
  return null;
}


function capitalize(str) {
  if (!str) return 'Unknown';
  const clean = str.replace(/-/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export default auditMiddleware;