// Mobile menu functions
function openMenu() {
    document.getElementById('mobileMenu').style.right = "0";
}

function closeMenu() {
    document.getElementById('mobileMenu').style.right = "-16rem";
}

// Global variables
let socket = null;
let messageHistory = [];
let chatInput = null;
let sendMessageBtn = null;
let chatMessages = null;
let connectionStatus = null;
let lastUserActivity = Date.now();
const inactivityTimeout = 15 * 60 * 1000; // 15 minutes in milliseconds
let inactivityTimer = null;
let inactivityWarningTimer = null; // New timer for warning
const inactivityWarningTime = 14 * 60 * 1000; // 14 minutes (1 minute before disconnect)

// Reconnection variables
let reconnectAttempts = 0;
const maxReconnectAttempts = 3;

// When DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for typing animation
    const style = document.createElement('style');
    style.textContent = `
        .typing-animation {
            display: flex;
            align-items: center;
        }
        .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            margin: 0 2px;
            background-color: currentColor;
            border-radius: 50%;
            opacity: 0.6;
        }
        .dot:nth-child(1) {
            animation: pulse 1.2s infinite ease-in-out;
        }
        .dot:nth-child(2) {
            animation: pulse 1.2s infinite ease-in-out 0.4s;
        }
        .dot:nth-child(3) {
            animation: pulse 1.2s infinite ease-in-out 0.8s;
        }
        @keyframes pulse {
            0%, 50%, 100% { opacity: 0.6; transform: scale(1); }
            25% { opacity: 1; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize UI component interactions
    initTabToggles();
    initSmoothScrolling();
    initTestimonialCarousel();
    
    // Initialize chat interface
    initChatInterface();
});

// Function to initialize tab toggles
function initTabToggles() {
    // Services Tab Toggle
    const businessTab = document.getElementById('businessTab');
    const individualTab = document.getElementById('individualTab');
    const businessContent = document.getElementById('businessContent');
    const individualContent = document.getElementById('individualContent');
    
    if (businessTab && individualTab && businessContent && individualContent) {
        businessTab.addEventListener('click', function() {
            // Update tabs
            businessTab.classList.add('bg-[#3E9656]', 'text-white');
            businessTab.classList.remove('text-[#3E9656]');
            individualTab.classList.remove('bg-[#3E9656]', 'text-white');
            individualTab.classList.add('text-[#3E9656]');
            
            // Show/hide content
            businessContent.classList.remove('hidden');
            individualContent.classList.add('hidden');
        });
        
        individualTab.addEventListener('click', function() {
            // Update tabs
            individualTab.classList.add('bg-[#3E9656]', 'text-white');
            individualTab.classList.remove('text-[#3E9656]');
            businessTab.classList.remove('bg-[#3E9656]', 'text-white');
            businessTab.classList.add('text-[#3E9656]');
            
            // Show/hide content
            businessContent.classList.add('hidden');
            individualContent.classList.remove('hidden');
        });
    }
    
    // Case Studies Tab Toggle
    const businessCaseTab = document.getElementById('businessCaseTab');
    const individualCaseTab = document.getElementById('individualCaseTab');
    const businessCaseContent = document.getElementById('businessCaseContent');
    const individualCaseContent = document.getElementById('individualCaseContent');
    
    if (businessCaseTab && individualCaseTab && businessCaseContent && individualCaseContent) {
        businessCaseTab.addEventListener('click', function() {
            // Update tabs
            businessCaseTab.classList.add('bg-[#3E9656]', 'text-white');
            businessCaseTab.classList.remove('text-[#3E9656]');
            individualCaseTab.classList.remove('bg-[#3E9656]', 'text-white');
            individualCaseTab.classList.add('text-[#3E9656]');
            
            // Show/hide content
            businessCaseContent.classList.remove('hidden');
            individualCaseContent.classList.add('hidden');
        });
        
        individualCaseTab.addEventListener('click', function() {
            // Update tabs
            individualCaseTab.classList.add('bg-[#3E9656]', 'text-white');
            individualCaseTab.classList.remove('text-[#3E9656]');
            businessCaseTab.classList.remove('bg-[#3E9656]', 'text-white');
            businessCaseTab.classList.add('text-[#3E9656]');
            
            // Show/hide content
            businessCaseContent.classList.add('hidden');
            individualCaseContent.classList.remove('hidden');
        });
    }
}

// Function to initialize smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for the fixed header
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open on mobile devices
                if (window.innerWidth < 768) {
                    closeMenu();
                }
            }
        });
    });
}

// Function to initialize testimonial carousel
function initTestimonialCarousel() {
    const testimonialCarousel = document.getElementById('testimonialCarousel');
    if (!testimonialCarousel) return;
    
    const slides = testimonialCarousel.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const dots = testimonialCarousel.querySelectorAll('.indicator-dot');
    let currentIndex = 0;
    let autoAdvance;
    
    // Function to update the active slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.add('hidden');
            slide.classList.remove('active');
        });
        
        // Update indicator dots
        dots.forEach(dot => {
            dot.classList.remove('bg-[#3E9656]');
            dot.classList.add('bg-[#3E9656]/30');
        });
        
        // Show the active slide
        slides[index].classList.remove('hidden');
        slides[index].classList.add('active');
        
        // Update the active dot
        dots[index].classList.remove('bg-[#3E9656]/30');
        dots[index].classList.add('bg-[#3E9656]');
        
        // Update current index
        currentIndex = index;
    }
    
    // Previous button click
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = slides.length - 1;
            }
            showSlide(newIndex);
        });
    }
    
    // Next button click
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            let newIndex = currentIndex + 1;
            if (newIndex >= slides.length) {
                newIndex = 0;
            }
            showSlide(newIndex);
        });
    }
    
    // Indicator dot clicks
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
        });
    });
    
    // Swipe functionality for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    testimonialCarousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    testimonialCarousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - show next slide
            let newIndex = currentIndex + 1;
            if (newIndex >= slides.length) {
                newIndex = 0;
            }
            showSlide(newIndex);
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - show previous slide
            let newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = slides.length - 1;
            }
            showSlide(newIndex);
        }
    }
    
    // Function to start auto advance
    function startAutoAdvance() {
        return setInterval(function() {
            let newIndex = currentIndex + 1;
            if (newIndex >= slides.length) {
                newIndex = 0;
            }
            showSlide(newIndex);
        }, 6000);
    }
    
    // Auto-advance the carousel every 6 seconds
    autoAdvance = startAutoAdvance();
    
    // Pause auto-advance when cursor is over the carousel
    testimonialCarousel.addEventListener('mouseenter', function() {
        clearInterval(autoAdvance);
    });
    
    // Resume auto-advance when cursor leaves the carousel
    testimonialCarousel.addEventListener('mouseleave', function() {
        autoAdvance = startAutoAdvance();
    });
    
    // Initialize with the first slide
    showSlide(0);
}

// Function to initialize chat interface
function initChatInterface() {
    // Get DOM elements for chat
    const userForm = document.getElementById('user-form');
    const chatContainer = document.getElementById('chat-container');
    chatInput = document.getElementById('chatInput');
    sendMessageBtn = document.getElementById('sendMessageBtn');
    chatMessages = document.getElementById('chatMessages');
    connectionStatus = document.getElementById('connectionStatus');
    
    // Apply scrollable styling to chat messages container
    if (chatMessages) {
        // Set a fixed height for the chat container to make it scrollable
        chatMessages.style.maxHeight = '400px';
        chatMessages.style.height = '400px';
        chatMessages.style.overflowY = 'auto';
        chatMessages.style.paddingRight = '10px';
        chatMessages.style.display = 'flex';
        chatMessages.style.flexDirection = 'column';
        
        // Add responsive styling based on screen width
        if (window.innerWidth < 768) { // Mobile
            chatMessages.style.height = '300px';
        } else if (window.innerWidth < 1024) { // Tablet
            chatMessages.style.height = '350px';
        } else { // Desktop
            chatMessages.style.height = '400px';
        }
        
        // Apply some padding and spacing
        chatMessages.style.padding = '10px';
        
        console.log('Applied scrollable styling to chat messages container');
        
        // Update height on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth < 768) { // Mobile
                chatMessages.style.height = '300px';
            } else if (window.innerWidth < 1024) { // Tablet
                chatMessages.style.height = '350px';
            } else { // Desktop
                chatMessages.style.height = '400px';
            }
        });
    }
    
    if (chatContainer) {
        // Ensure chat container has proper styling
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
    }
    
    // Debug DOM elements
    console.log('Chat interface DOM elements:');
    console.log('- userForm:', userForm);
    console.log('- chatContainer:', chatContainer);
    console.log('- chatInput:', chatInput);
    console.log('- sendMessageBtn:', sendMessageBtn);
    console.log('- chatMessages:', chatMessages);
    console.log('- connectionStatus:', connectionStatus);
    
    // Chat interface elements (alternative IDs)
    const chatInterface = document.getElementById('chatInterface');
    const userDetailsForm = document.getElementById('userDetailsForm');
    const startChatBtn = document.getElementById('startChatBtn');
    
    // Debug alternative DOM elements
    console.log('Alternative chat interface DOM elements:');
    console.log('- chatInterface:', chatInterface);
    console.log('- userDetailsForm:', userDetailsForm);
    console.log('- startChatBtn:', startChatBtn);
    
    // Handle new form submission
    if (userForm) {
        userForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate form
            const name = document.getElementById('user-name').value.trim();
            const email = document.getElementById('user-email').value.trim();
            const interests = document.getElementById('user-interests').value.trim();
            
            // Basic validation
            if (!name || !email || !interests) {
                alert('Please fill in all fields');
                return;
            }
            
            // Email validation
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Hide form, show chat
            userForm.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            
            // Initialize message history with user info
            messageHistory = [{
                "role": "user",
                "content": `Hello! My name is ${name} and I'm interested in ${interests}.`
            }];
            
            // Initialize WebSocket connection
            initializeWebSocket();
            
            // Focus chat input
            if (chatInput) chatInput.focus();
        });
    }
    
    // Check if we're using the older chat interface
    if (startChatBtn && chatInterface && userDetailsForm) {
        // Start chat button click
        startChatBtn.addEventListener('click', function() {
            const userName = document.getElementById('chat-name').value.trim();
            const userEmail = document.getElementById('chat-email').value.trim();
            
            // Validate required fields
            if (userName === '') {
                alert('Please enter your name to continue.');
                return;
            }
            
            // Email validation
            if (userEmail === '' || !isValidEmail(userEmail)) {
                alert('Please enter a valid email address to continue.');
                return;
            }
            
            // Show loading state
            startChatBtn.disabled = true;
            startChatBtn.innerHTML = '<span class="inline-flex items-center"><span class="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>Connecting...</span>';
            
            // Hide user details form and show chat interface
            userDetailsForm.style.display = 'none';
            chatInterface.style.display = 'flex';
            
            // Initialize message history with user context
            messageHistory = [
                {
                    "role": "user",
                    "content": `Hello! My name is ${userName} and I'd like to learn more about DAI's services.`
                }
            ];
            
            // Initialize WebSocket connection
            initializeWebSocket();
        });
    }
    
    // Send message event listeners
    // For send button
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // For Enter key
    if (chatInput) {
        chatInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }
}

