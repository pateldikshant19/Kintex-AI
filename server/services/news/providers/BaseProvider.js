class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Fetch news based on query/sport
   * @param {string} sport 
   * @returns {Promise<Array>} Array of normalized articles
   */
  async fetchNews(sport) {
    throw new Error('fetchNews() must be implemented by subclass');
  }

  /**
   * Normalize the raw article from the API into the standard format
   * @param {Object} rawArticle
   * @param {string} sport
   * @returns {Object}
   */
  normalizeArticle(rawArticle, sport) {
    throw new Error('normalizeArticle() must be implemented by subclass');
  }
}

module.exports = BaseProvider;
