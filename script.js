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

// Reconnection variables
let reconnectAttempts = 0;
const maxReconnectAttempts = 3;

// When DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
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
    chatInput = document.getElementById('chat-input');
    sendMessageBtn = document.getElementById('send-message');
    chatMessages = document.getElementById('chat-messages');
    connectionStatus = document.getElementById('connection-status');
    
    // Chat interface elements (alternative IDs)
    const chatInterface = document.getElementById('chatInterface');
    const userDetailsForm = document.getElementById('userDetailsForm');
    const startChatBtn = document.getElementById('startChatBtn');
    
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
    if (!connectionStatus) return;
    
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
        connectionStatus.innerHTML = `
            <span class="inline-flex items-center">
                <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Connected to AI assistant
            </span>
        `;
        
        // Enable chat controls
        if (chatInput) chatInput.disabled = false;
        if (sendMessageBtn) sendMessageBtn.disabled = false;
        
        // Add welcome message
        addMessage('ai', "Hello! I'm your DAI assistant. I'm here to understand your needs and recommend the right AI solutions for you. What kind of challenges are you looking to solve with AI or data?");
        
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
    
    // Always use secure WebSocket since the server enforces HTTPS
    const wsUrl = `wss://dai-temp.onrender.com/chatComplete`;
    
    // Log the WebSocket URL for debugging
    console.log(`Connecting to WebSocket server at: ${wsUrl} (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts + 1})`);
    console.log(`Current page protocol: ${window.location.protocol}`);
    
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
                console.error('WebSocket connection timed out after 10 seconds');
                console.log('Socket readyState at timeout:', socket.readyState);
                socket.close();
                reconnectAttempts++;
                initializeWebSocket(); // Try to reconnect
            }
        }, 10000); // 10 second timeout (increased from 5 seconds)
        
        // Connection opened
        socket.addEventListener('open', (event) => {
            console.log('WebSocket connection established successfully');
            console.log('WebSocket state:', socket.readyState);
            clearTimeout(connectionTimeout);
            reconnectAttempts = 0; // Reset reconnect counter on successful connection
            updateConnectionStatus('connected', true);
            
            // Send the message history immediately to initiate the conversation
            if (messageHistory.length > 0) {
                console.log('Sending initial message history:', messageHistory);
                try {
                    // Ensure proper JSON formatting
                    socket.send(JSON.stringify(messageHistory));
                } catch (err) {
                    console.error('Error sending initial message:', err);
                }
            }
            
            // Set up a ping interval to keep the connection alive
            const pingInterval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    // Send a simple ping string instead of JSON
                    console.log('Sending ping to keep connection alive');
                    socket.send('ping');
                } else {
                    clearInterval(pingInterval);
                }
            }, 30000); // Ping every 30 seconds
        });
        
        // Listen for messages
        socket.addEventListener('message', (event) => {
            const response = event.data;
            console.log('Received message from server:', response);
            
            // Handle ping response
            if (response === "pong" || response === "ping") {
                console.log('Received ping/pong response');
                return; // Don't display ping responses
            }
            
            // Remove typing indicator if it exists
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator && chatMessages) {
                chatMessages.removeChild(typingIndicator);
            }
            
            if (response && response.trim() !== '') {
                addMessage('ai', response);
                
                // Store message in history
                messageHistory.push({
                    "role": "assistant",
                    "content": response
                });
                
                // Re-enable input if it was disabled
                if (chatInput) chatInput.disabled = false;
                if (sendMessageBtn) sendMessageBtn.disabled = false;
                if (chatInput) chatInput.focus();
                
                // Scroll to the bottom
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                console.warn('Received empty response from server');
                addMessage('system', 'The assistant sent an empty response. Please try asking again.');
                
                // Re-enable input
                if (chatInput) chatInput.disabled = false;
                if (sendMessageBtn) sendMessageBtn.disabled = false;
            }
        });
        
        // Handle errors
        socket.addEventListener('error', (event) => {
            console.error('WebSocket error occurred:', event);
            console.log('Error details:', {
                bubbles: event.bubbles,
                cancelable: event.cancelable,
                currentTarget: event.currentTarget,
                defaultPrevented: event.defaultPrevented,
                eventPhase: event.eventPhase,
                target: event.target,
                timeStamp: event.timeStamp,
                type: event.type
            });
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
                
                // If the connection was immediately closed or never properly established
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

// Function to add a message to the chat
function addMessage(sender, message) {
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'flex items-start mb-4';
    
    if (sender === 'user') {
        messageElement.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 max-w-[80%]">
                <div class="text-sm text-gray-800 dark:text-gray-200">${message}</div>
            </div>
        `;
    } else if (sender === 'ai') {
        messageElement.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#3E9656] flex-shrink-0 flex items-center justify-center text-white mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                <div class="text-sm text-gray-800 dark:text-gray-200">${message}</div>
            </div>
        `;
    } else if (sender === 'system') {
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
        
        // Send message history to server
        console.log('Sending message to server:', messageHistory);
        socket.send(JSON.stringify(messageHistory));
        
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