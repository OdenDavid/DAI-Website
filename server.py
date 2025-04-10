from fastapi import FastAPI, Body, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import logging
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client
from pydantic import BaseModel, EmailStr
from typing import List

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("dai-chat")

#2
from openai import OpenAI

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

# Dictionary to store user information and chat history per connection
client_data = {}
client_last_activity = {}  # Technical activity (pings, etc.)
client_last_user_activity = {}  # Only actual user interactions
INACTIVITY_TIMEOUT = 15 * 60  # 
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client with API key from environment
api_key = os.getenv('OPEN_AI_API_KEY')
if not api_key:
    logger.warning("OPEN_AI_API_KEY environment variable not set!")

client = OpenAI(api_key=api_key)

# System message that defines the assistant's behavior
system_message = {"role": "system",
             "content": """
                    You are DAI Assistant, a helpful AI representative for Data Assisted Intelligence (DAI). Your purpose is to understand visitors' business challenges or individual workflow problems, and explain how DAI's services could provide solutions.

                    ## Core Information About DAI

                    DAI (Data Assisted Intelligence) helps businesses and individuals leverage data to increase efficiency through:
                    - Custom AI solutions and workflows
                    - Data engineering (ELT) solutions
                    - Workflow automation
                    - AI agent development
                    - Data analysis and visualization

                    ## Your Interaction Style

                    - Be conversational, friendly, and professional
                    - Ask clarifying questions to understand the user's specific challenges
                    - Keep responses concise (1-3 paragraphs maximum)
                    - Focus on understanding problems before suggesting solutions
                    - Demonstrate expertise without being overly technical
                    - Be genuinely curious about the user's situation

                    ## Conversation Flow

                    1. **Welcome the user** and ask about their data challenges or what brought them to DAI
                    2. **Ask targeted follow-up questions** to understand:
                    - Their industry/field
                    - The specific problems they're facing
                    - Current data infrastructure or processes
                    - What they've already tried
                    - Their goals or success metrics
                    3. **Suggest relevant DAI services** based on their specific situation
                    4. **Explain the potential benefits** in concrete, measurable terms
                    5. **Offer to connect them** with the DAI team for a more detailed discussion. Email: hello@dai-solutions.com, Location: San Francisco, CA, Working Hours: Mon - Fri: 9AM - 5PM PST

                    ## Important Guidelines

                    - Never claim to be human
                    - Don't collect sensitive personal information (no credit cards, passwords, etc.)
                    - If you don't understand a question, ask for clarification
                    - If a request falls outside DAI's services, politely explain limitations
                    - Let users know their conversation will be reviewed by the DAI team to provide better assistance
                    - Always end by asking if there's anything else they'd like to know

                    ## Service Matching

                    - **For data pipeline/infrastructure issues**: Suggest DAI's data engineering services
                    - **For repetitive task complaints**: Recommend workflow automation or AI agent development
                    - **For insight/analysis needs**: Propose custom AI solutions with visualization
                    - **For students/individuals**: Focus on personal AI agents to automate mundane tasks
                    - **For unclear needs**: Ask about pain points in their current data usage

                    Remember: Your goal is to have a productive conversation that helps the user understand how DAI could solve their problems, while collecting enough information for the DAI team to follow up effectively.
                    Remember that users are providing their name and email at the start of the conversation. Use their name in your responses to personalize the interaction.
             """
             }

