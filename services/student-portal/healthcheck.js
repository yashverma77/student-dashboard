const http = require('http');

const port = process.env.PORT || 3000;

const request = http.get(`http://127.0.0.1:${port}/health`, (response) => {
  process.exit(response.statusCode === 200 ? 0 : 1);
});

request.on('error', () => process.exit(1));
request.setTimeout(3000, () => {
  request.destroy();
  process.exit(1);
});
