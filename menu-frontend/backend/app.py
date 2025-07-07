
# backend/app.py
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file (for local development)
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all origins for development

# --- Configuration ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
openai_client = None # Initialize as None
if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY environment variable not set. OpenAI client not initialized.")
else:
    try:
        # IMPORTANT: Ensure no 'proxies' or other unexpected arguments are here!
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        print("✅ OpenAI client initialized successfully.")
    except Exception as e:
        print(f"❌ Failed to initialize OpenAI client: {e}")
        openai_client = None

# --- Load Menu Data ---
menu_df = pd.DataFrame() # Initialize as empty DataFrame
try:
    # Assuming final_structured_menu.csv is in the same directory as app.py
    menu_df = pd.read_csv('final_structured_menu.csv')
    # Convert 'is_vegetarian' to boolean (handle potential NaN/missing values gracefully)
    menu_df['is_vegetarian'] = menu_df['is_vegetarian'].astype(str).str.lower().apply(lambda x: True if x == 'yes' else False if x == 'no' else None)
    # Ensure price is numeric
    menu_df['price'] = pd.to_numeric(menu_df['price'], errors='coerce')
    menu_df = menu_df.dropna(subset=['dish_name', 'price']) # Drop rows without essential info

    print("Menu data loaded successfully!")
    print(f"Total dishes: {len(menu_df)}")
except FileNotFoundError:
    print("❌ Error: 'final_structured_menu.csv' not found. Please ensure it's in the 'backend' directory.")
    menu_df = pd.DataFrame() # Keep it empty if file not found
except Exception as e:
    print(f"❌ An error occurred while loading menu data: {e}")
    menu_df = pd.DataFrame() # Keep it empty on other errors


# --- Helper function to filter menu based on preferences ---
def filter_menu(preferences):
    filtered_menu = menu_df.copy()

    if 'spice_level' in preferences and preferences['spice_level']:
        filtered_menu = filtered_menu[
            filtered_menu['spice_level'].astype(str).str.lower() == preferences['spice_level'].lower()
        ]
    if 'is_vegetarian' in preferences and preferences['is_vegetarian'] is not None:
        is_veg_bool = True if str(preferences['is_vegetarian']).lower() == 'yes' else False
        filtered_menu = filtered_menu[
            filtered_menu['is_vegetarian'] == is_veg_bool
        ]
    if 'cuisine_origin' in preferences and preferences['cuisine_origin']:
        filtered_menu = filtered_menu[
            filtered_menu['cuisine_origin'].astype(str).str.lower() == preferences['cuisine_origin'].lower()
        ]
    if 'dish_type' in preferences and preferences['dish_type']:
        filtered_menu = filtered_menu[
            filtered_menu['dish_type'].astype(str).str.lower() == preferences['dish_type'].lower()
        ]
    if 'dish_name' in preferences and preferences['dish_name']:
        # Simple substring search for dish name
        filtered_menu = filtered_menu[
            filtered_menu['dish_name'].astype(str).str.lower().str.contains(preferences['dish_name'].lower())
        ]

    # Sort by price (ascending) or some other criteria
    filtered_menu = filtered_menu.sort_values(by='price', ascending=True)

    return filtered_menu.to_dict(orient='records')


