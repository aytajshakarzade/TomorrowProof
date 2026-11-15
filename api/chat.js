export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = String(process.env.GROQ_API_KEY || '').trim().replace(/^Bearer\s+/i, '');
  if (!apiKey || /your[_ -]?groq[_ -]?api[_ -]?key/i.test(apiKey)) {
    return res.status(503).json({ error: 'Groq AI is not configured. Put your real Groq key in GROQ_API_KEY in the project-root .env file, then restart Vite.' });
  }

  try {
    const { message, history = [], context = {}, locale = 'en' } = req.body || {};
    const languageName = locale === 'az' ? 'Azerbaijani (Azərbaycan dili)' : locale === 'ru' ? 'Russian (Русский)' : 'English';
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message must be a non-empty string.' });
    }
    if (message.length > 6000) return res.status(413).json({ error: 'Message is too long.' });

    const safeHistory = Array.isArray(history)
      ? history.filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
          .slice(-8).map(item => ({ role: item.role, content: item.content.slice(0, 4000) }))
      : [];
    const safeContext = context && typeof context === 'object' ? JSON.stringify(context).slice(0, 12000) : '{}';
    const system = `You are TOMORROWPROOF AI Copilot, a building-climate decision assistant. Always reply in ${languageName}, the language explicitly selected in the interface, even if the user message or previous conversation is in another language. Stay focused on building climate exposure, material vulnerability screening, laboratory test planning and interpreting this platform's results. Ask for missing building details when necessary. Scientific integrity is mandatory: NASA POWER provides historical gridded observations, not future forecasts or street-level measurements. Clearly separate observed data, user inputs, assumptions, scenarios and recommendations. Never invent measurements, climate projections, standards, citations or test results. The platform's heuristic screening score is not a failure probability, engineering approval, compliance result or certification. Explain uncertainty and recommend validated/downscaled climate projections, building-physics simulation, material datasheets and accredited laboratory testing for formal decisions. Be concise, practical and specific. Project context: ${safeContext}`;

    const requestedModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    // Groq retired llama-3.3-70b-versatile for developer-tier traffic in Aug 2026.
    const primaryModel = requestedModel === 'llama-3.3-70b-versatile' ? 'openai/gpt-oss-120b' : requestedModel;
    const fallbackModel = 'openai/gpt-oss-120b';
    const callModel = async model => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        return await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST', signal: controller.signal,
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, ...safeHistory, { role: 'user', content: message.trim() }], temperature: 0.3, max_tokens: 1100 })
        });
      } finally { clearTimeout(timeout); }
    };
    let upstream = await callModel(primaryModel);
    let payload = await upstream.json().catch(() => ({}));
    const modelUnavailable = !upstream.ok && /model.*(not exist|not found|decommission|no access|unavailable)|model_not_found/i.test(payload?.error?.message || '');
    if (modelUnavailable && primaryModel !== fallbackModel) {
      upstream = await callModel(fallbackModel);
      payload = await upstream.json().catch(() => ({}));
    }
    if (!upstream.ok) {
      const detail = payload?.error?.message || `Groq request failed (${upstream.status}).`;
      const safeMessage = upstream.status === 401 ? 'Groq returned HTTP 401: authentication failed. The server reached Groq, but Groq rejected this key. Create a new key in the Groq console, paste only that Groq key into GROQ_API_KEY in the project-root .env file (not an OpenAI key and not the word Bearer), save, and fully restart Vite. Never share the key in chat or screenshots.' : upstream.status === 429 ? 'Groq rate limit or quota reached. Please retry later or check your Groq account limits.' : detail;
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({ error: safeMessage });
    }
    const reply = payload?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) return res.status(502).json({ error: 'The AI service returned an empty response.' });
    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Groq request timed out. Please try again.' : 'The AI service is temporarily unavailable.';
    return res.status(502).json({ error: message });
  }
}
