const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'template.html'), (err, content) => {
            if (err) {
                console.error('Error loading template.html:', err);
                res.writeHead(500);
                res.end('Error loading template.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
                console.log('Served template.html');
            }
        });
    } else if (req.url === '/new-content') {
        fs.readFile(path.join(__dirname, 'new-content.html'), (err, content) => {
            if (err) {
                console.error('Error reading new-content.html:', err);
                res.writeHead(404);
                res.end('No new content');
            } else {
                console.log('Serving new content:', content.toString());
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
                // Clear the new-content.html file after sending
                fs.writeFileSync(path.join(__dirname, 'new-content.html'), '');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});