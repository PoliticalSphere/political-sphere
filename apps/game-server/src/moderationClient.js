/**
 * Moderation Client for Game Server
 * Handles communication with the moderation API
 */

const axios = require('axios');
const { CircuitBreaker } = require('../api/src/error-handler');

class ModerationClient {
  constructor(apiBaseUrl = 'http://localhost:3000/api') {
    this.apiBaseUrl = apiBaseUrl;
    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: 10000, // 10 second timeout
    });

    // Circuit breaker for moderation API calls
    this.circuitBreaker = new CircuitBreaker(5, 60000, 60000); // 5 failures, 1min timeout
  }

  /**
   * Analyze content for moderation
   * @param {string} content - Content to analyze
   * @param {string} type - Content type ('text', 'image', etc.)
   * @param {string} userId - User ID for logging
   * @returns {Promise<Object>} Moderation result
   */
  async analyzeContent(content, type = 'text', userId = null) {
    try {
      const result = await this.circuitBreaker.execute(async () => {
        const response = await this.client.post('/moderation/analyze', {
          content,
          type,
          userId
        });
        return response.data.data;
      });

      return result;
    } catch (error) {
      console.error('Moderation API failed:', error.message);
      // Fail safe - assume unsafe on API failure
      return {
        isSafe: false,
        reasons: ['Moderation service unavailable'],
        category: 'blocked'
      };
    }
  }

  /**
   * Submit a user report
   * @param {Object} report - Report details
   * @returns {Promise<Object>} Report result
   */
  async submitReport(report) {
    try {
      const response = await this.client.post('/moderation/report', report);
      return response.data.data;
    } catch (error) {
      console.error('Report submission error:', error.message);
      throw error;
    }
  }
}

module.exports = new ModerationClient();
