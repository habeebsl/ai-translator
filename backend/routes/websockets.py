import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from prompts.openai_prompts import get_system_prompt
from utils.openai_utils import generate_corrected_transcript
from utils.deepl_utils import translate
from utils.audio_processing import detect_speech


ws_router = APIRouter()

@ws_router.websocket("/transcribe")
async def websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            metadata_message = await websocket.receive_text()
            metadata = json.loads(metadata_message)
            language = metadata.get("language", "en")

            audio_chunk = await websocket.receive_bytes()

            contains_speech = detect_speech(audio_chunk)

            if contains_speech:
                print("Audio Detected")
                text = await generate_corrected_transcript(get_system_prompt(language), audio_chunk, language)
                await websocket.send_json({"message": f" {text}"})
            else:
                print("audio not detected")

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        print(f"An error occurred: {e}")


@ws_router.websocket("/translate")
async def translate_text(websocket: WebSocket):
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

