// app/api/logs/route.js

let logs = []; // In-memory storage (not persisted across deployments)

export async function POST(request) {
  try {
    const body = await request.json();
    const timestamp = body.timestamp || new Date().toISOString();
    const alertMessage = body.alert?.signature || "No alert message";
    const summary = `Alert at ${timestamp}: ${alertMessage}`;
    logs.push(summary);

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to process logs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ logs }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
