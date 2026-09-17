"""HTTP routes, and the static frontend they're served alongside."""

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import gemini
from .index import ImageIndex

# Vite's default build output. `npm run build` writes it; it is generated,
# never edited by hand, and gitignored.
WEB_DIR = "frontend/dist"


def create_app() -> FastAPI:
    app = FastAPI(title="Image Search")

    # Loaded once at startup (~100 ms, mostly reading the vectors off disk).
    # Doing it per request would make every search 100x slower.
    index = ImageIndex.load()

    @app.get("/api/search")
    def search(query: str, top_k: int):
        hits = index.search(gemini.embed_text(query), top_k)
        # `total` rides along on a request the page already makes, so the UI can
        # say "top 12 of 500" without a second round trip.
        return {
            "total": index.size(),
            "hits": [{"path": hit.path, "score": hit.score} for hit in hits],
        }

    @app.get("/api/ask")
    def ask(image_path: str, question: str):
        # Only images in the index can be asked about — otherwise any path on
        # disk could be handed to the model.
        if not index.contains(image_path):
            raise HTTPException(status_code=404, detail="Unknown image")
        try:
            return {"answer": gemini.answer_about_image(image_path, question)}
        except RuntimeError as e:
            # 503 rather than 500: the free tier is busy, retrying may work.
            raise HTTPException(status_code=503, detail=str(e))

    @app.get("/images/{path:path}")
    def image(path: str):
        # Same guard: a crafted path can't reach the rest of the disk.
        if not index.contains(path):
            raise HTTPException(status_code=404, detail="Unknown image")
        return FileResponse(path)

    # Serve the built UI from the same origin as the API, so there's no CORS.
    # Must stay last: a mount at "/" matches every path and would swallow the
    # routes above.
    app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")

    return app
