import os
import json
import glob
import argparse
import numpy as np
from tqdm import tqdm

from embeddings import embed_image

# Builds the "index": the precomputed search data.
#
# Embeds every image in data/subset/ once via the Gemini API and writes:
#   index/embeddings.npy  - one vector per image, stacked into a (N, dims) array
#   index/paths.json      - the matching filenames, in the SAME order
#
# Row i of the array corresponds to item i of the list. That alignment is the
# only link between the two files — break it and searches return wrong images.
#
# Run once: `python build_index.py --limit 300`
# Refuses to overwrite an existing index; delete index/ to rebuild.

parser = argparse.ArgumentParser()
parser.add_argument("--limit", type=int, default=5)
args = parser.parse_args()

OUT_DIR = "index"
VEC_FILE = os.path.join(OUT_DIR, "embeddings.npy")
PATH_FILE = os.path.join(OUT_DIR, "paths.json")

if os.path.exists(VEC_FILE):
    print(f"{VEC_FILE} already exists. Delete it to rebuild.")
    raise SystemExit

paths = sorted(glob.glob("data/subset/*.jpg"))[: args.limit]
print(f"Embedding {len(paths)} images...")

vectors = []
for p in tqdm(paths):
    vectors.append(embed_image(p))

matrix = np.stack(vectors)

os.makedirs(OUT_DIR, exist_ok=True)
np.save(VEC_FILE, matrix)
with open(PATH_FILE, "w") as f:
    json.dump(paths, f, indent=2)

print(f"Saved {matrix.shape} to {VEC_FILE}")