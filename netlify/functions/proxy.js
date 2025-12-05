// Netlify Function: proxy requests to the Render API to avoid CORS in the browser
// Expects query param `path` with the backend path (e.g. /api/v1/auth/login)
// Environment vars:
// - RENDER_API_BASE_URL (default: https://pizzahub-api.onrender.com)
// - ALLOWED_ORIGIN (optional, e.g. https://pizzahubpwa.netlify.app)

const API_BASE = process.env.RENDER_API_BASE_URL || 'https://pizzahub-api.onrender.com'
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || ''

export const handler = async function (event, context) {
  try {
    const origin = event.headers?.origin || event.headers?.Origin || ''
    if (ALLOWED_ORIGIN && origin && origin !== ALLOWED_ORIGIN) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Origin not allowed' }),
      }
    }

    const qs = event.queryStringParameters || {}
    const path = qs.path || '/'
    const targetUrl = `${API_BASE}${path}`

    const method = event.httpMethod || 'GET'
    const incomingHeaders = event.headers || {}

    // Forward headers but strip hop-by-hop / host/origin
    const headers = {}
    for (const [k, v] of Object.entries(incomingHeaders)) {
      const lower = k.toLowerCase()
      if (['host', 'origin', 'referer'].includes(lower)) continue
      headers[k] = v
    }

    let body = event.body
    if (event.isBase64Encoded && body) {
      body = Buffer.from(body, 'base64')
    }

    const res = await fetch(targetUrl, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : body,
    })

    const responseHeaders = {}
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (['transfer-encoding', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'].includes(lower)) return
      responseHeaders[key] = value
    })

    // Ensure browser can receive response from the function
    responseHeaders['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN || '*'
    responseHeaders['Access-Control-Allow-Credentials'] = 'true'

    const arrayBuffer = await res.arrayBuffer()
    const isBinary = !/charset/i.test(res.headers.get('content-type') || '')

    return {
      statusCode: res.status,
      headers: responseHeaders,
      body: isBinary ? Buffer.from(arrayBuffer).toString('base64') : Buffer.from(arrayBuffer).toString(),
      isBase64Encoded: !!isBinary,
    }
  } catch (err) {
    console.error('Proxy error', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Proxy error', error: String(err) }),
    }
  }
}
