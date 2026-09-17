// arXiv extractor
window.extractArxiv = function () {
    const results = [];
    const items = document.querySelectorAll('li.arxiv-result');
    const source = 'arXiv';

    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    items.forEach(li => {
        let uniqueId = '';
        let arxivId = '';
        let articleUrl = '';

        const titleP = li.querySelector('p.list-title');
        if (titleP) {
            const aTag = titleP.querySelector('a');
            if (aTag) {
                const rawIdText = cleanText(aTag.textContent);
                const idMatch = rawIdText.match(/arxiv:\s*([0-9]+\.[0-9]+(?:v[0-9]+)?)/i);
                if (idMatch) {
                    arxivId = idMatch[1];
                } else {
                    arxivId = rawIdText;
                }

                const href = aTag.getAttribute('href');
                if (href) {
                    articleUrl = new URL(href, window.location.origin).href;
                }
            }
        }

        let doi = '';
        const doiLink = Array.from(li.querySelectorAll('a')).find(a => a.href && a.href.includes('doi.org/'));
        if (doiLink) {
            doi = cleanText(doiLink.textContent);
        }

        uniqueId = doi || arxivId;

        let pdfUrl = '';
        const pdfLink = Array.from(li.querySelectorAll('a')).find(a => a.href && a.href.includes('/pdf/'));
        if (pdfLink) {
            pdfUrl = new URL(pdfLink.getAttribute('href'), window.location.origin).href;
        }

        let title = '';
        const titleTag = li.querySelector('p.title');
        if (titleTag) {
            title = cleanText(titleTag.textContent);
        }

        let authorsList = [];
        const authorsP = li.querySelector('p.authors');
        if (authorsP) {
            authorsP.querySelectorAll('a').forEach(a => {
                authorsList.push(cleanText(a.textContent));
            });
        }
        const authors = authorsList.join('; ');

        let date = '';
        let extraDetails = '';
        li.querySelectorAll('p.is-size-7').forEach(p => {
            const text = cleanText(p.textContent);
            if (text.toLowerCase().includes('submitted')) {
                extraDetails = text;
                const dateMatch = text.match(/submitted\s+([^;]+)/i);
                if (dateMatch) {
                    date = cleanText(dateMatch[1]);
                } else {
                    const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
                    if (yearMatch) {
                        date = yearMatch[1];
                    }
                }
            }
        });

        let venue = '';
        let comments = '';
        li.querySelectorAll('p.comments').forEach(p => {
            const text = cleanText(p.textContent);
            if (text.toLowerCase().startsWith('journal ref:')) {
                venue = cleanText(text.replace(/^journal ref:\s*/i, ''));
            } else if (text.toLowerCase().startsWith('comments:')) {
                comments = cleanText(text.replace(/^comments:\s*/i, ''));
            }
        });

        if (!venue && comments) {
            venue = comments;
        }

        let abstractText = '';
        const abstractP = li.querySelector('p.abstract');
        if (abstractP) {
            const fullSpan = abstractP.querySelector('span.abstract-full');
            const shortSpan = abstractP.querySelector('span.abstract-short');
            const targetSpan = fullSpan || shortSpan;

            if (targetSpan) {
                const clone = targetSpan.cloneNode(true);
                clone.querySelectorAll('a').forEach(a => a.remove());
                abstractText = cleanText(clone.textContent);
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
                Abstract: abstractText,
                'Article URL': articleUrl,
                'PDF URL': pdfUrl,
                'Extra Details': extraDetails
            });
        }
    });

    return results;
};
