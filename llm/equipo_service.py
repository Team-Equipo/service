# This module provides the Lingucidity client with LLM-related services.

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import urllib.parse as up
import random, os
import psycopg2
import uvicorn

from equipo_llm import (
    generate_topics,
    generate_phrases_and_translations,
    TopicGenerationResponse,
    PhraseGenerationResponse,
)

app = FastAPI()


class GenerationRequest(BaseModel):
    topic: str
    destination_country: str
    hobby: str
    food: str


class GenerationResponse(BaseModel):
    userid: int
    topic: str
    originaltext: str
    translatedtext: str
    issaved: bool
    isloading: bool


class UpdateRequest(BaseModel):
    user_id: int
    phrase_id: int


class TopicRequest(BaseModel):
    user_id: int


class TopicalRequest(BaseModel):
    user_id: int
    topic: str


# Connect to the database (ElephantSQL)
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


# Regenerate phrase tied to user_id and phrase_id
def update_phrase(user_id, phrase_id):
    cur = conn.cursor()

    # Get the topic, hobby, food, and destination
    cur.execute(
        """
        SELECT topic, hobby, favoritefood, destination
        FROM useraccount, phrases
        WHERE useraccount.id = %s AND
              phrases.userid = %s AND
              phrases.id = %s
        """,
        (user_id, user_id, phrase_id),
    )
    query = cur.fetchall()[0]

    random_hobby = random.choice(query[1])
    random_food = random.choice(query[2])

    response = PhraseGenerationResponse(phrases=[], translations=[])

    # Keep generating until we get a good response
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

    # Update the phrase in the database
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


# Get topics tied to user_id
def get_topics(user_id):
    cur = conn.cursor()

    # Check if the user is new
    cur.execute(
        """
        SELECT *
        FROM phrases
        WHERE userid = %s
        """,
        (user_id,),
    )

    # If the user is new, generate topics and phrases
    if cur.rowcount == 0:
        # Get the hobby, food, and destination
        cur.execute(
            """
            SELECT hobby, favoritefood, destination
            FROM useraccount
            WHERE id = %s
            """,
            (user_id,),
        )
        query = cur.fetchall()[0]

        random_hobby = random.choice(query[1])
        random_food = random.choice(query[2])

        response = TopicGenerationResponse(topics=[])

        # Keep generating until we get a good response
        while len(response.topics) == 0:
            response = generate_topics(
                GenerationRequest(
                    topic="None",
                    hobby=random_hobby,
                    food=random_food,
                    destination_country=query[2],
                )
            )

        for topic in response.topics:
            # Generate five phrases and translations for each topic
            for i in range(5):
                pgen_response = PhraseGenerationResponse(phrases=[], translations=[])

                # Keep generating until we get a good response
                while (
                    len(pgen_response.phrases) == 0
                    or len(pgen_response.translations) == 0
                    or len(pgen_response.phrases) != len(pgen_response.translations)
                ):
                    pgen_response = generate_phrases_and_translations(
                        GenerationRequest(
                            topic=topic,
                            hobby=random_hobby,
                            food=random_food,
                            destination_country=query[2],
                        )
                    )

                random_index = random.randint(0, len(pgen_response.phrases) - 1)

                # Insert the phrase into the database
                cur.execute(
                    """
                    INSERT INTO phrases (userid, topic, originaltext, translatedtext, issaved, isloading) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        user_id,
                        topic,
                        pgen_response.phrases[random_index],
                        pgen_response.translations[random_index],
                        False,
                        False,
                    ),
                )

                conn.commit()

        return response.topics

    else:
        return None


# Generate five phrases based on user defined topic
def topical_generation(user_id, topic):
    cur = conn.cursor()

    # Get the hobby, food, and destination
    cur.execute(
        """
        SELECT hobby, favoritefood, destination
        FROM useraccount
        WHERE id = %s
        """,
        (user_id,),
    )
    query = cur.fetchall()[0]

    random_hobby = random.choice(query[1])
    random_food = random.choice(query[2])

    original_texts = []
    translated_texts = []

    for i in range(5):
        response = PhraseGenerationResponse(phrases=[], translations=[])

        # Keep generating until we get a good response
        while (
            len(response.phrases) == 0
            or len(response.translations) == 0
            or len(response.phrases) != len(response.translations)
        ):
            response = generate_phrases_and_translations(
                GenerationRequest(
                    topic=topic,
                    hobby=random_hobby,
                    food=random_food,
                    destination_country=query[2],
                )
            )

        random_index = random.randint(0, len(response.phrases) - 1)

        original_texts.append(response.phrases[random_index])
        translated_texts.append(response.translations[random_index])

        # # Insert the phrase into the database
        # cur.execute(
        #     """
        #     INSERT INTO phrases (userid, topic, originaltext, translatedtext, issaved, isloading)
        #     VALUES (%s, %s, %s, %s, %s, %s)
        #     """,
        #     (
        #         user_id,
        #         topic,
        #         response.phrases[random_index],
        #         response.translations[random_index],
        #         False,
        #         False,
        #     ),
        # )

        # conn.commit()

    return [
        GenerationResponse(
            userid=user_id,
            topic=topic,
            originaltext=original_texts[i],
            translatedtext=translated_texts[i],
            issaved=False,
            isloading=False,
        )
        for i in range(5)
    ]


# Endpoint for regenerating phrases
@app.put("/update_phrase")
async def update_phrase_handler(request: UpdateRequest):
    try:
        phrase, translation = update_phrase(request.user_id, request.phrase_id)
        return {"phrase": phrase, "translation": translation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)


# Endpoint for getting topics and generating phrases
@app.get("/get_topics")
async def get_topics_handler(request: TopicRequest):
    try:
        topics = get_topics(request.user_id)
        return {"topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)


# Endpoint for generating phrases based on topic
@app.get("/topical_generation")
async def topical_generation_handler(request: TopicalRequest):
    try:
        return topical_generation(request.user_id, request.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)


if __name__ == "__main__":
    uvicorn.run("equipo_service:app", host="0.0.0.0", port=52409, reload=True)