// Function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to update connection status
function updateConnectionStatus(status, isConnected) {
    if (!connectionStatus) {
        console.error('connectionStatus element is null, cannot update status');
        return;
    }
    
    console.log('Updating connection status to:', status, 'isConnected:', isConnected);
    
    if (status === 'connecting') {
        connectionStatus.innerHTML = `
            <span class="inline-flex items-center">
                <span class="animate-pulse w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                Connecting to AI assistant...
            </span>
        `;
    } else if (status === 'reconnecting') {
        connectionStatus.innerHTML = `
            <span class="inline-flex items-center">
                <span class="animate-pulse w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                Reconnecting to AI assistant...
            </span>
        `;
    } else if (status === 'connected') {
        console.log('Connection status changed to CONNECTED');
        connectionStatus.innerHTML = `
            <span class="inline-flex items-center">
                <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Connected to AI assistant
            </span>
        `;
        
        // Enable chat controls
        if (chatInput) chatInput.disabled = false;
        if (sendMessageBtn) sendMessageBtn.disabled = false;
        
        // No longer add a welcome message here since server will send one
        // Just log that we're ready for the server message
        console.log('Connection ready, waiting for server response');
        
        // Hide status after 5 seconds
        setTimeout(() => {
            connectionStatus.style.display = 'none';
        }, 5000);
    } else if (status === 'error') {
        connectionStatus.innerHTML = `
            <span class="inline-flex items-center">
                <span class="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                Connection error. Please refresh the page to try again.
            </span>
        `;
        
        // Disable chat controls
        if (chatInput) chatInput.disabled = true;
        if (sendMessageBtn) sendMessageBtn.disabled = true;
    } else if (status === 'disconnected') {
        connectionStatus.innerHTML = `
            <span class="inline-flex items-center">
                <span class="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                Disconnected. Please refresh the page to reconnect.
            </span>
        `;
        
        // Disable chat controls
        if (chatInput) chatInput.disabled = true;
        if (sendMessageBtn) sendMessageBtn.disabled = true;
    }
}

