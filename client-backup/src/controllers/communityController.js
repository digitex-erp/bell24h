// Mock user activity log
const activityLogs = [];

/**
 * Log user activity in the system
 * @param {number} userId - The ID of the user performing the action
 * @param {string} action - The type of action performed
 * @param {string} description - Description of the activity
 * @param {Object} metadata - Additional metadata about the activity
 * @returns {Promise<Object>} The created activity log entry
 */
export const logActivity = async (userId, action, description, metadata = {}) => {
  const activityLog = {
    id: activityLogs.length + 1,
    userId,
    action,
    description,
    metadata,
    timestamp: new Date().toISOString()
  };
  
  // In a real app, this would be saved to a database
  activityLogs.push(activityLog);
  
  console.log(`Activity logged: ${action} by user ${userId}`);
  
  return activityLog;
};

/**
 * Get activity logs for a specific user
 * @param {number} userId - The ID of the user to get logs for
 * @returns {Promise<Array>} Array of activity logs
 */
export const getUserActivityLogs = async (userId) => {
  return activityLogs.filter(log => log.userId === userId);
};

/**
 * Get all activity logs (admin only)
 * @returns {Promise<Array>} Array of all activity logs
 */
export const getAllActivityLogs = async () => {
  return [...activityLogs];
};
