import argparse
import glob
import json
import os

import numpy as np
from tqdm import tqdm

from image_search import gemini

# Builds the precomputed search data: one embedding per image.
#
# Embeds every image in data/subset/ once via the Gemini API and writes:
#   images_embedded/embeddings.npy  - one vector per image, stacked into (N, dims)
#   images_embedded/paths.json      - the matching filenames, in the SAME order
#
# Row i of the array corresponds to item i of the list. That alignment is the
# only link between the two files — break it and searches return wrong images.
#
# Run once from the project root:  python -m scripts.build_index --limit 500
# Refuses to overwrite existing embeddings; delete images_embedded/ to rebuild.

parser = argparse.ArgumentParser()
parser.add_argument("--limit", type=int, default=5)
args = parser.parse_args()

OUT_DIR = "images_embedded"
VEC_FILE = os.path.join(OUT_DIR, "embeddings.npy")
PATH_FILE = os.path.join(OUT_DIR, "paths.json")

# --- Guard against accidental re-runs ---
# Rebuilding costs one API request per image, so refuse to overwrite
# existing embeddings. Delete images_embedded/ when you actually want to rebuild.
if os.path.exists(VEC_FILE):
    print(f"{VEC_FILE} already exists. Delete it to rebuild.")
    raise SystemExit

# --- Pick the images ---
# sorted() makes the order reproducible across runs and machines (glob's own
# order is not guaranteed). The slice keeps only the first `limit` of them.
paths = sorted(glob.glob("data/subset/*.jpg"))[: args.limit]
print(f"Embedding {len(paths)} images...")

# --- The expensive part: one API call per image ---
# Appending in this loop keeps `vectors` in exactly the same order as `paths`.
vectors = [gemini.embed_image(p) for p in tqdm(paths)]

# A list of N separate (1536,) arrays becomes one (N, 1536) array. That shape
# is what lets search do a single matrix multiply.
matrix = np.stack(vectors)

os.makedirs(OUT_DIR, exist_ok=True)
np.save(VEC_FILE, matrix)
with open(PATH_FILE, "w") as f:
    json.dump(paths, f, indent=2)

print(f"Saved {matrix.shape} to {VEC_FILE}")
