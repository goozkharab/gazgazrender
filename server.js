const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const TARGET = process.env.DATA_SOURCE_ENDPOINT;

http.createServer((req, res) => {
  const options = {
    hostname: TARGET.replace('https://', '').split('/')[0],
    port: 443,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxy = https.request(options, (remoteRes) => {
    res.writeHead(remoteRes.statusCode, remoteRes.headers);
    remoteRes.pipe(res);
  });

  req.pipe(proxy);
}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));