from image_search.api import create_app

# Entry point.  Run with:  uvicorn main:app --reload
# then open http://localhost:8000
app = create_app()
