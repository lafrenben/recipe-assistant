from pydantic import BaseModel, Field
from typing import Union, List
from app.chatbot import ChatBotWithHistory, ConversationalResponse
from langchain_community.document_loaders import AsyncHtmlLoader
from langchain_community.document_transformers import Html2TextTransformer

LLM_MODEL = "gpt-4o-mini"

ASSISTANT_PROMPT = """
You are an AI assistant that helps with reading webpages with recipes on them, extracting the recipe information on the page into a structured JSON format, and providing additional conversational assistance to the user who is using the recipe. Make your responses as accurate as possible, and if you are unsure of an answer or parameter, say that you don't know or leave the field blank.

If you are asked to extract a recipe from webpage text, or to make modifications to a recipe you have previously extracted, you should structure your output using the 'RecipeResponse' format. If you are asked questions about the recipe, questions about additional content on the webpage, or questions about cooking in general, you should respond using the 'ConversationalResponse' format.
"""

INITIAL_EXTRACT_PROMPT = """
Extract the recipe JSON from the webpage text below.

When extracting the JSON, apply the following annotations to ingredients and instructions:
{annotation_list}

##WEBPAGE_TEXT_START##
{page_text}
##WEBPAGE_TEXT_END##
"""

class Ingredient(BaseModel):
    """One ingredient in a recipe."""
    quantity: str = Field(description="Quantity or number of units of the ingredient. Can be left blank if a quantity is not specified (e.g., 'salt to taste' or 'black pepper').")
    name: str = Field(description="Name of the ingredient, including any qualifiers like 'chopped' or 'diced' or 'large' or 'freshly ground'. Don't include quantities or units here as they should be in the 'quantity' field.")
    id: str = Field(description="Unique identifier for the ingredient in form '$I1', '$I2', etc.")
    section: str = Field(description="Section or category that the ingredient belongs to, like 'Sauce' or 'Dough'. This is optional, and should only be included if the recipe includes multiple sections in the list of ingredients. Do not use this field for optional ingredients in the recipe, instead use the 'annotations' field.")
    annotations: str = Field(description="Use this field to provide annotations on the ingredient. For example, if the user asks for substitutions or unit conversions, you could provide those details here. Can also be used if the recipe webpage includes annotations like 'optional' on an ingredient.")

class Instruction(BaseModel):
    """One instruction in a recipe."""
    id: str = Field(description="Unique identifier for the instruction in form '$S1', '$S2', etc.")
    text: str = Field(description="A single step in the recipe, extracted from the page text. Follow the structure of the text for cues on how to split the instructions into steps.")
    annotations: str = Field(description="Use this field to provide annotations on the instruction. For example, if the user asks for an estimate of how long each step takes, you could provide those details here. Leave blank when initially extracting the recipe.")

class RecipeResponse(BaseModel):
    """Recipe extracted from a website."""
    name: str = Field(description="Name of the recipe.")
    prep_time: str = Field(description="Preparation time for the recipe, in a human-readable format like '1 hour' or '30 minutes'. Leave blank if preparation time is not specified.")
    cook_time: str = Field(description="Cooking time for the recipe, in a human-readable format like '1 hour' or '30 minutes'. Leave blank if cooking time is not specified.")
    recipe_yield: str = Field(description="Yield of the recipe expressed as a number or a range, like '4 servings' or '2-3 dozen'. Leave blank if the yield of the recipe is not specified.")
    ingredients: List[Ingredient] = Field(description="List of ingredients with quantities.")
    instructions: List[Instruction] = Field(description="Step-by-step instructions to make the recipe.")
    additional_info: str = Field(description="Use this field to provide any additional practical information for preparing the recipe. For example, if the page includes a warning or note about how to correctly make this recipe, provide it here. This field can also be used to supply information requested by the user. Do not use this field for information on individual ingredients or instruction steps -- those should go in the annotations fields instead. You can use Markdown to format lists provided in this field.")

class StructuredResponse(BaseModel):
    type: str = Field(description="The type of 'response' -- either 'RecipeResponse' or 'ConversationalResponse'.")
    response: Union[RecipeResponse, ConversationalResponse]


class RecipeChatBot(ChatBotWithHistory):
    def __init__(self, output_format=StructuredResponse, model=LLM_MODEL):
        super().__init__(output_format, model)
        self.recipe_url = None
        self.page_text = None

    def retrieve_page_text(self, url):
        html2text = Html2TextTransformer()
        loader = AsyncHtmlLoader([url])
        docs = loader.load()
        docs_transformed = html2text.transform_documents(docs)
        page_text = docs_transformed[0].page_content
        return page_text

    def extract_recipe(self, url, annotations=""):
        if url != self.recipe_url or self.page_text is None:
            self.page_text = self.retrieve_page_text(url)
        self.recipe_url = url

        annotation_list = annotations or '(None)'

        self.add_message("developer", ASSISTANT_PROMPT)
        extract_prompt = INITIAL_EXTRACT_PROMPT.format(page_text=self.page_text, annotation_list=annotation_list)
        for chunk in self.stream_response(extract_prompt):
            yield(chunk)

    def chat(self, message):
        for chunk in self.stream_response(message):
            yield(chunk)

