# Image Search

Search 500 photos by describing them in plain language, then ask questions about
any result. Text and images are embedded into the same vector space by the
Gemini API, so a typed query can be compared directly against pictures.

![search results for "a dog running on the beach"](docs/examples/1057251835_6ded4ada9c.jpg)

---

## Setup

All you need is a **Gemini API key** ([aistudio.google.com/apikey](https://aistudio.google.com/apikey) — the free tier is enough).
The images and the index are both in the repo.

```sh
git clone git@github.com:janainaiacia/ai-path-lab-1.git
cd ai-path-lab-1
echo 'GEMINI_API_KEY=your-key-here' > .env
```

**The index is committed.** `images_embedded/` (a 500 × 1536 matrix and the
matching filenames, ~6 MB) ships with the clone, so you do *not* have to embed
anything to try the app — that is the only step that costs API calls, and it is
already paid for. The key above is still needed: every query is embedded at
search time, and Q&A calls a vision model.

**The photos ship too.** The 500 indexed JPEGs live in `data/subset/` (~67 MB) and
come with the clone, under their original Flickr8k filenames — `paths.json` refers
to them by those names, so nothing has to be downloaded or renamed.

<details>
<summary>Building the index yourself</summary>

To do the whole flow from scratch — or to index a different set of images —
delete the shipped index first, since the builder refuses to overwrite one:

```sh
rm -rf images_embedded/
./run.sh build-index --limit 500      # Windows: run.cmd build-index --limit 500
```

That is one API call per image, a few minutes for 500. It writes
`images_embedded/embeddings.npy` (the vectors) and `images_embedded/paths.json`
(the filenames, in the same order — row *i* of the array is item *i* of the
list, and nothing else links the two).
</details>

## Run

```sh
./run.sh              # http://localhost:8000
```

Docker is the only requirement — the script checks for Compose, a running
daemon and `.env` before it starts, and builds the image on first use.

| Command | What it does |
|---|---|
| `./run.sh` | Build if needed, serve on **:8000** |
| `./run.sh build-index` | Embed the images (costs API calls — the repo already ships an index) |

`run.cmd` takes the same arguments on Windows.

<details>
<summary>Running without Docker</summary>

```sh
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm ci && npm run build && cd ..
uvicorn main:app --reload
```

There is also a CLI that skips the browser entirely:

```sh
python -m scripts.search_cli "a dog running on the beach"
```
</details>

---

## Example queries

Real output, top 3 of 500 images, scores are cosine similarity.

### "a dog running on the beach"

| 0.4709 | 0.4677 | 0.4530 |
|---|---|---|
| ![](docs/examples/1057251835_6ded4ada9c.jpg) | ![](docs/examples/140430106_2978fda105.jpg) | ![](docs/examples/1115679311_245eff2f4b.jpg) |

### "two people climbing a rock face"

| 0.4298 | 0.4283 | 0.4157 |
|---|---|---|
| ![](docs/examples/143684568_3c59299bae.jpg) | ![](docs/examples/143680966_0010ff8c60.jpg) | ![](docs/examples/1016887272_03199f49c4.jpg) |

The top hit is a climber on a cliff face with a second person watching from the
summit — close, but not quite the two-climber scene the query asked for. Typical
of the failure mode: the scene is right, the exact count is not.

### "a little girl in a pink dress"

| 0.3830 | 0.3336 | 0.3273 |
|---|---|---|
| ![](docs/examples/1245022983_fb329886dd.jpg) | ![](docs/examples/1248734482_3038218f3b.jpg) | ![](docs/examples/1000268201_693b08cb0e.jpg) |

Note the absolute scores mean little — 0.38 here is a perfect hit, while 0.47
above is merely a good one. Only the ranking within one query is meaningful.

### Q&A on a result (bonus)

Click any result and ask about it. The question and that one image go to a
vision model.

> **Q:** What colour is the girl's skirt?
> **A:** The girl's skirt is pink.
>
> **Q:** Is there a dog in this picture?
> **A:** No, there is no dog in this picture.

---

## Notes on the choices

**Models.** `gemini-embedding-2` at 1536 dimensions for both text and images —
one model for both is the whole trick, since it puts a sentence and a photo in
the same space where a dot product is meaningful. Answering uses
`gemini-3.6-flash`, falling back to `gemini-3.1-flash-lite`: the free tier
returns 503 "high demand" often enough that a single model made the feature feel
broken, and the fallback is a two-line loop.

**Search.** Vectors are normalised at embedding time, which makes a dot
product identical to cosine similarity. Ranking all 500 images is then one
matrix multiply (`images_vectors @ query_vector`) — roughly a millisecond, no
index structure needed.

**Infra.** Embeddings are precomputed once into a `.npy` file and loaded at
startup, not per request, which is the difference between a ~100 ms first load
and a 100× slower search every time. Query embeddings are LRU-cached (256
entries), so repeating a search costs no API call.

Docker Compose runs it, with `data/` and `images_embedded/` mounted at runtime
rather than baked into the image — 1.1 GB of photos in a layer would make every
rebuild painful. The frontend compiles in a separate Node stage and only the
built bundle ships, so the runtime image has no Node in it. FastAPI serves that
bundle from the same origin as the API, which sidesteps CORS entirely.
