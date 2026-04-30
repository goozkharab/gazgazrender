const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 10000;
const TARGET = process.env.DATA_SOURCE_ENDPOINT; 

// نادیده گرفتن ارورهای گواهی برای تست (اختیاری)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

http.createServer((req, res) => {
  try {
    const url = new URL(TARGET);
    
    const options = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: req.url,
      method: req.method,
      headers: { 
        ...req.headers, 
        'host': url.hostname,
        'connection': 'keep-alive'
      },
      timeout: 30000
    };

    const proxy = (url.protocol === 'https:' ? https : http).request(options, (remoteRes) => {
      res.writeHead(remoteRes.statusCode, remoteRes.headers);
      remoteRes.pipe(res);
    });

    proxy.on('error', (err) => {
      console.error('Proxy Detail Error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end(`Error: ${err.message}`);
      }
    });

    req.pipe(proxy);
  } catch (err) {
    res.writeHead(500);
    res.end('URL Parsing Error');
  }
}).listen(PORT, () => console.log(`Server is UP on port ${PORT}`));
