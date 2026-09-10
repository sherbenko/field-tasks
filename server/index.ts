import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { syncPayloadSchema } from '../src/types/task';
import type { SyncPayload } from '../src/types/task';
import { mergePayload } from '../src/utils/syncMerge';

const PORT = Number(process.env.PORT ?? 3001);
const DATA_FILE = resolve(process.env.MOCK_DATA_FILE ?? 'server/data.json');
const MAX_BODY_BYTES = 5 * 1024 * 1024;
let data: SyncPayload;
let queue: Promise<void> = Promise.resolve();

function reply(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

async function parseBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error('Request too large.');
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method === 'GET' && request.url === '/health') {
    reply(response, 200, { status: 'ok', candidateCode: 'SA-RN-7842' });
    return;
  }
  if (request.method === 'GET' && (request.url === '/tasks' || request.url === '/history')) {
    reply(response, 200, request.url === '/tasks' ? data.tasks : data.history);
    return;
  }
  if (request.method !== 'POST' || request.url !== '/sync') {
    reply(response, 404, { error: 'Use GET /health, /tasks, /history or POST /sync.' });
    return;
  }
  let incoming: SyncPayload;
  try { incoming = syncPayloadSchema.parse(await parseBody(request)); }
  catch { reply(response, 400, { error: 'Invalid sync payload.' }); return; }
  // Serialize merges and atomic file replacement so parallel clients cannot lose writes.
  const operation = queue.then(async () => {
    const merged = mergePayload(data, incoming);
    await writeFile(`${DATA_FILE}.tmp`, JSON.stringify(merged, null, 2));
    await rename(`${DATA_FILE}.tmp`, DATA_FILE);
    data = merged;
    reply(response, 200, data);
    console.log(`${new Date().toISOString()} sync: ${incoming.tasks.length} tasks, ${incoming.history.length} events`);
  });
  queue = operation.catch(() => undefined);
  await operation;
}

async function main(): Promise<void> {
  try { data = syncPayloadSchema.parse(JSON.parse(await readFile(DATA_FILE, 'utf8'))); }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      data = syncPayloadSchema.parse(JSON.parse(await readFile('server/sample-data.json', 'utf8')));
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } else throw error;
  }
  const server = createServer((request, response) => {
    void handleRequest(request, response).catch(() => {
      if (!response.headersSent) reply(response, 500, { error: 'Could not persist server data.' });
      else response.end();
    });
  });
  server.on('error', error => { console.error('Mock server could not start:', error.message); process.exitCode = 1; });
  server.listen(PORT, '0.0.0.0', () => console.log(`Field Tasks mock REST server listening on port ${PORT}`));
}

void main().catch(error => {
  console.error('Could not open mock server data:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});
