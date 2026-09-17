import sys

from image_search import gemini
from image_search.index import ImageIndex

# The same search the web UI uses, from the terminal:
#   python -m scripts.search_cli "a little girl in a pink dress"
#
# Run it from the project root: that's what puts image_search on the import
# path, and what makes the relative images_embedded/ and data/ paths resolve.

if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) or "a little girl in a pink dress"
    index = ImageIndex.load()
    for hit in index.search(gemini.embed_text(query), 5):
        print(f"{hit.score:.4f}  {hit.path}")
