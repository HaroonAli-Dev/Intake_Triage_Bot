import { IncomingMessage, ServerResponse } from 'http'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Dynamically import the Express app
    const appModule = await import('../src/index')
    const app = appModule.default || appModule

    // Forward the request to the Express app
    return app(req, res)
  } catch (error: any) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      error: 'Failed to load backend entrypoint',
      message: error?.message || String(error),
      stack: error?.stack || null
    }, null, 2))
  }
}