# --- System Prompt for OpenAI ---
SYSTEM_PROMPT = """
You are a witty, professional, and slightly quirky menu-bot for a restaurant called "Social Menu".
Your goal is to help customers find dishes from the provided menu.
Engage in a friendly, helpful, and concise manner.
If a user expresses preferences (e.g., "spicy", "vegetarian", "Indian", "dessert", specific dish names), extract them.
If you identify preferences, respond in a JSON object with 'bot_response' (your witty natural language reply)
and 'preferences' (a JSON object containing extracted preferences).
The 'preferences' object should only contain the keys you identify from:
'spice_level' (mild, medium, hot), 'is_vegetarian' (yes/no), 'cuisine_origin' (e.g., Indian, Continental, Fusion),
'dish_type' (e.g., Main Course, Dessert, Appetizer, Beverage), 'dish_name' (specific dish name if mentioned).
If no clear preference is found, or if you need more information, ask clarifying questions in 'bot_response'
and do NOT include the 'preferences' field, or include an empty 'preferences' object.
Keep the conversation flowing naturally. Limit your initial recommendations to 2-3 dishes.

Example structured response if preferences are found:
{
  "bot_response": "Ah, looking for something with a kick, are we? Let me check our fiery options!",
  "preferences": {
    "spice_level": "hot",
    "is_vegetarian": "no"
  }
}

Example unstructured response if no clear preferences or clarification needed:
{
  "bot_response": "Welcome! What deliciousness are you craving today? Tell me more about your mood!"
}
"""

# --- API Endpoints ---

@app.route('/')
def home():
    return "Menu-Bot Backend is running!"

@app.route('/api/menu/test', methods=['GET'])
def test_menu():
    if not menu_df.empty:
        return jsonify(menu_df.head(3).to_dict(orient='records'))
    return jsonify({"message": "Menu data not loaded or empty."}), 500

@app.route('/api/test-openai', methods=['GET'])
def test_openai():
    if openai_client is None:
        print("Attempted test_openai but client is None.")
        return jsonify({"status": "error", "message": "OpenAI API client not initialized. Check logs for API key issue."}), 503
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello!"}],
            max_tokens=5
        )
        print("✅ test_openai successful.")
        return jsonify({"status": "success", "openai_response": response.choices[0].message.content})
    except Exception as e:
        print(f"❌ OpenAI test error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    if openai_client is None:
        return jsonify({"bot_response": "I'm sorry, my brain (OpenAI) isn't connected right now. Please try again later!", "recommended_dishes": []}), 503

    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"bot_response": "Please send a message!", "recommended_dishes": []}), 400

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]

    try:
        chat_completion = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            response_format={"type": "json_object"}
        )

        openai_response_content = chat_completion.choices[0].message.content
        
        try:
            parsed_openai_response = json.loads(openai_response_content)
            bot_response = parsed_openai_response.get('bot_response', "Hmm, I'm thinking...")
            preferences = parsed_openai_response.get('preferences', {})
            print(f"DEBUG: Extracted preferences from OpenAI: {preferences}")
        except json.JSONDecodeError:
            bot_response = openai_response_content # Fallback if not valid JSON
            preferences = {}

        recommended_dishes = []
        if preferences:
            filtered_dishes = filter_menu(preferences)
            if filtered_dishes:
                recommended_dishes = [
                    {"dish_id": d['dish_id'], "dish_name": d['dish_name'], "price": d['price'], "description": d['description']}
                    for d in filtered_dishes[:3]
                ]
                if not recommended_dishes:
                    bot_response += "\n\nNo dishes matched. Try adjusting preferences?"
            else:
                bot_response += "\n\nI couldn't find any dishes matching those specific preferences. Can I suggest something else, or would you like to refine your choice?"
        else:
            pass # Bot's response from OpenAI handles clarification/no prefs

        return jsonify({
            "bot_response": bot_response,
            "recommended_dishes": recommended_dishes
        })

    except Exception as e:
        print(f"❌ OpenAI chat error: {e}")
        return jsonify({"bot_response": "Sorry, something went wrong with the AI. Please try again later.", "recommended_dishes": []}), 500


@app.route('/api/order/confirm', methods=['POST'])
def confirm_order():
    order_details = request.json
    print(f"🧾 Order received: {order_details}")
    return jsonify({"message": "Order received! (Not yet integrated with accounting)"})


# --- Run ---
if __name__ == '__main__':
    # For local development:
    # In production, use a production-ready WSGI server like Gunicorn (handled by Dockerfile)
    app.run(debug=True, host='0.0.0.0', port=os.environ.get('PORT', 5000))
