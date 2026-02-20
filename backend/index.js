import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 8080;

// Swagger
const swaggerOptions = {
  info: {
    title: 'MD Bank Backend API',
    description: 'API for accessing md files from the server',
  },
  host: `localhost:${PORT}`
};
const outputFile = './swagger-output.json';
const routes = ['./index.js'];

swaggerAutogen()(outputFile, routes, swaggerOptions);
const swaggerFile = JSON.parse(fs.readFileSync('./swagger-output.json'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// API constants
const CONTENT_DIR = path.resolve(process.cwd(), 'content');

// Routes
app.get('/server-status', (_, res) => { return res.send('Server is up!') });

app.get('/files', (_, res) => {
  const files = fs.readdirSync(CONTENT_DIR);
  files.sort((a, b) => {
    return fs.statSync(path.join(CONTENT_DIR, a)).birthtime.getTime() - fs.statSync(path.join(CONTENT_DIR, b)).birthtime.getTime();
  });
  return res.status(200).send(files);
});

app.get('/read-file', (req, res) => {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).send('Bad Request. Missing fileName query parameter.');
  }

  const requestedFilePath = path.join(CONTENT_DIR, fileName);
  if (!requestedFilePath.startsWith(CONTENT_DIR)) {
    return res.status(403).send('Forbidden: Access denied');
  }

  const fileContent = fs.readFileSync(requestedFilePath, 'utf8');
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(fileContent);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  if (err.code === 'ENOENT') {
    return res.status(404).send('File not found');
  }
  return res.status(500).send(`Internal server error: ${err}`);
});

// Server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
