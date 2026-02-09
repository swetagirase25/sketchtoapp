export async function runAgent(role, input) {
  const res = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: `${role}\n\n${input}` }]
      }]
    })
  });

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}
