// CSV Generator utility

window.generateCSV = function(data) {
    if (!data || data.length === 0) return;

    const fields = [
        'Source',
        'In-Platform ID',
        'Title',
        'Authors',
        'Date',
        'Venue',
        'Abstract',
        'Article URL',
        'PDF URL',
        'Extra Details'
    ];

    // Create header row
    let csvContent = fields.join(',') + '\n';

    // Create data rows
    for (const row of data) {
        const rowData = fields.map(field => {
            let val = row[field] === undefined || row[field] === null ? '' : row[field].toString();
            
            // Escape quotes by doubling them
            val = val.replace(/"/g, '""');
            
            // Wrap in quotes if it contains comma, newline, or quotes
            if (val.search(/("|,|\n)/g) >= 0) {
                val = `"${val}"`;
            }
            
            return val;
        });
        csvContent += rowData.join(',') + '\n';
    }

    // Add BOM for Excel UTF-8 compatibility
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resscrap_results_${new Date().toISOString().slice(0,10)}.csv`);
    
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
