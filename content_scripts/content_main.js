chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract') {
        const hostname = window.location.hostname;
        let results = [];

        try {
            if (hostname.includes('arxiv.org')) {
                if (typeof window.extractArxiv === 'function') {
                    results = window.extractArxiv();
                } else {
                    console.error("Arxiv extractor not loaded");
                }
            } else if (hostname.includes('sciencedirect.com')) {
                if (typeof window.extractScienceDirect === 'function') {
                    results = window.extractScienceDirect();
                } else {
                    console.error("ScienceDirect extractor not loaded");
                }
            } else if (hostname.includes('dl.acm.org')) {
                if (typeof window.extractACM === 'function') {
                    results = window.extractACM();
                } else {
                    console.error("ACM extractor not loaded");
                }
            } else if (hostname.includes('ieeexplore.ieee.org')) {
                if (typeof window.extractIEEE === 'function') {
                    results = window.extractIEEE();
                } else {
                    console.error("IEEE extractor not loaded");
                }
            } else if (hostname.includes('dblp.org')) {
                if (typeof window.extractDBLP === 'function') {
                    results = window.extractDBLP();
                } else {
                    console.error("DBLP extractor not loaded");
                }
            } else {
                console.log("No extractor available for this domain:", hostname);
            }
        } catch (err) {
            console.error("Error during extraction:", err);
            sendResponse({ success: false, error: err.message });
            return true;
        }

        sendResponse({ success: true, data: results });
    }
    return true;
});
