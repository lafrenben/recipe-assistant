from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from app.chatbot import ChatBotWithHistory
from app.recipechatbot import RecipeChatBot
import json

# Environment variables
load_dotenv()

# Constants
LLM_MODEL = "gpt-4o-mini"
DB_PATH = "db/chatbot_history.db"

# Initialize the database for storing chatbot history
ChatBotWithHistory.initialize_db(DB_PATH)

# Create the FastAPI app
app = FastAPI()

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://localhost",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
def read_root():
    return {"message": "Welcome to the Recipe Bot API"}

def save_chatbot_to_db(chatbot : ChatBotWithHistory):
    print("Saving Chatbot to DB")
    chatbot.save_to_db(DB_PATH)

class RecipeRequest(BaseModel):
    url: str
    annotations: str

@app.post("/api/recipe")
async def get_recipe(request: RecipeRequest, background_tasks: BackgroundTasks):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL parameter is required")

    # Create a new chatbot instance
    chatbot = RecipeChatBot(model=LLM_MODEL)
    background_tasks.add_task(save_chatbot_to_db, chatbot)

    async def stream_generator():
        metadata = json.dumps({"thread_id": chatbot.thread_id})
        yield '[' + metadata + ','
        for chunk in chatbot.extract_recipe(request.url, request.annotations):
            yield chunk
        yield ']'

    return StreamingResponse(stream_generator(), media_type="application/json")


class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat/{thread_id}")
async def chat(request: ChatRequest, thread_id: str, background_tasks: BackgroundTasks):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message parameter is required")

    if not thread_id:
        raise HTTPException(status_code=400, detail="Thread ID parameter is required")

    chatbot = RecipeChatBot.load_from_db(thread_id, DB_PATH)

    if not chatbot:
        raise HTTPException(status_code=404, detail="No chat thread found with that id")

    background_tasks.add_task(save_chatbot_to_db, chatbot)

    async def stream_generator():
        metadata = json.dumps({"thread_id": chatbot.thread_id})
        yield '[' + metadata + ','
        for chunk in chatbot.chat(request.message):
            yield chunk
        yield ']'
    
    return StreamingResponse(stream_generator(), media_type="application/json")


@app.get("/api/chat_history/{thread_id}")
async def chat_history(thread_id: str):
    if not thread_id:
        raise HTTPException(status_code=400, detail="Thread ID parameter is required")
    
    chatbot = RecipeChatBot.load_from_db(thread_id, DB_PATH)

    if not chatbot:
        raise HTTPException(status_code=404, detail="No chat thread found with that id")

    response = {
        "thread_id": chatbot.thread_id,
        "history": chatbot.history[2:],
    }

    return response

# Static files (to serve the frontend react application)
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static-folder") 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)
