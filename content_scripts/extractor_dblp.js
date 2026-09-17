// DBLP extractor
window.extractDBLP = function () {
    const results = [];
    const items = document.querySelectorAll('li.entry');
    const source = 'DBLP';

    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    items.forEach(item => {
        let uniqueId = item.id || '';
        let articleUrl = '';
        let title = '';

        const titleTag = item.querySelector('.title');
        if (titleTag) {
            title = cleanText(titleTag.textContent);
        }

        let authorsList = [];
        const authorTags = item.querySelectorAll('span[itemprop="author"] span[itemprop="name"]');
        authorTags.forEach(span => {
            authorsList.push(cleanText(span.textContent));
        });
        const authors = authorsList.join('; ');

        let date = '';
        const dateTag = item.querySelector('span[itemprop="datePublished"]');
        if (dateTag) {
            date = cleanText(dateTag.textContent);
        }

        let venue = '';
        const venueTag = item.querySelector('span[itemprop="isPartOf"] span[itemprop="name"]');
        if (venueTag) {
            venue = cleanText(venueTag.textContent);
        } else {
            const publisherTag = item.querySelector('span[itemprop="publisher"]');
            if (publisherTag) {
                venue = cleanText(publisherTag.textContent);
            }
        }

        const eeLink = item.querySelector('li.ee a');
        if (eeLink) {
            articleUrl = eeLink.getAttribute('href');
        } else {
            const persistentUrl = item.querySelector('a[href^="https://dblp.org/rec/"]');
            if (persistentUrl) {
                articleUrl = persistentUrl.getAttribute('href');
            }
        }

        if (title) {
            results.push({
                Source: source,
                'In-Platform ID': uniqueId,
                Title: title,
                Authors: authors,
                Date: date,
                Venue: venue,
                Abstract: '',
                'Article URL': articleUrl,
                'PDF URL': '',
                'Extra Details': ''
            });
        }
    });

    return results;
};
