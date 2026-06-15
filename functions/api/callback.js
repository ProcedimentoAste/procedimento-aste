// functions/api/callback.js
// Riceve il codice da GitHub, lo scambia con un token di accesso,
// e lo passa alla finestra del CMS Decap tramite postMessage.
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Codice di autorizzazione mancante", { status: 400 });
  }

  // Scambia il codice con un access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "procedimento-aste-cms",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      "Errore durante l'autenticazione: " + (tokenData.error_description || "token non ricevuto"),
      { status: 401 }
    );
  }

  const token = tokenData.access_token;

  // Pagina che comunica il token alla finestra principale del CMS e si chiude
  const content = {
    token: token,
    provider: "github",
  };

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Autenticazione completata</title></head>
<body>
<p>Autenticazione completata. Questa finestra si chiuderà automaticamente...</p>
<script>
  (function() {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify(content)}',
        e.origin
      );
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
