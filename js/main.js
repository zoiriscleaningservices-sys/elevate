/* ==========================================================================
   ELEVATE CLEAN PRO - INTERACTIVE REDESIGN MODULES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBeforeAfterSlider();
  initServicesCarousel();
  initReviewsSlider();
  initLeafletMap();
  initScrollNav();
});

/* ==========================================================================
   SCROLL NAVIGATION ACTIVE STATES
   ========================================================================== */
function initScrollNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;
    
    // Toggle floating header scrolled state
    const header = document.querySelector('.main-header');
    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120; // sticky header offset
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current) && current !== '') {
        link.classList.add('active');
      }
    });
  });

  // Smooth scroll logic for anchors
  document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 90,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const closeBtn = document.getElementById('drawer-close');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-submenu a');
  const dropdownTrigger = document.querySelector('.mobile-dropdown-trigger');
  const submenu = document.querySelector('.mobile-submenu');

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!link.classList.contains('mobile-dropdown-trigger')) {
        closeDrawer();
      }
    });
  });

  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', () => {
      submenu.classList.toggle('open');
      const chevron = dropdownTrigger.querySelector('i');
      if (chevron) {
        chevron.classList.toggle('fa-chevron-down');
        chevron.classList.toggle('fa-chevron-up');
      }
    });
  }
}

/* ==========================================================================
   REAL BEFORE/AFTER SLIDER LOGIC
   ========================================================================== */
function initBeforeAfterSlider() {
  const container = document.getElementById('before-after-slider');
  if (!container) return;

  const beforeWrapper = document.getElementById('before-img-wrapper');
  const beforeInner = document.getElementById('before-img-inner');
  const handle = document.getElementById('slider-handle');
  let isDragging = false;

  // Make sure the top dirty image container width matches container width
  const resizeBeforeImage = () => {
    const containerWidth = container.offsetWidth;
    beforeInner.style.width = `${containerWidth}px`;
  };

  resizeBeforeImage();
  window.addEventListener('resize', resizeBeforeImage);

  const moveSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;

    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    beforeWrapper.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  // Drag listeners
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    moveSlider(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  handle.addEventListener('touchstart', () => {
    isDragging = true;
  });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      moveSlider(e.touches[0].clientX);
    }
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/* ==========================================================================
   SERVICES EXPANDABLE DETAILS
   ========================================================================== */
function initServicesCarousel() {
  const track = document.getElementById('services-carousel-track');
  const prevBtn = document.getElementById('services-prev');
  const nextBtn = document.getElementById('services-next');
  if (!track) return;

  const originalCards = Array.from(track.children);
  const totalOriginals = originalCards.length;
  if (totalOriginals === 0) return;

  // Clone original cards to prepend and append for seamless infinite looping
  // To have a seamless circular effect, we duplicate the sequence: Set1, Set2, Set3
  // Set1 (Clones at start), Set2 (Originals in middle), Set3 (Clones at end)
  originalCards.forEach(card => {
    const cloneStart = card.cloneNode(true);
    const cloneEnd = card.cloneNode(true);
    track.insertBefore(cloneStart, track.firstChild); // Prepend Set1
    track.appendChild(cloneEnd);                      // Append Set3
  });

  const cards = Array.from(track.children);
  const totalCards = cards.length;

  // Middle set starts at index totalOriginals
  let currentIndex = totalOriginals;
  let isTransitioning = false;

  // Wire up details toggle on all cards (original + clones)
  cards.forEach((card, index) => {
    const toggle = card.querySelector('.service-details-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('expanded');
        const isExpanded = card.classList.contains('expanded');
        toggle.innerHTML = isExpanded ? 'Hide Details <i class="fa-solid fa-minus"></i>' : 'View Details <i class="fa-solid fa-plus"></i>';
        updateCarousel(); // Recalculate dimensions if height changes
      });
    }
  });

  function updateCarousel(instant = false) {
    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    }

    const cardWidth = cards[0].offsetWidth;
    const gap = 32; // gap size matching CSS track gap
    
    // Calculate scroll offset to position the active card exactly in the middle of the viewport
    const viewportWidth = track.parentElement.offsetWidth;
    const offset = -(currentIndex * (cardWidth + gap)) + (viewportWidth / 2) - (cardWidth / 2);
    
    track.style.transform = `translateX(${offset}px)`;

    // Calculate 3D Coverflow offsets relative to currentIndex
    cards.forEach((card, idx) => {
      card.classList.remove('active');
      const diff = idx - currentIndex;

      if (diff === 0) {
        card.classList.add('active');
        card.style.transform = 'scale(1) rotateY(0deg) translateZ(0)';
        card.style.opacity = '1';
        card.style.filter = 'none';
        card.style.zIndex = '10';
      } else if (diff === -1) {
        card.style.transform = 'scale(0.85) rotateY(15deg) translateZ(-80px)';
        card.style.opacity = '0.65';
        card.style.filter = 'blur(1.5px)';
        card.style.zIndex = '5';
      } else if (diff === 1) {
        card.style.transform = 'scale(0.85) rotateY(-15deg) translateZ(-80px)';
        card.style.opacity = '0.65';
        card.style.filter = 'blur(1.5px)';
        card.style.zIndex = '5';
      } else if (diff < -1) {
        card.style.transform = `scale(0.72) translateZ(-150px)`;
        card.style.opacity = '0.35';
        card.style.filter = 'blur(3px)';
        card.style.zIndex = '1';
      } else if (diff > 1) {
        card.style.transform = `scale(0.72) translateZ(-150px)`;
        card.style.opacity = '0.35';
        card.style.filter = 'blur(3px)';
        card.style.zIndex = '1';
      }
    });
  }

  function handleTransitionEnd() {
    isTransitioning = false;
    
    // Seamless Infinite Loop Wrapping
    // If we've scrolled into the cloned Set1 (idx < totalOriginals)
    if (currentIndex < totalOriginals) {
      currentIndex += totalOriginals; // wrap instantly to Set2 (middle originals)
      updateCarousel(true);
    }
    // If we've scrolled into the cloned Set3 (idx >= totalOriginals * 2)
    else if (currentIndex >= totalOriginals * 2) {
      currentIndex -= totalOriginals; // wrap instantly to Set2 (middle originals)
      updateCarousel(true);
    }
  }

  track.addEventListener('transitionend', handleTransitionEnd);

  function slide(direction) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    if (direction === 'next') {
      currentIndex++;
    } else {
      currentIndex--;
    }
    updateCarousel();
  }

  nextBtn.addEventListener('click', () => slide('next'));
  prevBtn.addEventListener('click', () => slide('prev'));

  // Swipe / Drag Support
  let startX = 0;
  let isDragging = false;

  track.addEventListener('mousedown', (e) => {
    if (isTransitioning) return;
    isDragging = true;
    startX = e.clientX;
    track.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 50) {
      isDragging = false;
      slide(diff > 0 ? 'prev' : 'next');
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  track.addEventListener('touchstart', (e) => {
    if (isTransitioning) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    track.style.transition = 'none';
  });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > 50) {
      isDragging = false;
      slide(diff > 0 ? 'prev' : 'next');
    }
  });

  track.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Initial layout align
  setTimeout(() => {
    updateCarousel(true);
  }, 150);

  window.addEventListener('resize', () => {
    updateCarousel(true);
  });
}