async def save_chat_to_supabase(client_id, conversation_data):
    """
    Save chat history to Supabase
    
    Args:
        client_id: Unique identifier for the client connection
        conversation_data: Dict containing user info and chat history
    """
    try:
        if not conversation_data or not conversation_data.get('messages'):
            logger.warning(f"No chat data to save for client {client_id}")
            return
            
        user_info = conversation_data.get('user_info', {})
        all_messages = conversation_data.get('messages', [])
        
        # Filter out ping messages
        filtered_messages = []
        for msg in all_messages:
            # Skip ping messages or empty messages
            if not msg or not isinstance(msg, dict):
                continue
            
            # Skip messages with role "ping" or that contain "ping" in content
            if msg.get('role') == 'ping' or 'activity_ping' in str(msg.get('content', '')):
                continue
                
            # Add valid messages to our filtered list
            filtered_messages.append(msg)
        
        # Skip if there are no actual messages (only ping messages)
        if not filtered_messages:
            logger.info(f"No meaningful messages to save for client {client_id} (only ping messages found)")
            return
            
        # Extract user details
        name = user_info.get('name', 'Unknown')
        email = user_info.get('email', 'Unknown')
        
        # Log the number of messages being saved
        logger.info(f"Saving {len(filtered_messages)} messages for {name} ({email})")
        
        # Create conversation record
        conversation_record = {
            "user_name": name,
            "user_email": email,
            "started_at": conversation_data.get('started_at', datetime.now().isoformat()),
            "ended_at": datetime.now().isoformat(),
            "messages": json.dumps(filtered_messages)
        }
        
        # Save to Supabase
        result = supabase.table('conversations').insert(conversation_record).execute()
        
        if hasattr(result, 'data') and result.data:
            logger.info(f"Successfully saved chat history for {name} ({email})")
        else:
            logger.warning(f"Failed to save chat history: {result}")
            
    except Exception as e:
        logger.error(f"Error saving chat history to Supabase: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "WebSocket server is running. Connect to /chatComplete for chat functionality."}

# Health check endpoint
@app.get("/health")
def health_check():
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")
    return {"status": "healthy", "api_key_configured": bool(api_key), "supabase_configured": bool(supabase_url and supabase_key)}

# Store WebSocket connections
connected_clients = set()

# WebSocket route
@app.websocket("/chatComplete") 
async def websocket_endpoint(websocket: WebSocket):
    logger.info("New WebSocket connection attempt")
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    
    # Generate a unique client ID
    client_id = id(websocket)
    
    # Initialize client data
    client_data[client_id] = {
        "user_info": {"name": "Unknown", "email": "Unknown"},
        "messages": [],
        "started_at": datetime.now().isoformat()
    }
    
    connected_clients.add(websocket)
    client_last_activity[websocket] = datetime.now()  # Set initial activity timestamp
    client_last_user_activity[websocket] = datetime.now()  # Set initial user activity timestamp
    
    try:
        while True:
            # Wait for message from client
            data = await websocket.receive_text()
            # Update the last activity timestamp
            client_last_activity[websocket] = datetime.now()
            logger.info("Received message from client")
            
            # Check if this is a simple ping message
            if data == "ping":
                logger.debug("Received simple ping, sending pong response")
                await websocket.send_text("pong")
                continue
                
            try:
                # Parse the message data
                parsed_data = json.loads(data)
                
                # Initialize message_history
                message_history = []
                
                # Check if this is a ping message with timestamp or activity_ping
                is_ping_message = False
                
                # Check if this is a ping with isUserActivity flag
                if isinstance(parsed_data, dict) and parsed_data.get("type") == "ping":
                    # If this ping has the isUserActivity flag set to true, update user activity
                    if parsed_data.get("isUserActivity") == True:
                        client_last_user_activity[websocket] = datetime.now()
                        logger.info(f"Updated user activity timestamp from explicit activity ping for client {client_id}")
                    
                    # This is a ping message with timestamp
                    logger.debug("Received ping with timestamp, sending pong response")
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": parsed_data.get("timestamp")}))
                    is_ping_message = True
                    continue
                
                # Check if this is the new format with metadata
                if isinstance(parsed_data, dict) and "metadata" in parsed_data:
                    # Extract metadata and messages separately
                    metadata = parsed_data.get("metadata", {})
                    message_history = parsed_data.get("messages", [])
                    
                    # Update client data with metadata
                    client_data[client_id]["user_info"] = {
                        "name": metadata.get("name", "Unknown"),
                        "email": metadata.get("email", "Unknown")
                    }
                    
                    # Log the received metadata
                    logger.info(f"Received metadata: {metadata}")
                    
                elif isinstance(parsed_data, dict) and "type" in parsed_data and parsed_data["type"] == "ping":
                    # Already handled above
                    continue
                    
                else:
                    # Old format without metadata, assume it's just message history
                    message_history = parsed_data
                
                # Check if this is a ping message in message format
                if (len(message_history) == 1 and message_history[0].get("role") == "ping") or \
                   any(isinstance(msg, dict) and "activity_ping" in str(msg.get("content", "")) for msg in message_history):
                    logger.debug("Received ping in message format, sending pong response")
                    await websocket.send_text("pong")
                    is_ping_message = True
                    continue
                
                # If this is not a ping message, update user activity timestamp
                if not is_ping_message:
                    # Only update user activity for real user messages
                    has_user_message = any(
                        isinstance(msg, dict) and 
                        msg.get("role") == "user" and 
                        msg.get("content") and 
                        "activity_ping" not in str(msg.get("content", ""))
                        for msg in message_history
                    )
                    
                    if has_user_message:
                        client_last_user_activity[websocket] = datetime.now()
                        logger.info(f"Updated user activity timestamp for client {client_id}")
                
                # Filter out ping messages before storing
                if message_history:
                    # Only store non-ping messages
                    real_messages = []
                    for msg in message_history:
                        if isinstance(msg, dict) and msg.get("role") != "ping" and "activity_ping" not in str(msg.get("content", "")):
                            real_messages.append(msg)
                    
                    # Replace client's message history if we have real messages
                    if real_messages:
                        client_data[client_id]["messages"] = real_messages
                
                # Get the last actual user message for processing (skip ping messages)
                last_user_message = None
                for msg in reversed(message_history):
                    if isinstance(msg, dict) and msg.get("role") == "user" and msg.get("content") and "activity_ping" not in str(msg.get("content", "")):
                        last_user_message = msg
                        break
                
                # If no valid user message, don't process
                if not last_user_message:
                    logger.info("No valid user message found, skipping processing")
                    continue
                
                # Create a copy of the message history and insert the system message at the beginning
                full_message_history = [system_message] + [msg for msg in message_history if isinstance(msg, dict) and msg.get("role") != "ping"]
                
                # Log what we're sending to OpenAI (excluding system message for brevity)
                logger.info(f"Sending to OpenAI: User message: {last_user_message.get('content', 'No content')}")
                
                # Call OpenAI API
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=full_message_history,
                )
                
                # Extract and send the assistant's reply
                assistant_reply = response.choices[0].message.content
                logger.info(f"Received response from OpenAI: {assistant_reply[:50]}...")  # Log first 50 chars
                
                # Add the assistant's reply to our stored messages
                client_data[client_id]["messages"].append({
                    "role": "assistant",
                    "content": assistant_reply
                })
                
                # Send the response back to the client
                await websocket.send_text(assistant_reply)
                logger.info("Sent response to client")
                
            except json.JSONDecodeError:
                logger.error("Failed to decode JSON from client")
                await websocket.send_text("Error: Invalid message format. Please send a valid JSON array of messages.")
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                await websocket.send_text(f"Sorry, I encountered an error while processing your message. Please try again later.")
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        # Save chat history to Supabase before cleanup
        await save_chat_to_supabase(client_id, client_data.get(client_id, {}))
        # Clean up
        connected_clients.remove(websocket)
        if websocket in client_last_activity:
            del client_last_activity[websocket]
        if websocket in client_last_user_activity:
            del client_last_user_activity[websocket]
        if client_id in client_data:
            del client_data[client_id]

