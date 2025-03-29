const mobileMenu = document.querySelector("#mobileMenu");

function openMenu() {
    document.getElementById('mobileMenu').style.right = "0";
}

function closeMenu() {
    document.getElementById('mobileMenu').style.right = "-16rem";
}

// Mobile menu functions
//function openMenu() {
//    document.getElementById('mobileMenu').style.right = "0";
//}

//function closeMenu() {
//    document.getElementById('mobileMenu').style.right = "-16rem";
//}

// Services Tab Toggle
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Smooth scrolling for anchor links
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
                
                // Close mobile menu if open
                if (window.innerWidth < 768) {
                    closeMenu();
                }
            }
        });
    });

    // Testimonial Carousel
    const testimonialCarousel = document.getElementById('testimonialCarousel');
    if (testimonialCarousel) {
        const slides = testimonialCarousel.querySelectorAll('.testimonial-slide');
        const prevBtn = document.getElementById('prevTestimonial');
        const nextBtn = document.getElementById('nextTestimonial');
        const dots = testimonialCarousel.querySelectorAll('.indicator-dot');
        let currentIndex = 0;
        
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
        
        // Auto-advance the carousel every 6 seconds
        let autoAdvance = setInterval(function() {
            let newIndex = currentIndex + 1;
            if (newIndex >= slides.length) {
                newIndex = 0;
            }
            showSlide(newIndex);
        }, 6000);
        
        // Pause auto-advance when cursor is over the carousel
        testimonialCarousel.addEventListener('mouseenter', function() {
            clearInterval(autoAdvance);
        });
        
        // Resume auto-advance when cursor leaves the carousel
        testimonialCarousel.addEventListener('mouseleave', function() {
            autoAdvance = setInterval(function() {
                let newIndex = currentIndex + 1;
                if (newIndex >= slides.length) {
                    newIndex = 0;
                }
                showSlide(newIndex);
            }, 6000);
        });
    }
});

// Chat Interface Functions
const chatInterface = document.getElementById('chatInterface');
const userDetailsForm = document.getElementById('userDetailsForm');
const startChatBtn = document.getElementById('startChatBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

let userName = '';
let userEmail = '';
let socket = null;
let messageHistory = [];

// Function to initialize WebSocket connection
function initializeWebSocket() {
    // Create WebSocket connection - adjust the URL to your server location
    const wsUrl = window.location.protocol === 'https:' 
        ? 'wss://' + window.location.host + '/chatComplete'
        : 'ws://' + window.location.host + '/chatComplete';
    
    // For local development, use a direct connection to your server
    // const wsUrl = 'ws://localhost:8000/chatComplete';
    
    socket = new WebSocket(wsUrl);
    
    // Connection opened
    socket.addEventListener('open', (event) => {
        console.log('Connected to WebSocket server');
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
        const response = event.data;
        addMessage('ai', response);
        
        // Store message in history
        messageHistory.push({
            "role": "assistant",
            "content": response
        });
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
    
    // Handle errors
    socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        addMessage('system', 'Connection error. Please try again later.');
    });
    
    // Connection closed
    socket.addEventListener('close', (event) => {
        console.log('Disconnected from WebSocket server');
        
        if (event.wasClean) {
            console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            console.error('Connection died');
            addMessage('system', 'Connection lost. Please refresh the page to reconnect.');
        }
    });
}

// Function to add a message to the chat
function addMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message ' + sender + '-message';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="flex items-start justify-end">
                <div class="bg-[#3E9656]/10 p-3 rounded-lg max-w-[85%]">
                    <p class="text-gray-700">${message}</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
                    <span class="text-gray-700 text-xs font-bold">You</span>
                </div>
            </div>
        `;
    } else if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="flex items-start">
                <div class="w-8 h-8 rounded-full bg-[#3E9656] flex items-center justify-center mr-2 flex-shrink-0">
                    <span class="text-white text-xs font-bold">AI</span>
                </div>
                <div class="bg-gray-100 p-3 rounded-lg max-w-[85%]">
                    <p class="text-gray-700">${message}</p>
                </div>
            </div>
        `;
    } else if (sender === 'system') {
        messageDiv.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="bg-red-100 p-2 rounded-lg">
                    <p class="text-red-600 text-sm">${message}</p>
                </div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
}

// Function to send a message
function sendMessage() {
    const message = chatInput.value.trim();
    
    if (message !== '') {
        // Add message to chat
        addMessage('user', message);
        
        // Store message in history
        messageHistory.push({
            "role": "user",
            "content": message
        });
        
        // Clear input
        chatInput.value = '';
        
        // Send message to server if socket is connected
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(messageHistory));
        } else {
            addMessage('system', 'Connection is not open. Please refresh the page.');
        }
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Check if chat elements exist and set up event listeners
if (startChatBtn && chatInterface && userDetailsForm) {
    // Start chat button click
    startChatBtn.addEventListener('click', function() {
        userName = document.getElementById('chat-name').value.trim();
        userEmail = document.getElementById('chat-email').value.trim();
        
        if (userName === '' || userEmail === '') {
            alert('Please enter your name and email to continue.');
            return;
        }
        
        // Hide user details form and show chat interface
        userDetailsForm.style.display = 'none';
        chatInterface.style.display = 'flex';
        
        // Initialize message history with user context
        messageHistory = [
            {
                "role": "user",
                "content": `Hello, my name is ${userName} and my email is ${userEmail}. I'm interested in learning about DAI's AI solutions.`
            }
        ];
        
        // Initialize WebSocket connection
        initializeWebSocket();
    });
    
    // Send message on button click
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }
}