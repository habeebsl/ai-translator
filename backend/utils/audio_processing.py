import io
import numpy as np
import soundfile as sf
import torch
from pydub import AudioSegment
from silero_vad.model import load_silero_vad
from silero_vad.utils_vad import get_speech_timestamps


model = load_silero_vad()

def detect_speech(audio_bytes):
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="webm")
    wav_io = io.BytesIO()
    audio.export(wav_io, format="wav")
    wav_io.seek(0)
    
    data, samplerate = sf.read(wav_io)
    
    if len(data.shape) > 1:
        data = data.mean(axis=1)

    waveform = torch.tensor(data).unsqueeze(0).float()
    
    target_sample_rate = 16000
    if samplerate != target_sample_rate:
        if not hasattr(torch.nn.functional, 'interpolate'):
            waveform = torch.tensor(np.interp(
                np.linspace(0, len(data), int(len(data) * target_sample_rate / samplerate)),
                np.arange(len(data)),
                data
            )).unsqueeze(0).float()
        else:
            waveform = torch.nn.functional.interpolate(
                waveform.unsqueeze(1),
                size=int(len(data) * target_sample_rate / samplerate),
                mode='linear',
                align_corners=False
            ).squeeze(1)
    
    speech_timestamps = get_speech_timestamps(
        waveform, 
        model, 
        sampling_rate=target_sample_rate,
        threshold=0.4,
        min_speech_duration_ms=250,
        min_silence_duration_ms=500,
        window_size_samples=1024,
        speech_pad_ms=50
    )

    return bool(speech_timestamps)