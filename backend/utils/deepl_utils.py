import os
import deepl

translator = deepl.Translator(os.getenv("DEEPL_AUTH_KEY"))

async def translate(text: str, source: str, target: str):
    result = translator.translate_text(
        text=text, 
        source_lang=source,
        target_lang=target
    )
    return result.text