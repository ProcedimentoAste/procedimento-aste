// functions/api/auth.js
// Avvia il flusso di login: reindirizza l'utente a GitHub per autorizzare.
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = `${url.origin}/api/callback`;

  const githubAuthUrl =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&scope=repo,user" +
    `&state=${crypto.randomUUID()}`;

  return Response.redirect(githubAuthUrl, 302);
}
