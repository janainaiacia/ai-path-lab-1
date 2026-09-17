"""Everything that talks to the Gemini API: embedding text and images, and
answering questions about an image."""

import os
from functools import lru_cache

import numpy as np
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

load_dotenv()

EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSIONS = 1536  # must match the stored vectors; change it and rebuild

# The free tier returns 503 "high demand" fairly often, so try a few models and
# use the first that answers.
ANSWER_MODELS = ["gemini-3.6-flash", "gemini-3.1-flash-lite"]

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def _embed(contents) -> np.ndarray:
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=contents,
        config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS),
    )
    vector = np.array(result.embeddings[0].values)
    # Normalising here is what makes a dot product equal cosine similarity.
    return vector / np.linalg.norm(vector)


# Each call is one API request, so identical queries are embedded only once.
@lru_cache(maxsize=256)
def embed_text(text: str) -> np.ndarray:
    return _embed(text)


def embed_image(path: str) -> np.ndarray:
    return _embed(Image.open(path))


def answer_about_image(path: str, question: str) -> str:
    """Send one image and a question to a model that can actually see it.

    Not cached: questions are free text, so an exact-match cache almost never
    hits — "what colour is the dog" would miss "what color is the dog".
    """
    image = Image.open(path)
    prompt = (
        "Answer the question using only what you can see in this image. "
        "If the image doesn't show it, say so.\n\n"
        f"Question: {question}"
    )

    last_error = None
    for model in ANSWER_MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=[image, prompt],
                # Without a timeout a stalled generation hangs the request.
                config=types.GenerateContentConfig(
                    http_options=types.HttpOptions(timeout=60_000),
                ),
            )
            return response.text
        except Exception as e:  # overloaded, timed out, or model retired
            last_error = e

    raise RuntimeError(
        f"No model could answer (tried {', '.join(ANSWER_MODELS)}): {last_error}"
    )
