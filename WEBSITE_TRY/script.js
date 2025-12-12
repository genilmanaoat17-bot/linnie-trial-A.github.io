// AUTOMATIC ACTIVE LINK HIGHLIGHTER

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the current filename (e.g., "about.html" or "contact.html")
    // If path is empty (root), default to "index.html"
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // 2. Define which pages belong to the "GENRES" dropdown
    const genrePages = [
        'anime_page.html', 
        'comingofage.html', 
        'horror.html', 
        'musicals.html'
    ];

    // 3. Check specific conditions to add the 'active' class
    
    // CASE A: Check if we are on one of the Genre pages
    if (genrePages.includes(currentPage)) {
        const genreBtn = document.querySelector('.dropbtn');
        if (genreBtn) genreBtn.classList.add('active');
    }
    // CASE B: Standard links (About, Contact)
    else {

        const navLinks = document.querySelectorAll('.nav-links > li > a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
});

// CLICK-TO-PLAY TRAILERS FOR ALL CARDS
document.querySelectorAll(".trailer-card").forEach(card => {
    let thumb = card.querySelector(".thumb");
    let iframe = card.querySelector(".trailer-frame");
    let activated = false; // prevents double autoplay

    card.addEventListener("click", () => {
        if (activated) return; // avoid stacking autoplay loops
        activated = true;

        // Fade out thumbnail
        thumb.style.opacity = "0";
        thumb.style.pointerEvents = "none";

        // Trigger autoplay on first click
        let originalSrc = iframe.src;
        iframe.src = originalSrc + "&autoplay=1";

        // Allow interactions with the video
        iframe.style.pointerEvents = "auto";
    });
});

let players = {};

// YouTube API loads
function onYouTubeIframeAPIReady() {
    document.querySelectorAll(".trailer-frame").forEach(frame => {
        let id = frame.id;

        players[id] = new YT.Player(id, {
            events: {
                'onStateChange': (event) => onPlayerStateChange(event, frame)
            }
        });
    });
}

function onPlayerStateChange(event, frame) {
    let card = frame.closest(".trailer-card");
    let thumb = card.querySelector(".thumb");

    // Video PAUSED or ENDED → show thumbnail
    if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        thumb.style.opacity = "1";
        thumb.style.pointerEvents = "auto";
    }

    // Video PLAYING → hide thumbnail
    if (event.data === YT.PlayerState.PLAYING) {
        thumb.style.opacity = "0";
        thumb.style.pointerEvents = "none";
    }
}

// Clicking thumbnail should resume where it left off
document.querySelectorAll(".trailer-card .thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
        let frame = thumb.closest(".trailer-card").querySelector(".trailer-frame");
        let player = players[frame.id];

        thumb.style.opacity = "0";
        thumb.style.pointerEvents = "none";

        player.playVideo(); // resume EXACTLY where paused
    });
});

// CONTACT PAGE - FORM VALIDATION //
const form = document.getElementById("contactForm");
const successMsg = document.getElementById("successMessage");

if (form && successMsg) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let valid = true;

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const message = document.getElementById("message");

        document.querySelectorAll(".error").forEach(err => err.textContent = "");

        if (name.value.trim() === "") {
            name.nextElementSibling.textContent = "Name is required.";
            valid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() === "") {
            email.nextElementSibling.textContent = "Email is required.";
            valid = false;
        } else if (!emailPattern.test(email.value)) {
            email.nextElementSibling.textContent = "Enter a valid email.";
            valid = false;
        }

        if (message.value.trim() === "") {
            message.nextElementSibling.textContent = "Message cannot be empty.";
            valid = false;
        }

        if (valid) {
            successMsg.textContent = "Sending...";

            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(async response => {
                let data = null;
                try { data = await response.json(); } catch (e) { /* ignore */ }
                console.log('Web3Forms response', response.status, data);

                const successFlag = data && (data.success === true || data.success === 'true');

                if (response.ok && (successFlag || response.status === 200)) {
                    successMsg.textContent = "Your message has been sent successfully!";
                    form.reset();
                    setTimeout(() => { successMsg.textContent = ""; }, 5000);
                } else {
                    const errMsg = (data && (data.message || data.error)) || `HTTP ${response.status}`;
                    console.error('Web3Forms error:', errMsg, data);
                    successMsg.textContent = "Error sending message: " + errMsg;
                    setTimeout(() => { successMsg.textContent = ""; }, 8000);
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                successMsg.textContent = "Network error sending message. Please try again later.";
                setTimeout(() => { successMsg.textContent = ""; }, 5000);
            });
        }
    });
}

