from openai import OpenAI
from pydantic import BaseModel, Field
from typing import Union, List
import uuid
import pickle
import sqlite3

DEFAULT_LLM_MODEL = "gpt-4o-mini"

class ConversationalResponse(BaseModel):
    """Respond in a conversational manner."""
    response: str = Field(description="A conversational response to the user's query.")

class ChatBotWithHistory:
    def __init__(self, output_format=ConversationalResponse, model=DEFAULT_LLM_MODEL):
        self.thread_id = str(uuid.uuid4())
        self.output_format = output_format
        self.model = model
        self.history = []

    def add_message(self, role, content ):
        self.history.append({"role": role, "content": content })

    def get_response(self, user_message):
        self.add_message("user", user_message)
        client = OpenAI()
        completion = client.beta.chat.completions.parse(
            model=self.model,
            messages=self.history,
            response_format=self.output_format
        )
        response_content = completion.choices[0].message.content
        self.add_message("assistant", response_content)
        return response_content

    def stream_response(self, user_message, stream_mode='delta'):
        self.add_message("user", user_message)
        response_content = ""
        client = OpenAI()
        with client.beta.chat.completions.stream(
            model=self.model,
            messages=self.history,
            response_format=self.output_format
        ) as stream:
            delta = ""
            for event in stream:
                if event.type == "content.delta":
                    delta += event.delta
                    if event.parsed is not None: # Only yield a new chunk/partial when JSON can be parsed
                        #print("content.delta parsed")
                        if stream_mode == 'delta':
                            yield delta
                        elif stream_mode == 'partial':
                            yield event.parsed
                        delta = ""
                elif event.type == "content.done":
                    #print("content.done")
                    response_content = event.content
                elif event.type == "error":
                    print("Error in stream:", event.error)
        self.add_message("assistant", response_content)

    def save_to_db(self, db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        data = pickle.dumps(self)
        cursor.execute('''
            INSERT OR REPLACE INTO chatbots (id, data) VALUES (?, ?)
        ''', (self.thread_id, data))
        conn.commit()
        conn.close()

    @staticmethod
    def load_from_db(thread_id, db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT data FROM chatbots WHERE id = ?', (thread_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return pickle.loads(row[0])
        else:
            return None
        
    @staticmethod
    def initialize_db(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chatbots (
                id TEXT PRIMARY KEY,
                data BLOB NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

