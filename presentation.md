# Approaches and Use of Generative AI

## Approaches
### Separation of Backend and Frontend - Communications happen via API requests/response and Websockets.
  **Why?**
  - This approach is more maintainable, especially when api becomes more robust.
  - Cross-Platform Integration: The backend API can be integrated with mobile and desktop apps as well, simplifying the development process for future integrations.
  - Standalone: This way, if the backend crashes, the frontend will not crash with it, and vice versa.
  - Modularity: Reduces cognitive complexity compared to building the frontend and backend together in one app.
 
### API Design:
  WebSockets (For tanslation and transcription):
  - Using WebSockets significantly reduces response times since the connection remains open
  - Queuing Requests: WebSockets handle concurrent requests more efficiently than traditional API requests.
  - Realtime Functionality: WebSockets are better suited for the app's real-time functionality; other methods would be too slow.

### Choice of Models:
- gpt-4o-mini (Transcription Confirmation): Intelligent and cost-effective compared to other OpenAI models.
- Whisper-1 (Speech-to-Text): Very low latency and more cost-effective than the GCP Transcription API.
- TTS-1 (Text-to-Speech): Produces natural, human-like translations, offers voice selection, and is cost-effective.
- DeepL (Translation): Very low latency, highly cost-effective, and leverages AI for accurate translations.
 
### How Generative AI is used:
  1. gpt-40-mini: After the audio has been transcribed by the whisper-1 model, the returned transcription is sent to gpt-4o-mini model for further processing:
  - Checks if medical terminology is spelt correctly.
  - Ensures terms are spelt correctly as well.
 
  2. Deepl: Deepl uses and internal model to check if the translated text is accurate and automatically sends the correct version.
     
    
