window.extractScienceDirect = function () {
    const results = [];
    const items = document.querySelectorAll('.ResultItem, li[data-aa-name="srp-result-list-item"], .result-item');
    const source = 'ScienceDirect';

    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    items.forEach(item => {
        let title = '';
        let articleUrl = '';

        const titleLink = item.querySelector('a.result-list-title-link, h2 a, .result-list-title h2');
        if (titleLink) {
            title = cleanText(titleLink.textContent);
            if (titleLink.hasAttribute('href')) {
                articleUrl = new URL(titleLink.getAttribute('href'), window.location.origin).href;
            }
        }

        if (!title) return;

        let uniqueId = item.getAttribute('data-doi') || '';
        if (!uniqueId) {
            const idMatch = articleUrl.match(/pii\/([A-Za-z0-9]+)/);
            if (idMatch) {
                uniqueId = idMatch[1];
            } else {
                uniqueId = articleUrl;
            }
        }

        let authors = '';
        const authorElements = item.querySelectorAll('.Authors .author, .author-list .author, .authors-list .author-name');
        if (authorElements.length > 0) {
            const authorNames = Array.from(authorElements).map(el => cleanText(el.textContent)).filter(name => name.length > 0);
            authors = authorNames.join('; ');
        } else {
            const altAuthors = item.querySelector('.author-list, ol.Authors');
            if (altAuthors) {
                const lis = altAuthors.querySelectorAll('li');
                if (lis.length > 0) {
                    authors = Array.from(lis).map(li => cleanText(li.textContent)).join('; ');
                } else {
                    authors = cleanText(altAuthors.textContent);
                }
            }
        }

        let date = '';
        let venue = '';
        const pubInfo = item.querySelector('.SubType, .srctitle-date-fields, .sr-meta-publication, .article-info');
        if (pubInfo) {
            const text = cleanText(pubInfo.textContent);
            const venueTag = pubInfo.querySelector('.subtype-srctitle-link, a');
            if (venueTag) {
                venue = cleanText(venueTag.textContent);
                const spans = pubInfo.querySelectorAll(':scope span');
                for (let span of spans) {
                    const spanText = cleanText(span.textContent);
                    if (spanText && spanText !== venue && !venue.includes(spanText) && spanText.match(/\b(19\d{2}|20\d{2})\b/)) {
                        date = spanText;
                        break;
                    }
                }
                if (!date) {
                    const remaining = text.replace(venue, '').trim();
                    if (remaining.match(/\b(19\d{2}|20\d{2})\b/)) {
                        date = remaining;
                    }
                }
            } else {
                venue = text;
                const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
                if (yearMatch) {
                    date = yearMatch[1];
                }
            }
        }

        let abstractText = '';
        // ScienceDirect doesn't show full abstracts on the search page

        let pdfUrl = '';
        const pdfLink = item.querySelector('a[title*="PDF"], a.pdf-download, a.download-link, a[href*="/pdflink"], a[href*="/pdfft"]');
        if (pdfLink && pdfLink.hasAttribute('href')) {
            pdfUrl = new URL(pdfLink.getAttribute('href'), window.location.origin).href;
        }

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
    });

    return results;
};