# Function to check for inactive clients
async def check_inactive_clients():
    logger.info(f"Starting inactive client check with timeout of {INACTIVITY_TIMEOUT} seconds")
    while True:
        now = datetime.now()
        inactive_clients = []
        active_count = 0
        
        # Log counts for debugging
        total_clients = len(connected_clients)
        logger.info(f"Checking {total_clients} connected clients for inactivity")
        
        for ws in connected_clients:
            if ws in client_last_user_activity:
                last_active = client_last_user_activity[ws]
                seconds_inactive = (now - last_active).total_seconds()
                client_id = id(ws)
                
                if seconds_inactive > INACTIVITY_TIMEOUT:
                    inactive_clients.append(ws)
                    logger.info(f"Found inactive client {client_id} - last user activity {seconds_inactive:.1f} seconds ago")
                else:
                    active_count += 1
                    # Only log detailed info when close to timeout to reduce noise
                    if seconds_inactive > (INACTIVITY_TIMEOUT * 0.8):
                        logger.info(f"Client {client_id} still active but getting close to timeout - inactive for {seconds_inactive:.1f} seconds")
        
        if not inactive_clients and total_clients > 0:
            logger.info(f"All {active_count} clients are still active")
        
        for ws in inactive_clients:
            logger.info(f"Closing inactive connection due to {INACTIVITY_TIMEOUT} seconds timeout")
            try:
                # Get client ID for this websocket
                client_id = id(ws)
                user_info = "Unknown"
                if client_id in client_data and client_data[client_id].get("user_info"):
                    user_info = f"{client_data[client_id]['user_info'].get('name')} ({client_data[client_id]['user_info'].get('email')})"
                
                logger.info(f"Saving chat history for inactive client {client_id} - User: {user_info}")
                
                # Save chat history to Supabase before closing
                if client_id in client_data:
                    await save_chat_to_supabase(client_id, client_data.get(client_id, {}))
                    
                # Close the connection
                await ws.close(code=1000, reason="Inactivity timeout")
                logger.info(f"Successfully closed connection for inactive client {client_id}")
                
                # Clean up
                connected_clients.remove(ws)
                if ws in client_last_activity:
                    del client_last_activity[ws]
                if ws in client_last_user_activity:
                    del client_last_user_activity[ws]
                if client_id in client_data:
                    del client_data[client_id]
                logger.info(f"Cleaned up data for inactive client {client_id}")
                
            except Exception as e:
                logger.error(f"Error handling inactive client: {str(e)}")
                # Client might already be disconnected
                pass
        
        # Log summary after processing
        if inactive_clients:
            logger.info(f"Inactivity check complete: Closed {len(inactive_clients)} inactive connections, {len(connected_clients)} connections remaining")
        
        # Check every minute
        await asyncio.sleep(60)

