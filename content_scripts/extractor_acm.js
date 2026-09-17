// ACM extractor
window.extractACM = function () {
    const results = [];
    const items = document.querySelectorAll('li.search__item.issue-item-container');
    const source = 'ACM';

    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    items.forEach(li => {
        let uniqueId = '';
        let articleUrl = '';
        let title = '';

        const titleTag = li.querySelector('.issue-item__title a');
        if (titleTag) {
            title = cleanText(titleTag.textContent);
            const href = titleTag.getAttribute('href');
            if (href) {
                articleUrl = new URL(href, window.location.origin).href;
            }
        }

        let doi = '';
        const doiLink = li.querySelector('.issue-item__doi');
        if (doiLink) {
            const doiUrl = cleanText(doiLink.textContent);
            doi = doiUrl.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
        }

        uniqueId = doi || articleUrl;

        let authorsList = [];
        const authorSpans = li.querySelectorAll('.hlFld-ContribAuthor a span');
        authorSpans.forEach(span => {
            authorsList.push(cleanText(span.textContent));
        });
        const authors = authorsList.join('; ');

        let date = '';
        const dateTag = li.querySelector('.bookPubDate');
        if (dateTag) {
            date = cleanText(dateTag.textContent);
        }

        let venue = '';
        const venueTag = li.querySelector('.epub-section__title');
        if (venueTag) {
            venue = cleanText(venueTag.textContent);
        }

        let abstractText = '';
        const abstractP = li.querySelector('.issue-item__abstract p');
        if (abstractP) {
            const clone = abstractP.cloneNode(true);
            clone.querySelectorAll('.ref, sup').forEach(el => el.remove());
            abstractText = cleanText(clone.textContent);
        }

        let pdfUrl = '';
        const pdfLink = li.querySelector('a[href*="/doi/epdf/"], a[href*="/doi/pdf/"]');
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
