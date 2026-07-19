const axios = require('axios');
const BaseProvider = require('./BaseProvider');

class NewsAPIProvider extends BaseProvider {
  constructor() {
    super('NewsAPI');
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2/everything';
  }

  async fetchNews(sport) {
    if (!this.apiKey) {
      throw new Error('NEWS_API_KEY is not configured');
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: sport,
          language: 'en',
          sortBy: 'publishedAt',
          apiKey: this.apiKey,
          pageSize: 20
        }
      });

      return (response.data.articles || []).map(article => 
        this.normalizeArticle(article, sport)
      );
    } catch (error) {
      // Specifically catch 429 Rate Limit
      if (error.response && error.response.status === 429) {
        const rateLimitError = new Error('NewsAPI Rate limit exceeded (429)');
        rateLimitError.status = 429;
        throw rateLimitError;
      }
      throw error;
    }
  }

  normalizeArticle(article, sport) {
    return {
      title: article.title || '',
      content: article.content || article.description || '',
      source: article.source?.name || 'Unknown Source',
      author: article.author || 'Unknown Author',
      publishedDate: article.publishedAt || new Date().toISOString(),
      url: article.url || '',
      sport: sport,
      processed: false
    };
  }
}

module.exports = NewsAPIProvider;
