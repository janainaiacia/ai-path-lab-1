import os
import numpy as np
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

def _embed(contents):
    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=contents,
        config=types.EmbedContentConfig(output_dimensionality=1536), # Dimension must match the index. Change this -> delete index/ and rebuild.
    )
    vec = np.array(result.embeddings[0].values)
    return vec / np.linalg.norm(vec)

def embed_text(text):
    return _embed(text)

def embed_image(path):
    return _embed(Image.open(path))