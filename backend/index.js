import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 8080;

// Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MD Bank API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
  },
  apis: ['./index.js'],
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
/**
 * @swagger
 * /server-status:
 *   get:
 *     description: Returns server status message string
 *     responses:
 *       200:
 *         description: A successful response.
 */
app.get('/server-status', (_, res) => { return res.send('Server is up!') });

/**
 * @swagger
 * /files:
 *   get:
 *     description: Returns list of avaliable files
 *     responses:
 *       200:
 *         description: A successful response.
 */
app.get('/files', (_, res) => {
  try {
    let files = fs.readdirSync('./content/');
    return res.status(200).send(files);
  } catch (e) {
    return res.status(500).send(`Internal server error: ${e}`)
  }
});

/**
 * @swagger
 * /read-file:
 *   get:
 *     description: Returns content of specific file
 *     parameters:
 *       - in: query
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the file to read.
 *     responses:
 *       200:
 *         description: The file content.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad Request. Missing fileName query parameter.
 *       404:
 *         description: File not found.
 *       500:
 *         description: Internal Server Error.
 */
app.get('/read-file', (req, res) => {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).send('Bad Request. Missing fileName query parameter.');
  }

  const contentDir = path.resolve(process.cwd(), 'content');
  const requestedFilePath = path.join(contentDir, fileName);
  if (!requestedFilePath.startsWith(contentDir)) {
    return res.status(403).send('Forbidden: Access denied');
  }

  try {
    const fileContent = fs.readFileSync(requestedFilePath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(fileContent);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return res.status(404).send('File not found.');
    }
    return res.status(500).send(`Internal Server Error: ${e}`);
  }
})

// Server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})
