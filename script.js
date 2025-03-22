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

});