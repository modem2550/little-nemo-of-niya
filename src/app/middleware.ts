import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // Handle CORS Preflight requests
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  const response = await next();
  
  // Add CORS and CSP headers to all responses
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  const csp = [
    "default-src 'self' https: http: wss: ws: 'unsafe-inline' 'unsafe-eval' data: blob:",
    "script-src 'self' https: http: 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' https: http: 'unsafe-inline'",
    "img-src 'self' https: http: data: blob:",
    "font-src 'self' https: http: data:",
    "media-src 'self' https: http: data: blob:",
    "manifest-src 'self' https: http:",
    "connect-src 'self' https: http: wss: ws:",
    "frame-src 'self' https: http:"
  ].join("; ");
  response.headers.set('Content-Security-Policy', csp);

  return response;
});
