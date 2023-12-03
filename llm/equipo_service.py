from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import urllib.parse as up
import random, os
import psycopg2
import uvicorn

from equipo_llm import generate_phrases_and_translations, GenerationResponse

app = FastAPI()


class GenerationRequest(BaseModel):
    topic: str
    destination_country: str
    hobby: str
    food: str


class UpdateRequest(BaseModel):
    user_id: int
    phrase_id: int


load_dotenv()
up.uses_netloc.append("postgres")
url = up.urlparse(os.getenv("ELEPHANT_SQL_URL"))
conn = psycopg2.connect(
    database=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port,
)


def update_phrase(user_id, phrase_id):
    cur = conn.cursor()
    cur.execute(
        """
        SELECT topic, hobby, favoritefood, destination
        FROM useraccount, phrases
        WHERE useraccount.id = %s AND
              phrases.userid = %s AND
              phrases.id = %s
        """,
        (user_id, user_id, user_id, phrase_id),
    )
    query = cur.fetchall()[0]

    random_hobby = random.choice(query[1])
    random_food = random.choice(query[2])

    response = GenerationResponse(phrases=[], translations=[])

    while (
        len(response.phrases) == 0
        or len(response.translations) == 0
        or len(response.phrases) != len(response.translations)
    ):
        response = generate_phrases_and_translations(
            GenerationRequest(
                topic=query[0],
                hobby=random_hobby,
                food=random_food,
                destination_country=query[3],
            )
        )

    random_index = random.randint(0, len(response.phrases) - 1)

    cur.execute(
        """
        UPDATE phrases 
        SET originaltext = %s, 
            translatedtext = %s,
            isloading=false
        WHERE phrases.id = %s
        """,
        (
            response.phrases[random_index],
            response.translations[random_index],
            phrase_id,
        ),
    )
    conn.commit()

    return response.phrases[random_index], response.translations[random_index]


@app.put("/update_phrase")
async def update_phrase_handler(request: UpdateRequest):
    try:
        phrase, translation = update_phrase(request.user_id, request.phrase_id)
        return {"phrase": phrase, "translation": translation}
    except:
        raise HTTPException(status_code=500, detail="Failed to update phrase")


if __name__ == "__main__":
    uvicorn.run("equipo_service:app", host="0.0.0.0", port=52409, reload=True)

# curl -X PUT -H "Content-Type: application/json" -d '{"user_id": "1", "phrase_id": "1"}' http://localhost:52409/update_phrase