// Global bridges to scrolls
function bookSpecificService(serviceName) {
  scrollToBooking();
}

function selectService(serviceKey) {
  scrollToBooking();
}

function selectServiceMobile(serviceKey) {
  scrollToBooking();
}

function scrollToBooking() {
  const bookingSec = document.getElementById('booking');
  if (bookingSec) {
    window.scrollTo({
      top: bookingSec.offsetTop - 90,
      behavior: 'smooth'
    });
  }
}

/* ==========================================================================
   GOOGLE REVIEWS CAROUSEL MODULE (BENTO COMPATIBLE)
   ========================================================================== */
function initReviewsSlider() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');
  const dotsContainer = document.getElementById('reviews-dots');
  const cards = document.querySelectorAll('.testimonial-card');
  
  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let itemsPerScreen = getItemsPerScreen();
  let maxSlides = cards.length - itemsPerScreen;

  const generateDots = () => {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxSlides; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === currentIndex) dot.classList.add('active');
      
      const targetIndex = i;
      dot.addEventListener('click', () => {
        goToSlide(targetIndex);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    }
  };

  generateDots();

  function getItemsPerScreen() {
    const width = window.innerWidth;
    if (width > 1100) return 2; // fits nice in bento grid
    return 1;
  }

  function updateSliderDimensions() {
    itemsPerScreen = getItemsPerScreen();
    maxSlides = cards.length - itemsPerScreen;
    
    if (currentIndex > maxSlides) {
      currentIndex = maxSlides;
    }
    
    generateDots();
    goToSlide(currentIndex);
  }

  window.addEventListener('resize', updateSliderDimensions);

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index > maxSlides) index = maxSlides;
    currentIndex = index;

    const cardWidthPercent = 100 / itemsPerScreen;
    const offset = index * (cardWidthPercent + (24 / track.offsetWidth * 100)); // 24px is gaps
    
    track.style.transform = `translateX(-${offset}%)`;

    const activeDots = dotsContainer.querySelectorAll('.slider-dot');
    activeDots.forEach((dot, idx) => {
      dot.classList.remove('active');
      if (idx === currentIndex) {
        dot.classList.add('active');
      }
    });
  }

  nextBtn.addEventListener('click', () => {
    if (currentIndex < maxSlides) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(0);
    }
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(maxSlides);
    }
    resetAutoPlay();
  });

  let autoPlayInterval = setInterval(() => {
    if (currentIndex < maxSlides) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(0);
    }
  }, 5000);

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => {
      if (currentIndex < maxSlides) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
    }, 6000);
  }
}

