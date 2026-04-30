const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 10000;
const TARGET = process.env.DATA_SOURCE_ENDPOINT; // مثال: https://lux.shalqam.online:29479

http.createServer((req, res) => {
  try {
    const url = new URL(TARGET);
    
    const options = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: url.hostname }
    };

    const proxy = (url.protocol === 'https:' ? https : http).request(options, (remoteRes) => {
      res.writeHead(remoteRes.statusCode, remoteRes.headers);
      remoteRes.pipe(res);
    });

    proxy.on('error', (err) => {
      console.error('Proxy Error:', err.message);
      res.statusCode = 502;
      res.end('Bad Gateway');
    });

    req.pipe(proxy);
  } catch (err) {
    console.error('URL Parsing Error:', err.message);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
