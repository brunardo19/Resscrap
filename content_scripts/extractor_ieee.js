// IEEE Xplore extractor
window.extractIEEE = function () {
    const results = [];
    const items = document.querySelectorAll('div.List-results-items');
    const source = 'IEEE Xplore';

    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    items.forEach(item => {
        const desktopView = item.querySelector('.hide-mobile') || item;

        let uniqueId = '';
        let articleUrl = '';
        let title = '';

        const titleTag = desktopView.querySelector('h3 a');
        if (titleTag) {
            title = cleanText(titleTag.textContent);
            const href = titleTag.getAttribute('href');
            if (href) {
                articleUrl = new URL(href, window.location.origin).href;
                const idMatch = href.match(/\/document\/(\d+)/);
                if (idMatch) {
                    uniqueId = idMatch[1];
                }
            }
        }

        if (!uniqueId) {
            uniqueId = item.id || articleUrl;
        }

        let authorsList = [];
        const authorTags = desktopView.querySelectorAll('xpl-authors-name-list p.author a');
        authorTags.forEach(a => {
            const authorText = cleanText(a.textContent);
            if (authorText) {
                authorsList.push(authorText);
            }
        });
        const authors = [...new Set(authorsList)].join('; ');

        let date = '';
        const publisherInfo = desktopView.querySelector('.publisher-info-container');
        if (publisherInfo) {
            const text = cleanText(publisherInfo.textContent);
            const yearMatch = text.match(/Year:\s*(\d{4})/);
            if (yearMatch) {
                date = yearMatch[1];
            }
        }

        let venue = '';
        const descDiv = desktopView.querySelector('div.description');
        if (descDiv) {
            const venueLink = descDiv.querySelector('a');
            if (venueLink) {
                venue = cleanText(venueLink.textContent);
            }
        }

        let abstractText = '';
        const abstractDiv = desktopView.querySelector('.stats-SearchResults_DocResult_ViewMore span');
        if (abstractDiv) {
            abstractText = cleanText(abstractDiv.textContent);
        }

        let pdfUrl = '';
        const pdfLink = desktopView.querySelector('a[href*="/stamp/stamp.jsp"]');
        if (pdfLink) {
            pdfUrl = new URL(pdfLink.getAttribute('href'), window.location.origin).href;
        }

        if (title) {
            results.push({
                Source: source,
                'In-Platform ID': uniqueId,
                Title: title,
                Authors: authors,
                Date: date,
                Venue: venue,
                Abstract: abstractText,
                'Article URL': articleUrl,
                'PDF URL': pdfUrl,
                'Extra Details': ''
            });
        }
    });

    return results;
};