/* ==========================================================================
   INTERACTIVE MAP COMPONENT (LEAFLET JS - DARK STYLED)
   ========================================================================== */
function initLeafletMap() {
  const mapElement = document.getElementById('service-map');
  if (!mapElement) return;

  const centerCoord = [38.73, -121.20]; 
  const map = L.map('service-map', {
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: false
  }).setView(centerCoord, 10);

  // Layer 1: Esri World Imagery (Realistic Satellite) + Place Labels
  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
  });
  const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
  });
  const satelliteGroup = L.layerGroup([satelliteLayer, labelsLayer]);

  // Layer 2: CartoDB Dark Matter (Obsidian vector style)
  const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  });

  // Default to Satellite Imagery view (Realistic style)
  satelliteGroup.addTo(map);

  const cities = [
    { name: "Granite Bay", coords: [38.7432, -121.1797], popup: "<strong>Granite Bay Team</strong><br>📍 Active today. Serving upscale residential estates." },
    { name: "Roseville (East)", coords: [38.7521, -121.2880], popup: "<strong>Roseville Team</strong><br>📍 Active today. Weekly and bi-weekly residential care." },
    { name: "Rocklin", coords: [38.7907, -121.2358], popup: "<strong>Rocklin Team</strong><br>📍 Active today. Move-out cleanings and deep cleans." },
    { name: "Folsom", coords: [38.6780, -121.1761], popup: "<strong>Folsom Team</strong><br>📍 Active today. Eco-friendly cleaning for family homes." },
    { name: "El Dorado Hills", coords: [38.6857, -121.0822], popup: "<strong>El Dorado Hills Team</strong><br>📍 Active today. Deep cleaning specialists." },
    { name: "Lincoln", coords: [38.8916, -121.2930], popup: "<strong>Lincoln Team</strong><br>📍 Active today. Routinely scheduled house care." }
  ];

  const boundaryPoints = [
    [38.90, -121.32], // Lincoln NW
    [38.80, -121.12], // Rocklin/Granite Bay NE
    [38.70, -121.04], // El Dorado Hills Far East
    [38.62, -121.12], // EDH/Folsom SE
    [38.64, -121.24], // South Folsom SW
    [38.72, -121.35], // West Roseville W
    [38.88, -121.35]  // North West boundary back to Lincoln
  ];

  const serviceArea = L.polygon(boundaryPoints, {
    color: '#0EA5E9',       // Sky Blue neon outline
    fillColor: '#38BDF8',   // Glowing Blue fill
    fillOpacity: 0.12,
    weight: 2.5,
    dashArray: '5, 5'
  }).addTo(map);

  serviceArea.bindTooltip("Elevate Clean Pro Core Service Area", { sticky: true });

  // Custom Pulsing DivIcon setup
  const pulsingIcon = L.divIcon({
    className: 'custom-pulsing-marker-wrapper',
    html: `
      <div class="pulsing-marker">
        <div class="marker-core"></div>
        <div class="marker-pulse"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  // Plot pulsing targets
  cities.forEach(city => {
    const marker = L.marker(city.coords, { icon: pulsingIcon }).addTo(map);
    marker.bindPopup(city.popup);
    
    marker.on('mouseover', function () {
      this.openPopup();
    });
  });

  // Layer toggling logic
  const btnSatellite = document.getElementById('map-style-satellite');
  const btnDark = document.getElementById('map-style-dark');

  if (btnSatellite && btnDark) {
    btnSatellite.addEventListener('click', () => {
      btnSatellite.classList.add('active');
      btnDark.classList.remove('active');
      map.removeLayer(darkLayer);
      satelliteGroup.addTo(map);
    });

    btnDark.addEventListener('click', () => {
      btnDark.classList.add('active');
      btnSatellite.classList.remove('active');
      map.removeLayer(satelliteGroup);
      darkLayer.addTo(map);
    });
  }
}
