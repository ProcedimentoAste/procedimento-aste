// functions/api/annunci.js
// Restituisce la lista di tutti gli annunci leggendo direttamente
// la cartella content/annunci/ dal repository GitHub.
// Sostituisce il manifest manuale: pubblichi dal CMS e l'annuncio appare da solo.

export async function onRequest(context) {
  const { env } = context;
  const repo = "ProcedimentoAste/procedimento-aste";
  const path = "content/annunci";
  const branch = "main";

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

  try {
    const headers = {
      "User-Agent": "procedimento-aste-site",
      "Accept": "application/vnd.github.v3+json",
    };
    // Se è impostato un token, lo usa (alza il limite di richieste a GitHub).
    if (env.GITHUB_CLIENT_SECRET) {
      // Token opzionale: non indispensabile per repo pubblici
    }

    const res = await fetch(apiUrl, { headers });
    if (!res.ok) {
      return jsonResponse([], 200); // in caso di errore, lista vuota (il sito non si rompe)
    }

    const files = await res.json();
    // Tiene solo i file .json, costruisce i percorsi nel formato usato dal sito
    const lista = files
      .filter(f => f.type === "file" && f.name.endsWith(".json"))
      .map(f => `content/annunci/${f.name}`);

    return jsonResponse(lista, 200);
  } catch (e) {
    return jsonResponse([], 200);
  }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Cache breve: aggiornamenti visibili entro ~1 minuto, senza martellare GitHub
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