// Function to initialize WebSocket connection
function initializeWebSocket() {
    // Only attempt reconnection up to a limit
    if (reconnectAttempts >= maxReconnectAttempts) {
        console.error(`Maximum reconnection attempts (${maxReconnectAttempts}) reached.`);
        updateConnectionStatus('error');
        addMessage('system', 'Unable to establish a stable connection with the assistant. Please check your internet connection or try again later.');
        return; 
    }
    
    // Update connection status
    updateConnectionStatus(reconnectAttempts > 0 ? 'reconnecting' : 'connecting');
    
    // Simply use the secure WebSocket URL - this was working before
    const wsUrl = `wss://dai-live.onrender.com/chatComplete`;
    
    // Log the WebSocket URL for debugging
    console.log(`Connecting to WebSocket server at: ${wsUrl} (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts + 1})`);
    
    try {
        // Close previous socket if it exists
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            console.log('Closing existing socket connection');
            socket.close();
        }
        
        // Create new WebSocket connection
        socket = new WebSocket(wsUrl);
        
        // Set up connection timeout
        const connectionTimeout = setTimeout(() => {
            if (socket && socket.readyState !== WebSocket.OPEN) {
                console.error('WebSocket connection timed out');
                socket.close();
                reconnectAttempts++;
                initializeWebSocket(); // Try to reconnect
            }
        }, 5000); // 5 second timeout
        
        // Connection opened
        socket.addEventListener('open', (event) => {
            console.log('WebSocket connection established successfully');
            clearTimeout(connectionTimeout);
            reconnectAttempts = 0; // Reset reconnect counter on successful connection
            updateConnectionStatus('connected', true);
            
            // Get user metadata from the form if available
            const userName = document.getElementById('user-name')?.value || 
                             document.getElementById('chat-name')?.value || 
                             'Unknown';
            
            const userEmail = document.getElementById('user-email')?.value || 
                              document.getElementById('chat-email')?.value || 
                              'Unknown';
            
            // Add user metadata to the first message
            const userMetadata = {
                name: userName,
                email: userEmail
            };
            
            // Send the message history immediately to initiate the conversation
            if (messageHistory.length > 0) {
                console.log('Sending initial message history with user metadata:', messageHistory);
                try {
                    // Ensure proper JSON formatting with metadata
                    socket.send(JSON.stringify({
                        messages: messageHistory,
                        metadata: userMetadata
                    }));
                } catch (err) {
                    console.error('Error sending initial message:', err);
                }
            }
            
            // Set up inactivity tracking
            setupActivityTracking();
            
            // Set up a ping interval to keep the connection alive
            const pingInterval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    console.log('Sending ping to keep connection alive');
                    socket.send(JSON.stringify({
                        type: "ping",
                        timestamp: Date.now()
                    }));
                } else {
                    clearInterval(pingInterval);
                }
            }, 30000); // Ping every 30 seconds
        });
        
        // Listen for messages
        socket.addEventListener('message', (event) => {
            const response = event.data;
            console.log('Received message from server:', response);
            
            try {
                // Try parsing as JSON first
                const parsedResponse = JSON.parse(response);
                
                // Filter out ping/pong messages
                if (parsedResponse.type === "pong" || parsedResponse.type === "ping") {
                    console.log('Received ping/pong response, not displaying in chat');
                    return; // Don't display ping/pong responses
                }
                
                if (parsedResponse.message) {
                    // This is a structured response with possible metadata
                    addMessage('ai', parsedResponse.message);
                    
                    // Store message in history
                    messageHistory.push({
                        "role": "assistant",
                        "content": parsedResponse.message
                    });
                } else if (!parsedResponse.type) {
                    // Handle plain text response that was JSON but not a ping/pong
                    addMessage('ai', response);
                    
                    // Store message in history
                    messageHistory.push({
                        "role": "assistant",
                        "content": response
                    });
                }
            } catch (e) {
                // Not JSON or parsing failed, check if it's a plain text ping/pong
                if (response === "pong" || response.includes("ping")) {
                    console.log('Received plain ping/pong response');
                    return; // Don't display ping responses
                }
                
                // Regular message
                addMessage('ai', response);
                
                // Store message in history
                messageHistory.push({
                    "role": "assistant",
                    "content": response
                });
            }
            
            // Remove typing indicator if it exists
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator && chatMessages) {
                chatMessages.removeChild(typingIndicator);
            }
            
            // Re-enable input if it was disabled
            if (chatInput) chatInput.disabled = false;
            if (sendMessageBtn) sendMessageBtn.disabled = false;
            if (chatInput) chatInput.focus();
            
            // Scroll to the bottom
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            
            console.log('Message added successfully, UI updated');
        });
        
        // Handle errors
        socket.addEventListener('error', (event) => {
            console.error('WebSocket error occurred:', event);
            clearTimeout(connectionTimeout);
            // The close event will handle reconnection
        });
        
        // Connection closed
        socket.addEventListener('close', (event) => {
            clearTimeout(connectionTimeout);
            console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}, Clean: ${event.wasClean}`);
            
            if (event.wasClean) {
                console.log('Connection closed cleanly');
                updateConnectionStatus('disconnected');
            } else {
                console.error(`Connection closed unexpectedly with code ${event.code}`);
                
                // If the connection was immediately closed or never established
                if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
                    
                    // Add a slight delay before reconnecting, with increasing backoff
                    const backoffDelay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000);
                    console.log(`Reconnecting in ${backoffDelay}ms...`);
                    
                    setTimeout(() => {
                        initializeWebSocket();
                    }, backoffDelay);
                } else {
                    // If we've reached max reconnect attempts
                    updateConnectionStatus('error');
                    addMessage('system', `Unable to establish a connection. The server might be unavailable. Please try again later.`);
                }
            }
        });
    } catch (err) {
        console.error('Failed to create WebSocket connection:', err);
        updateConnectionStatus('error');
        addMessage('system', 'Failed to create connection. Please check your internet connection and try again.');
    }
}

// Function to initialize the inactivity timer
function startInactivityTimer() {
    // Clear any existing timers first
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (inactivityWarningTimer) clearTimeout(inactivityWarningTimer);
    
    // Set a warning timer first (1 minute before disconnect)
    inactivityWarningTimer = setTimeout(() => {
        console.log('Showing inactivity warning');
        // Show a warning to the user
        addMessage('system', 'You have been inactive for some time. Your session will be disconnected in 1 minute due to inactivity. Type a message to stay connected.');
        // Scroll to bottom to ensure warning is visible
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }, inactivityWarningTime);
    
    // Set the main inactivity timer
    inactivityTimer = setTimeout(() => {
        console.log('Closing connection due to inactivity');
        if (socket && socket.readyState === WebSocket.OPEN) {
            addMessage('system', 'Connection closed due to inactivity.');
            socket.close(1000, 'Inactivity timeout');
        }
    }, inactivityTimeout);
}

// Function to reset the inactivity timer
function resetInactivityTimer() {
    const now = new Date();
    const previousActivity = new Date(lastUserActivity);
    const timeSinceLastActivity = now - previousActivity;
    
    // Log activity only if significant time has passed (more than 1 minute)
    if (timeSinceLastActivity > 60000) {
        console.log(`User activity detected after ${Math.round(timeSinceLastActivity/1000)} seconds of inactivity`);
    }
    
    lastUserActivity = Date.now();
    startInactivityTimer();
    
    // If we have an open socket connection, send a ping to keep it alive
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('Sending activity ping to server');
        socket.send(JSON.stringify({
            type: "ping",
            timestamp: Date.now(),
            isUserActivity: true  // Flag to indicate this is actual user activity
        }));
    }
}

// Add event listeners to track user activity
function setupActivityTracking() {
    // Track user input in chat
    if (chatInput) {
        chatInput.addEventListener('keydown', resetInactivityTimer);
    }
    
    // Track button clicks
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', resetInactivityTimer);
    }
    
    // Track general user activity on the page
    document.addEventListener('mousedown', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer);
    
    // Start the initial timer
    startInactivityTimer();
}

// Function to add a message to the chat
function addMessage(sender, message) {
    console.log(`Adding ${sender} message to chat:`, message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    
    if (!chatMessages) {
        console.error('chatMessages element is null, cannot add message');
        return;
    }
    
    try {
        const messageElement = document.createElement('div');
        
        if (sender === 'user') {
            // User messages should be right-aligned
            messageElement.className = 'flex flex-row-reverse items-start mb-4';
            messageElement.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white ml-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 max-w-[80%]">
                    <div class="text-sm text-gray-800 dark:text-gray-200">${message}</div>
                </div>
            `;
        } else if (sender === 'ai') {
            // Process AI message formatting
            const formattedMessage = formatAIMessage(message);
            
            // AI messages stay left-aligned
            messageElement.className = 'flex items-start mb-4';
            messageElement.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-[#3E9656] flex-shrink-0 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                    <div class="text-sm text-gray-800 dark:text-gray-200 message-content">${formattedMessage}</div>
                </div>
            `;
        } else if (sender === 'system') {
            // System messages centered
            messageElement.className = 'flex items-start mb-4';
            messageElement.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-yellow-500 flex-shrink-0 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3 max-w-[80%]">
                    <div class="text-sm text-gray-800 dark:text-gray-200">${message}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        console.log(`${sender} message added successfully`);
    } catch (error) {
        console.error('Error adding message to chat:', error);
    }
}

// Function to format AI messages with Markdown-like syntax
function formatAIMessage(message) {
    if (!message) return '';
    
    let formatted = message;
    
    // Handle newlines (convert \n to <br>)
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Handle bold text (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle numbered lists (only for simple formats)
    formatted = formatted.replace(/(^|\<br\>)(\d+)\.\s(.*?)($|\<br\>)/g, 
                                  '$1<span class="list-item"><span class="list-number">$2.</span> $3</span>$4');
    
    return formatted;
}

// Function to send a message to the server
function sendMessage() {
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // If not connected, try to reconnect
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.log('Socket not connected. Attempting to reconnect...');
        addMessage('system', 'Connection lost. Attempting to reconnect...');
        reconnectAttempts = 0; // Reset reconnect attempts to give a fresh start
        initializeWebSocket();
        
        // Store the message to retry after reconnection
        const retryMessage = message;
        
        // Clear input
        chatInput.value = '';
        
        // Set a retry mechanism
        setTimeout(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log('Reconnected successfully, sending delayed message');
                chatInput.value = retryMessage;
                sendMessage();
            }
        }, 2000);
        
        return;
    }
    
    try {
        // Add user message to the chat
        addMessage('user', message);
        
        // Disable input while waiting for response
        if (chatInput) chatInput.disabled = true;
        if (sendMessageBtn) sendMessageBtn.disabled = true;
        
        // Add typing indicator
        const typingEl = document.createElement('div');
        typingEl.id = 'typing-indicator';
        typingEl.className = 'flex items-start mb-4';
        typingEl.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#3E9656] flex-shrink-0 flex items-center justify-center text-white mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                <div class="text-sm text-gray-800 dark:text-gray-200">
                    <span class="typing-animation">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </span>
                </div>
            </div>
        `;
        if (chatMessages) {
            chatMessages.appendChild(typingEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Store message history - add user message
        messageHistory.push({
            "role": "user", 
            "content": message
        });
        
        // Get user metadata again in case it was updated
        const userName = document.getElementById('user-name')?.value || 
                         document.getElementById('chat-name')?.value || 
                         'Unknown';
        
        const userEmail = document.getElementById('user-email')?.value || 
                          document.getElementById('chat-email')?.value || 
                          'Unknown';
        
        // Create metadata object
        const userMetadata = {
            name: userName,
            email: userEmail
        };
        
        // Send message with metadata to server
        console.log('Sending message to server with metadata');
        socket.send(JSON.stringify({
            messages: messageHistory,
            metadata: userMetadata
        }));
        
        // Clear input
        chatInput.value = '';
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator if it exists
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator && chatMessages) {
            chatMessages.removeChild(typingIndicator);
        }
        
        // Add error message
        addMessage('system', 'Failed to send message. Please try again.');
        
        // Re-enable input
        if (chatInput) chatInput.disabled = false;
        if (sendMessageBtn) sendMessageBtn.disabled = false;
    }
}