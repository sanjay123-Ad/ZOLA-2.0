import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { render } from '../dist/server/entry-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.url || '/';
    
    // Read the built HTML template
    const templatePath = path.resolve(__dirname, '../dist/client/index.html');
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Render the React app
    const appHtml = await render(url);
    
    // Inject the rendered HTML into the template
    const html = template.replace(`<!--ssr-outlet-->`, appHtml);
    
    // Send the response
    res.status(200).setHeader('Content-Type', 'text/html').send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