# Start the background task when the app starts
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(check_inactive_clients())

# New model for email subscription
class EmailSubscription(BaseModel):
    email: EmailStr

# Function to save email to Supabase
async def save_email_to_supabase(email: str):
    """
    Save email to Supabase
    
    Args:
        email: Email address to save
    """
    try:
        # Check if the email already exists
        result = supabase.table('subscribers').select('email').eq('email', email).execute()
        
        # If email doesn't exist, insert it
        if not result.data:
            # Insert the new subscriber
            insert_result = supabase.table('subscribers').insert({"email": email}).execute()
            
            if hasattr(insert_result, 'data') and insert_result.data:
                logger.info(f"Saved new subscriber email to Supabase: {email}")
                return True
            else:
                logger.warning(f"Failed to save subscriber to Supabase: {insert_result}")
                return False
        else:
            # Email already exists, consider this a success
            logger.info(f"Email already subscribed: {email}")
            return True
            
    except Exception as e:
        logger.error(f"Error saving email to Supabase: {str(e)}")
        return False

# New route to handle email subscriptions
@app.post("/subscribe")
async def subscribe(subscription: EmailSubscription):
    """
    Handle email subscription
    
    Args:
        subscription: Email subscription data
    """
    try:
        # Save the email to Supabase
        if await save_email_to_supabase(subscription.email):
            return {"status": "success", "message": "Subscription successful"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save subscription")
    except Exception as e:
        logger.error(f"Error in subscribe endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Function to get all subscribers
async def get_all_subscribers() -> List[dict]:
    """
    Get all subscribers from Supabase
    
    Returns:
        List of subscriber records
    """
    try:
        # Query all active subscribers
        result = supabase.table('subscribers').select('*').eq('active', True).execute()
        
        if hasattr(result, 'data'):
            return result.data
        else:
            logger.warning(f"Failed to get subscribers from Supabase: {result}")
            return []
            
    except Exception as e:
        logger.error(f"Error getting subscribers from Supabase: {str(e)}")
        return []

# Endpoint to get all subscribers (admin only - you may want to add authentication)
@app.get("/subscribers")
async def get_subscribers():
    """
    Get all subscribers
    """
    try:
        subscribers = await get_all_subscribers()
        return {"count": len(subscribers), "subscribers": subscribers}
    except Exception as e:
        logger.error(f"Error in get_subscribers endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))