const npl = async (query: string) => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}` 
    },
    body: JSON.stringify({ 
      model: 'sonar-reasoning', 
      messages: [{ role: 'user', content: query }] 
    })
  });
  return await response.json();
};

export default npl;
