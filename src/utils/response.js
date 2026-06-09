/**
 * Send success response
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    return res.status(statusCode).json(response);
  };
  
  /**
   * Send created response (201)
   */
  export const sendCreated = (res, data = null, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, 201);
  };
  
  /**
   * Send no content response (204)
   */
  export const sendNoContent = (res) => {
    return res.status(204).json();
  };
  
  /**
   * Send error response
   */
  export const sendError = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
  };
  
  /**
   * Pagination helper
   */
  export const paginate = (items, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      items,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  };
  
  /**
   * Format response for list endpoints
   */
  export const sendPaginated = (res, items, total, page, limit, message = 'Success') => {
    const paginatedData = paginate(items, total, page, limit);
    
    return res.status(200).json({
      success: true,
      message,
      data: paginatedData.items,
      pagination: paginatedData.meta,
      timestamp: new Date().toISOString(),
    });
  };
  
  export default {
    sendSuccess,
    sendCreated,
    sendNoContent,
    sendError,
    sendPaginated,
    paginate,
  };