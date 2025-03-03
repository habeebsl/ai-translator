# User Guide
This web-based prototype enables real-time, multilingual translation between patients and healthcare providers. It convert spoken input into text, provide a live transcript, and offer a translated version with audio playback.

## Main Features
- **Speak Button**: Click the **Mic** button to enable real-time audio transcription. Click again to turn it off.
- **Language Selector**: Choose a language for both input and output.
- **User Input**: Type directly into the text area for real-time transcription.
- **Clear Input**: Click the **Clear** button to erase the input.
- **Speech Button**: Generate audio from the translated text.  
  **Actions:**  
  - **Play**: Start the generated speech.  
  - **Pause**: Pause playback.

![Components Image](https://github.com/user-attachments/assets/51bcc376-fe8b-469b-b196-abc0bb6bd4c5)

## FAQs & Troubleshooting

### **Translation Timeout**
Possible Causes:
- **Input is too long** → Try reducing the input or refresh the page.  
- **Network Error** → Ensure you have a stable internet connection.  
- **WebSocket Connection Issue (Less common)** → Refresh the page.

General Solution: 
- Clicking the try again button should work in most cases
![Translation Error](https://github.com/user-attachments/assets/051d946e-1046-4c4c-ab2a-be0f4ba36646)

### **Transcription Hallucination**  
(When incorrect words appear in the transcript)  
Possible Solutions:
- **Turn off** the Speak button once transcription is complete.  
- **Reduce background noise** to improve accuracy.  
- **Ensure the correct source language** is selected before speaking.
![Speak Button States](https://github.com/user-attachments/assets/98053ffb-4564-42d7-a188-e253657679aa)

### **Speech Generation Error**  
Possible Causes:
- **Poor internet connection**  
- **Incomprehensible translation** (e.g., text that doesn’t make sense in the target language)  

Possible Solutions:
- **Check your internet connection** for stability.  
- **Ensure your translation is clear and accurate.**  
- **Refresh the page** and try again.
