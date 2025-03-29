from fastapi import FastAPI, Body, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("dai-chat")

#2
from openai import OpenAI

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

@app.get("/")
def read_root():
    return {"message": "WebSocket server is running. Connect to /chatComplete for chat functionality."}

# Health check endpoint
@app.get("/health")
def health_check():
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    return {"status": "healthy", "api_key_configured": bool(api_key)}

# Store WebSocket connections
connected_clients = set()

# WebSocket route
@app.websocket("/chatComplete") 
async def websocket_endpoint(websocket: WebSocket):
    logger.info("New WebSocket connection attempt")
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    connected_clients.add(websocket)
    
    try:
        while True:
            # Wait for message from client
            data = await websocket.receive_text()
            logger.info("Received message from client")
            
            # Check if this is a simple ping message
            if data == "ping":
                logger.debug("Received simple ping, sending pong response")
                await websocket.send_text("pong")
                continue
                
            try:
                # Parse the message history
                message_history = json.loads(data)
                
                # Check if this is a ping message in JSON format
                if len(message_history) == 1 and message_history[0].get("role") == "ping":
                    logger.debug("Received ping, sending pong response")
                    await websocket.send_text("pong")
                    continue
                
                # Create a copy of the message history and insert the system message at the beginning
                full_message_history = [system_message] + message_history
                
                # Log what we're sending to OpenAI (excluding system message for brevity)
                logger.info(f"Sending to OpenAI: User message: {message_history[-1]['content'] if message_history else 'No messages'}")
                
                # Call OpenAI API
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=full_message_history,
                )
                
                # Extract and send the assistant's reply
                assistant_reply = response.choices[0].message.content
                logger.info(f"Received response from OpenAI: {assistant_reply[:50]}...")  # Log first 50 chars
                
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
        connected_clients.remove(websocket)
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {str(e)}")
        try:
            connected_clients.remove(websocket)
        except:
            pass