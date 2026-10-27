import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
// Legacy compatibility entrypoint. Authoring and validation live in generate-sr-ai-reading.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const body = await req.json().catch(() => null);
  if (!body?.fullJson) return new Response(JSON.stringify({ error: 'A validated full Solar Return report is required. Regenerate from the current Solar Return page.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-sr-ai-reading`, { method: 'POST', headers: { Authorization: req.headers.get('Authorization') || '', 'Content-Type': 'application/json' }, body: JSON.stringify({ fullJson: body.fullJson, mode: 'plain' }), signal: req.signal });
  return new Response(response.body, { status: response.status, headers: { ...corsHeaders, 'Content-Type': response.headers.get('Content-Type') || 'text/event-stream' } });
});
