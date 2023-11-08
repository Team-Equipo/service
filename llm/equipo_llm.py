from langchain.llms import LlamaCpp
from langchain.prompts.chat import ChatPromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from pydantic import BaseModel
import re

model_path = "/home/jk249/service/Llama-2-7b-chat-hf/llama-2-7b-chat-hf.gguf.q4_k_m.bin"

model = LlamaCpp(
    model_path=model_path,
    temperature=1,
    callbacks=[StreamingStdOutCallbackHandler()],
    verbose=False,
)

translation_template = """
<s>[INST] <<SYS>>
You are a helpful English to Spanish translator. Your reponse should be in Spanish. Your reponse should only contain the translation itself.
<</SYS>>

Translate {text} into Spanish [/INST]
"""

translation_prompt = ChatPromptTemplate.from_template(translation_template)
translation_chain = translation_prompt | model

phrase_gen_template = """
<s>[INST] <<SYS>>
You are a list generator. Your reponse should only contain a list of 2 relevant phrases. Do not include any other information.
<</SYS>>

I am visiting {destination_country}. My hobby is {hobby} and my favorite food is {food}. I want relevant phrases about {topic}. [\INST]
"""

phrase_gen_prompt = ChatPromptTemplate.from_template(phrase_gen_template)
phrase_gen_chain = phrase_gen_prompt | model

# phrase_competition_template = """
# <s>[INST] <<SYS>>
# You should give a list of example sentences in Spanish that completes the given phrase.
# <</SYS>>

# {phrase} [\INST]
# """

# phrase_competition_prompt = ChatPromptTemplate.from_template(phrase_competition_template)
# phrase_competition_chain = phrase_competition_prompt | model

# phrase_competition_chain.invoke({"phrase": "¿Qué número de emergencias"})


class GenerationResponse(BaseModel):
    phrases: list
    translations: list


def generate_phrases_and_translations(
    request,
) -> GenerationResponse:
    response = phrase_gen_chain.invoke(
        {
            "topic": request.topic,
            "destination_country": request.destination_country,
            "hobby": request.hobby,
            "food": request.food,
        }
    )

    phrases = [
        m
        for match in re.findall(
            r'\d+\.\s*"([^"]*)|\d+\.\s*(¿[^?]*\?)|\d+\.\s*(¡[^?]*!)', response
        )
        for m in match
        if m
    ]

    translations = re.findall(r"\((.*?)\)", response)

    return GenerationResponse(phrases=phrases, translations=translations)
