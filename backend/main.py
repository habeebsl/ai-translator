from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.routes import api
from routes.websockets import ws_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://ai-translator-beryl.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api, prefix="/api")
app.include_router(ws_router, prefix="/ws")

