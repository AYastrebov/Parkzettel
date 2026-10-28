export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

// State-changing API calls must come from our own pages. The cookie is SameSite=Strict already;
// this also rejects cross-site requests from browsers that send an Origin header.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  return !origin || origin === new URL(req.url).origin
}
