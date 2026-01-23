const DEFAULT_MODEL = "gemini-2.5-flash-preview-09-2025";

export function getGeminiApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || "";
}

export async function callGemini(prompt, model = DEFAULT_MODEL) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return "Chave da IA não configurada. Adicione VITE_GEMINI_API_KEY no arquivo .env.";
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) throw new Error("Falha na API");

    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Desculpe, não consegui processar sua solicitação no momento."
    );
  } catch (err) {
    console.error("Erro Gemini:", err);
    return "Estou tendo dificuldades técnicas. Tente novamente em instantes.";
  }
}
