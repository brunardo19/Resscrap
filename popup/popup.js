document.addEventListener('DOMContentLoaded', () => {
    const resultsCountEl = document.getElementById('resultsCount');
    const btnExtract = document.getElementById('btnExtract');
    const btnDownload = document.getElementById('btnDownload');
    const btnClear = document.getElementById('btnClear');
    const statusMessage = document.getElementById('statusMessage');

    let currentResults = [];

    const siteStatusEl = document.getElementById('siteStatus');
    const statusTextEl = siteStatusEl.querySelector('.status-text');

    const previewContainer = document.getElementById('previewContainer');
    const previewList = document.getElementById('previewList');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const pageInfo = document.getElementById('pageInfo');

    let currentPage = 1;
    const itemsPerPage = 5;

    // Check active tab site status
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const url = tabs[0].url || '';
            let siteName = '';
            if (url.includes('arxiv.org')) siteName = 'arXiv';
            else if (url.includes('sciencedirect.com')) siteName = 'ScienceDirect';
            else if (url.includes('dl.acm.org')) siteName = 'ACM';
            else if (url.includes('ieeexplore.ieee.org')) siteName = 'IEEE Xplore';
            else if (url.includes('dblp.org')) siteName = 'DBLP';

            if (siteName) {
                siteStatusEl.className = 'site-status ready';
                statusTextEl.textContent = `Ready: ${siteName}`;
                btnExtract.disabled = false;
            } else {
                siteStatusEl.className = 'site-status unsupported';
                statusTextEl.textContent = 'Navigate to a supported search page';
                btnExtract.disabled = true;
            }
        }
    });

    // Load initial data
    chrome.storage.local.get(['extractedResults'], (result) => {
        if (result.extractedResults) {
            currentResults = result.extractedResults;
            updateUI();
        }
    });

    function updateUI() {
        resultsCountEl.textContent = currentResults.length;
        if (currentResults.length > 0) {
            btnDownload.disabled = false;
            btnClear.disabled = false;
        } else {
            btnDownload.disabled = true;
            btnClear.disabled = true;
        }
        renderPreview();
    }

    function renderPreview() {
        if (currentResults.length === 0) {
            previewContainer.style.display = 'none';
            return;
        }

        previewContainer.style.display = 'block';

        const totalPages = Math.ceil(currentResults.length / itemsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;

        previewList.innerHTML = '';

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = currentResults.slice(start, end);

        pageItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'preview-item';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'preview-title';
            titleDiv.textContent = item.Title;
            titleDiv.title = item.Title; // show full title on hover

            const metaDiv = document.createElement('div');
            metaDiv.className = 'preview-meta';

            const sourceSpan = document.createElement('span');
            sourceSpan.textContent = item.Source;

            const dateSpan = document.createElement('span');
            dateSpan.textContent = item.Date || item.Year || '';

            metaDiv.appendChild(sourceSpan);
            metaDiv.appendChild(dateSpan);

            li.appendChild(titleDiv);
            li.appendChild(metaDiv);
            previewList.appendChild(li);
        });
    }

    btnPrev.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPreview();
        }
    });

    btnNext.addEventListener('click', () => {
        const totalPages = Math.ceil(currentResults.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPreview();
        }
    });

    function setStatus(msg, type = '') {
        statusMessage.textContent = msg;
        statusMessage.className = 'status ' + type;
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status';
        }, 3000);
    }

    btnExtract.addEventListener('click', async () => {
        btnExtract.disabled = true;
        setStatus('Extracting...');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                setStatus('No active tab found.', 'error');
                btnExtract.disabled = false;
                return;
            }

            chrome.tabs.sendMessage(tab.id, { action: 'extract' }, (response) => {
                btnExtract.disabled = false;

                if (chrome.runtime.lastError) {
                    setStatus('Cannot extract from this page.', 'error');
                    console.error(chrome.runtime.lastError);
                    return;
                }

                if (response && response.success) {
                    const newData = response.data;
                    if (newData.length === 0) {
                        setStatus('No results found on page.', 'error');
                        return;
                    }

                    // Deduplicate by Title
                    let added = 0;
                    const existingTitles = new Set(currentResults.map(r => r.Title.toLowerCase()));

                    for (const item of newData) {
                        const itemTitle = item.Title ? item.Title.toLowerCase() : '';
                        if (itemTitle && !existingTitles.has(itemTitle)) {
                            currentResults.push(item);
                            existingTitles.add(itemTitle);
                            added++;
                        }
                    }

                    chrome.storage.local.set({ extractedResults: currentResults }, () => {
                        updateUI();
                        if (added > 0) {
                            setStatus(`Extracted ${added} new results!`, 'success');
                        } else {
                            setStatus('No new results found (all duplicates).', 'success');
                        }
                    });
                } else {
                    setStatus('Error extracting data.', 'error');
                }
            });
        } catch (err) {
            btnExtract.disabled = false;
            setStatus('An error occurred.', 'error');
            console.error(err);
        }
    });

    btnClear.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all extracted results?')) {
            currentResults = [];
            chrome.storage.local.set({ extractedResults: [] }, () => {
                updateUI();
                setStatus('Results cleared.', 'success');
            });
        }
    });

    btnDownload.addEventListener('click', () => {
        if (currentResults.length > 0 && window.generateCSV) {
            window.generateCSV(currentResults);
        }
    });
});
