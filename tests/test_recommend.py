
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_romance_recommendation():
    response = client.post(
        "/recommend",
        json={
            "genres": ["Romance"],
            "keyword": "love",
            "ageRating": "Teen",
            "publishDate": "2000",
            "pageCount": "300"
        }
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Pride and Prejudice"