// Musicals Slider //
document.addEventListener('DOMContentLoaded', () => {
    const movieCards = document.querySelectorAll('.slider .cards .movie');
    const thumbnails = document.querySelectorAll('.thumbnail .movie');
    const nextbtn = document.getElementById('next');
    const prevbtn = document.getElementById('prev');

    if (!movieCards.length || !thumbnails.length || !nextbtn || !prevbtn) return;

    let sliderInterval = setInterval(() => {
        nextbtn.click();
    }, 10000)

    let movieactive = 0;
    const countmovies = movieCards.length;

    nextbtn.onclick = () => {
        movieactive = (movieactive + 1) % countmovies;
        showslider();
    };

    prevbtn.onclick = () => {
        movieactive = (movieactive - 1 + countmovies) % countmovies;
        showslider();
    };

    function showslider() {
        const oldActiveMovie = document.querySelector('.slider .cards .movie.active');
        const oldActiveThumb = document.querySelector('.thumbnail .movie.active');

        if (oldActiveMovie) oldActiveMovie.classList.remove('active');
        if (oldActiveThumb) oldActiveThumb.classList.remove('active');

        movieCards[movieactive].classList.add('active');
        thumbnails[movieactive].classList.add('active');

        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => {
        nextbtn.click();
    }, 10000)
    }

// display thumbnail and open modal on click//
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            movieactive = index;
            showslider()

            // Open modal with correct ID format
            const modalId = `modal${index + 1}`;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                
                // Autoplay video when modal opens
                const iframe = modal.querySelector('iframe');
                if (iframe) {
                    const originalSrc = iframe.src;
                    if (!originalSrc.includes('autoplay=1')) {
                        iframe.src = originalSrc + '&autoplay=1';
                    }
                }
            }
        });
    });

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = this.closest('.modal');
            
            if (modal) {
                // Stop and reset the video
                const iframe = modal.querySelector('iframe');
                if (iframe) {
                    const iframeSrc = iframe.src.replace('&autoplay=1', '');
                    iframe.src = '';
                    iframe.src = iframeSrc;
                }
                
                modal.style.display = 'none';
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            // Stop and reset the video
            const iframe = e.target.querySelector('iframe');
            if (iframe) {
                const iframeSrc = iframe.src.replace('&autoplay=1', '');
                iframe.src = '';
                iframe.src = iframeSrc;
            }
            
            e.target.style.display = 'none';
        }
    });
});

// NAVIGATION HAMBURGER MENU
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-links");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    // BUT ignore the "dropbtn" (Genres) so it doesn't close the menu while you are toggling it.
    document.querySelectorAll(".nav-links li a").forEach(n => {
        n.addEventListener("click", () => {
            // IF this is the GENRES button, stop here. Do NOT close the menu.
            if (n.classList.contains('dropbtn')) return;

            // For all other links (About, Contact, Sub-items), close the menu.
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });
}

// MOBILE DROPDOWN TOGGLE
document.addEventListener('DOMContentLoaded', () => {
    const dropBtn = document.querySelector('.dropbtn');
    const dropContent = document.querySelector('.dropdown-content');

    if (dropBtn && dropContent) {
        dropBtn.addEventListener('click', (e) => {
            e.preventDefault();       
            e.stopPropagation();      // Stop the click from closing the main menu
            dropContent.classList.toggle('show'); // Toggle visibility
        });
    }
});