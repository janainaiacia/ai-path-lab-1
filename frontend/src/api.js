// Every call the backend exposes, in one place. Components never build URLs
// themselves, so the API surface stays easy to find and change.

async function request(url) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || res.statusText);
  return body;
}

// Resolves to { total, hits: [{ path, score }] }.
export const search = (query, top_k) =>
  request(`/api/search?query=${encodeURIComponent(query)}&top_k=${top_k}`);

export const ask = (image_path, question) =>
  request(
    `/api/ask?image_path=${encodeURIComponent(image_path)}&question=${encodeURIComponent(question)}`,
  );

// The backend serves originals from /images/<path from the index>.
export const imageUrl = (path) => `/images/${path}`;
