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