import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from prompts.openai_prompts import get_system_prompt
from utils.openai_utils import generate_corrected_transcript
from utils.deepl_utils import translate
from utils.audio_processing import detect_speech


ws_router = APIRouter()

@ws_router.websocket("/transcribe")
async def websocket(websocket: WebSocket):
    """
    Handles real-time audio transcription via WebSocket.
    
    Expects:
    - JSON metadata containing the language (e.g., {"language": "EN"}).
    - Audio buffer (WEBM) in bytes.

    If speech is detected in the audio, a corrected transcript is generated and sent to the frontend.
    """
    await websocket.accept()

    try:
        while True:
            metadata_message = await websocket.receive_text()
            metadata = json.loads(metadata_message)
            language = metadata.get("language", "EN")

            audio_chunk = await websocket.receive_bytes()

            contains_speech = detect_speech(audio_chunk)

            if contains_speech:
                text = await generate_corrected_transcript(get_system_prompt(language), audio_chunk, language)
                await websocket.send_json({"message": f" {text}"})

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        print(f"An error occurred: {e}")


@ws_router.websocket("/translate")
async def translate_text(websocket: WebSocket):
    """
    WebSocket endpoint for real-time text translation.

    Expects a JSON object:
    - text (str): The text to be translated.
    - source_language (str, optional): The original language of the text. Defaults to auto-detection.
    - target_language (str): The language to translate the text into.

    Sends the translated text back to the frontend.
    """
    await websocket.accept()

    try:
        while True:
            json_message = await websocket.receive_text()
            message = json.loads(json_message)

            text = message["text"]
            source = message.get("source_language", "")
            target = message["target_language"]
            translated_text = await translate(text, source, target)
            print(translated_text)
            await websocket.send_json({"message": translated_text})
    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        print(f"An error occurred: {e}")

