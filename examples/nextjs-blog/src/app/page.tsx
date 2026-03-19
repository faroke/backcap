export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Next.js Blog Example</h1>
      <p>Powered by <strong>Backcap</strong> — capabilities, adapters, and bridges.</p>
      <h2>API Endpoints</h2>
      <ul>
        <li><code>POST /api/posts</code> — Create a blog post</li>
        <li><code>GET /api/posts</code> — List all posts</li>
        <li><code>GET /api/posts/:id</code> — Get a single post</li>
        <li><code>PUT /api/posts/:id/publish</code> — Publish a draft post</li>
        <li><code>GET /api/search?q=...</code> — Search published posts</li>
      </ul>
    </main>
  );
}
