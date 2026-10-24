
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI, OpenAIError
from pydantic import BaseModel


# ==========================================
# 1. Configuration
# ==========================================

load_dotenv(Path(__file__).parent / ".env")

# Keep this False while OpenAI API credits are unavailable
USE_OPENAI = False

app = FastAPI(title="CowComic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


# ==========================================
# 2. Request Model
# ==========================================

class BookPreferences(BaseModel):
    genres: list[str]
    keyword: str
    ageRating: str
    publishDate: str
    pageCount: str


# ==========================================
# 3. Free Book Recommendations
# ==========================================

BOOKS = {
    "Fantasy": {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "ageRating": "Teen",
        "countryPublished": "United Kingdom",
        "summary": "Bilbo Baggins goes on an unexpected adventure.",
    },
    "Romance": {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "ageRating": "Teen",
        "countryPublished": "United Kingdom",
        "summary": "Elizabeth Bennet discovers love and challenges her first impressions.",
    },
    "Mystery": {
        "title": "The Hound of the Baskervilles",
        "author": "Arthur Conan Doyle",
        "ageRating": "Teen",
        "countryPublished": "United Kingdom",
        "summary": "Sherlock Holmes investigates a mysterious family curse.",
    },
    "Science-Fiction": {
        "title": "The Martian",
        "author": "Andy Weir",
        "ageRating": "Adult",
        "countryPublished": "United States",
        "summary": "An astronaut uses science to survive alone on Mars.",
    },
}


def fallback_recommendation(preferences: BookPreferences):
    for genre in preferences.genres:
        if genre in BOOKS:
            return BOOKS[genre]

    return BOOKS["Fantasy"]


# ==========================================
# 4. OpenAI Recommendations
# ==========================================

def ai_recommendation(preferences: BookPreferences):
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        return fallback_recommendation(preferences)

    try:
        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Recommend one real, published book based on "
                        "the user's preferences. Return only a JSON object "
                        "with these string fields: title, author, ageRating, "
                        "countryPublished, summary. Do not invent books."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Genres: {', '.join(preferences.genres)}\n"
                        f"Keyword: {preferences.keyword}\n"
                        f"Age rating: {preferences.ageRating}\n"
                        f"Publication date: {preferences.publishDate}\n"
                        f"Page count: {preferences.pageCount}"
                    ),
                },
            ],
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    except (OpenAIError, ValueError, TypeError) as error:
        print(f"AI recommendation failed: {type(error).__name__}")
        return fallback_recommendation(preferences)


# ==========================================
# 5. API Endpoints
# ==========================================

@app.get("/")
def home():
    return {"message": "CowComic backend is running!"}


@app.post("/recommend")
def recommend_book(preferences: BookPreferences):
    if USE_OPENAI:
        return ai_recommendation(preferences)

    return fallback_recommendation(preferences)
