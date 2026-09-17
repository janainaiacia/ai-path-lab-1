"""The prebuilt search data: one vector per image, plus the matching filenames.

Row i of the array corresponds to item i of the list. That alignment is the
only link between the two files — break it and searches return wrong images.
"""

import json
from dataclasses import dataclass

import numpy as np

EMBEDDINGS_DIR = "images_embedded"
VECTORS_FILE = f"{EMBEDDINGS_DIR}/embeddings.npy"
PATHS_FILE = f"{EMBEDDINGS_DIR}/paths.json"


@dataclass(frozen=True)
class SearchHit:
    path: str
    score: float


class ImageIndex:
    def __init__(self, images_vectors: np.ndarray, paths: list[str]):
        self.images_vectors = images_vectors
        self.paths = paths
        self._known = set(paths)

    @classmethod
    def load(cls, vectors_file: str = VECTORS_FILE, paths_file: str = PATHS_FILE):
        vectors = np.load(vectors_file)
        with open(paths_file) as f:
            paths = json.load(f)
        return cls(vectors, paths)

    def search(self, query_vector: np.ndarray, top_k: int) -> list[SearchHit]:
        # One matrix multiply scores every image at once. These are cosine
        # similarities because both sides were normalised when embedded.
        scores = self.images_vectors @ query_vector

        # argsort sorts ascending, [::-1] flips to best-first, [:top_k] trims.
        top = np.argsort(scores)[::-1][:top_k]

        return [SearchHit(self.paths[i], float(scores[i])) for i in top]

    def contains(self, path: str) -> bool:
        return path in self._known

    def size(self) -> int:
        return len(self.paths)
