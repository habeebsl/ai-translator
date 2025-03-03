import io
import os
from openai import OpenAI
from dotenv import load_dotenv


load_dotenv()
STT_MODEL = 'whisper-1'
TG_MODEL = 'gpt-4o-mini'
FORMAT = 'text'
TEMPERATURE = 0.2
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_corrected_transcript(system_prompt, audio_file, language):
    transcribed_text = await transcribe(audio_file, language)
    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": transcribed_text
        }
    ]
    response = client.chat.completions.create(
        model=TG_MODEL,
        temperature=TEMPERATURE,
        messages=messages,
        response_format={"type": FORMAT}
    )
    print(response.choices[0].message)
    return response.choices[0].message.content

async def transcribe(audio_chunk, language: str):
    audio_buffer = io.BytesIO(audio_chunk)
    audio_buffer.name = "audio.webm"
    response = client.audio.transcriptions.create(
        file=audio_buffer,
        model=STT_MODEL,
        temperature=TEMPERATURE,
        language=language.lower(),
        response_format=FORMAT
    )

    print(response)
    return response

def generate_speech_audio(text, voice="alloy"):
    response = client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text,
    )
    
    audio_data = response.content
    return audio_data