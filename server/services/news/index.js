const NewsAPIProvider = require('./providers/NewsAPIProvider');
const GNewsProvider = require('./providers/GNewsProvider');
const crypto = require('crypto');

class NewsManager {
  constructor() {
    // Array order determines the fallback priority.
    // Workflow: NewsAPI first, GNews second.
    this.providers = [
      new NewsAPIProvider(),
      new GNewsProvider()
    ];
  }

  /**
   * Generates a unique hash for an article to prevent duplicates
   */
  generateArticleHash(article) {
    // Prevent duplicate articles using title + published date + source
    const rawString = `${article.title}-${article.publishedDate}-${article.source}`;
    return crypto.createHash('md5').update(rawString).digest('hex');
  }

  /**
   * Deduplicates a list of articles based on title + publishedDate + source
   */
  deduplicate(articles) {
    const uniqueMap = new Map();
    
    for (const article of articles) {
      const hash = this.generateArticleHash(article);
      if (!uniqueMap.has(hash)) {
        uniqueMap.set(hash, article);
      }
    }
    
    return Array.from(uniqueMap.values());
  }

  /**
   * Fetch news from the best available provider with fallback
   * @param {string} sport - e.g., 'cricket', 'football'
   * @returns {Promise<Array>} Normalized and deduplicated articles
   */
  async getNews(sport, player = null) {
    let lastError = null;

    for (const provider of this.providers) {
      try {
        console.log(`[NewsManager] Attempting to fetch news via ${provider.name}...`);
        const articles = await provider.fetchNews(sport);
        
        console.log(`[NewsManager] Successfully fetched ${articles.length} articles via ${provider.name}`);
        return this.deduplicate(articles);
        
      } catch (error) {
        lastError = error;
        console.warn(`[NewsManager] Provider ${provider.name} failed:`, error.message);
        
        // If it's NewsAPI and the error is a 429 Rate Limit, we fallback to GNews.
        // We can also fallback on any other error to ensure maximum uptime.
        // The loop simply continues to the next provider.
      }
    }

    // If we exhausted all providers
    console.error('[NewsManager] All news providers failed to fetch news.');
    
    // Return mock data if enabled and player is provided
    if (process.env.ENABLE_MOCK_MEDICAL_DATA === 'true' && player) {
      console.log(`[NewsManager] Returning role-specific mock news for ${player.name}`);
      const position = (player.position || '').toLowerCase();
      let injuryTopic = "muscle soreness";
      
      if (position.includes('bowl')) {
        injuryTopic = "hamstring strain or shoulder workload";
      } else if (position.includes('keep') || position.includes('wicket')) {
        injuryTopic = "knee or finger issues";
      } else if (position.includes('bat')) {
        injuryTopic = "finger fracture or wrist soreness";
      }

      return [
        {
          title: `[DEMO] ${player.name} managing ${injuryTopic} ahead of next match`,
          content: `Team medical staff confirms that ${player.name} is currently dealing with ${injuryTopic}. The situation is being monitored closely.`,
          source: 'Mock Sports News',
          author: 'System Generated',
          publishedDate: new Date().toISOString(),
          url: '#',
          sport: sport,
          processed: false,
          isMockData: true
        }
      ];
    }
    
    // Requirements: "If GNews also fails, return an error without crashing the application."
    // By throwing an error here, the calling route handler (e.g., in Express) 
    // can catch it and return a 500 without crashing the Node.js process.
    const finalError = new Error('Failed to fetch news from all providers');
    finalError.details = lastError ? lastError.message : 'Unknown error';
    throw finalError;
  }
}

module.exports = new NewsManager();
