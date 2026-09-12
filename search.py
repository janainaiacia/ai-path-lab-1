import json
import numpy as np

from embeddings import embed_text

def load_index():
    image_vectors = np.load("index/embeddings.npy")
    with open("index/paths.json") as f:
        paths = json.load(f)
    return image_vectors, paths

#text_vector - text embed vector, e.g. for a 3-dimensional embedding:
#
#    text_vector = [0.8, 0.2, 0.1]
#
# score = image_vectors @ text_vector - calculate the dot product between the query vector and all image vectors
#
#    row 0:  0.9×0.8 + 0.1×0.2 + 0.2×0.1  =  0.72 + 0.02 + 0.02  =  0.76
#    row 1:  0.1×0.8 + 0.9×0.2 + 0.1×0.1  =  0.08 + 0.18 + 0.01  =  0.27
#    row 2:  0.2×0.8 + 0.1×0.2 + 0.9×0.1  =  0.16 + 0.02 + 0.09  =  0.27
#

def search(text, k=5):   
    # Load the prebuilt index: image vectors + their filenames (same order)
    image_vectors, paths = load_index()

    # Convert the user's text into a vector in the same space as the images
    text_vector = embed_text(text)

    scores = image_vectors @ text_vector

    # argsort gives the positions (index) sorted by score (ascending),
    # [::-1] flips to best-first, [:k] keeps the top k
    top = np.argsort(scores)[::-1][:k]

    return [(paths[i], float(scores[i])) for i in top]

if __name__ == "__main__":
    for path, score in search("a little girl in a pink dress", k=5):
        print(f"{score:.4f}  {path}")