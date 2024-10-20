import axios from 'axios';

// Example function to fetch sentiment from a news API
export async function analyzeSentiment(tokenId) {
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${tokenId}&apiKey=1f33e974618d444e9d54b46ce5912322`);
        const articles = response.data.articles;
        let positive = 0, negative = 0;

        // Analyze sentiment based on titles (simplified example)
        articles.forEach(article => {
            if (article.title.includes('gain') || article.title.includes('rise')) positive++;
            if (article.title.includes('fall') || article.title.includes('loss')) negative++;
        });

        const sentimentScore = positive - negative;
        console.log(`Sentiment score for ${tokenId}: ${sentimentScore}`);

        return sentimentScore;
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return 0;  // Neutral sentiment if there’s an error
    }
}
