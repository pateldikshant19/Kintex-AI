const axios = require('axios');
const BaseProvider = require('./BaseProvider');

class GNewsProvider extends BaseProvider {
  constructor() {
    super('GNews');
    this.apiKey = process.env.GNEWS_API_KEY;
    this.baseUrl = 'https://gnews.io/api/v4/search';
  }

  async fetchNews(sport) {
    if (!this.apiKey) {
      throw new Error('GNEWS_API_KEY is not configured');
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: sport,
          lang: 'en',
          sortby: 'publishedAt',
          apikey: this.apiKey,
          max: 20
        }
      });

      return (response.data.articles || []).map(article => 
        this.normalizeArticle(article, sport)
      );
    } catch (error) {
      throw error;
    }
  }

  normalizeArticle(article, sport) {
    return {
      title: article.title || '',
      content: article.content || article.description || '',
      source: article.source?.name || 'Unknown Source',
      author: article.author || 'Unknown Author', // GNews might not always provide author
      publishedDate: article.publishedAt || new Date().toISOString(),
      url: article.url || '',
      sport: sport,
      processed: false
    };
  }
}

module.exports = GNewsProvider;
