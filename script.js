/**
 * Sidd Business Consulting - Vanilla JavaScript Experience
 * Pure JavaScript - Multi-Video Carousel, Glassmorphic Modals & Bookmarking
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Element Selectors ---
  const slides = document.querySelectorAll('.hero-slide');
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  const prevSlideBtn = document.getElementById('prevSlideBtn');
  const nextSlideBtn = document.getElementById('nextSlideBtn');
  
  const video = document.getElementById('heroVideo');
  const playPauseVideoBtn = document.getElementById('playPauseVideoBtn');
  const pauseIcon = document.getElementById('pauseIcon');
  const playIcon = document.getElementById('playIcon');

  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const closeSearchModal = document.getElementById('closeSearchModal');
  const searchInput = document.getElementById('searchInput');
  const suggestionTags = document.querySelectorAll('.suggestion-tag');

  const consultExpertBtn = document.getElementById('consultExpertBtn');
  const consultModal = document.getElementById('consultModal');
  const closeConsultModal = document.getElementById('closeConsultModal');

  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const bookmarkCount = document.getElementById('bookmarkCount');
  const saveSlideBtn = document.getElementById('saveSlideBtn');

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeMobileDrawer = document.getElementById('closeMobileDrawer');

  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  let currentSlideIndex = 0;
  let savedCount = 0;
  let isSavedCurrentSlide = false;
  let autoSlideTimer = null;

  // --- Slide Carousel Functionality ---
  function goToSlide(index) {
    if (index < 0) {
      currentSlideIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlideIndex);
    });

    indicatorDots.forEach((dot, idx) => {
      const isActive = idx === currentSlideIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Reset bookmark button visual for slide 0 if not saved
    if (currentSlideIndex === 0) {
      updateBookmarkState(isSavedCurrentSlide);
    }

    // Switch active background video matching current slide
    updateBackgroundVideo(currentSlideIndex);
  }

  // --- Background Videos (Multi-Slide Support) ---
  const bgVideos = document.querySelectorAll('.bg-video');

  function updateBackgroundVideo(slideIndex) {
    let matchedVideo = null;
    bgVideos.forEach((vid) => {
      const vidSlide = parseInt(vid.getAttribute('data-slide-video'), 10);
      if (vidSlide === slideIndex) {
        matchedVideo = vid;
      }
    });

    // If a slide doesn't have its own video, fallback to default video (slide 0)
    if (!matchedVideo && bgVideos.length > 0) {
      matchedVideo = bgVideos[0];
    }

    bgVideos.forEach((vid) => {
      if (vid === matchedVideo) {
        vid.classList.add('active');
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            vid.muted = true;
            vid.play().catch(() => {});
          });
        }
      } else {
        vid.classList.remove('active');
      }
    });
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      goToSlide(currentSlideIndex + 1);
    }, 7000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  // Event Listeners for Slide Navigation
  indicatorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
      goToSlide(slideIndex);
      startAutoSlide();
    });
  });

  if (prevSlideBtn) {
    prevSlideBtn.addEventListener('click', () => {
      goToSlide(currentSlideIndex - 1);
      startAutoSlide();
    });
  }

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener('click', () => {
      goToSlide(currentSlideIndex + 1);
      startAutoSlide();
    });
  }

  // Pause auto slider when user interacts with hero content
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoSlide);
    heroSection.addEventListener('mouseleave', startAutoSlide);
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (searchModal.classList.contains('active') || consultModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      goToSlide(currentSlideIndex + 1);
      startAutoSlide();
    } else if (e.key === 'ArrowLeft') {
      goToSlide(currentSlideIndex - 1);
      startAutoSlide();
    }
  });

  // --- Background Video Controls ---
  bgVideos.forEach((vid) => {
    vid.muted = true;
    const p = vid.play();
    if (p !== undefined) {
      p.catch(() => {});
    }
  });

  if (playPauseVideoBtn) {
    playPauseVideoBtn.addEventListener('click', () => {
      const activeVid = document.querySelector('.bg-video.active') || bgVideos[0];
      if (!activeVid) return;

      const isPaused = activeVid.paused;
      bgVideos.forEach((vid) => {
        if (isPaused) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });

      if (isPaused) {
        pauseIcon.style.display = 'block';
        playIcon.style.display = 'none';
        playPauseVideoBtn.setAttribute('title', 'Pause Background Video');
      } else {
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'block';
        playPauseVideoBtn.setAttribute('title', 'Play Background Video');
      }
    });
  }

  // --- Toast Notification Helper ---
  let toastTimeout = null;
  function showToast(msg) {
    if (toastMessage) toastMessage.textContent = msg;
    if (toast) {
      toast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }
  }

  // --- Bookmark / Reading List Feature ---
  function updateBookmarkState(saved) {
    if (!saveSlideBtn) return;
    const textSpan = saveSlideBtn.querySelector('span');
    if (saved) {
      saveSlideBtn.style.background = 'rgba(28, 214, 108, 0.25)';
      saveSlideBtn.style.borderColor = 'rgba(28, 214, 108, 0.6)';
      if (textSpan) textSpan.textContent = 'Report Saved ✓';
    } else {
      saveSlideBtn.style.background = '';
      saveSlideBtn.style.borderColor = '';
      if (textSpan) textSpan.textContent = 'Save report';
    }
  }

  if (saveSlideBtn) {
    saveSlideBtn.addEventListener('click', () => {
      isSavedCurrentSlide = !isSavedCurrentSlide;
      if (isSavedCurrentSlide) {
        savedCount++;
        showToast('Saved "2026 People Readiness Report" to reading list!');
      } else {
        savedCount = Math.max(0, savedCount - 1);
        showToast('Removed from reading list.');
      }
      bookmarkCount.textContent = savedCount.toString();
      updateBookmarkState(isSavedCurrentSlide);
    });
  }

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      if (savedCount === 0) {
        showToast('Your saved reading list is currently empty. Click "Save report" to add items.');
      } else {
        showToast(`You have ${savedCount} item(s) saved in your Sidd Business Consulting reading list.`);
      }
    });
  }

  // --- Search Modal Overlay ---
  function openSearch() {
    searchModal.classList.add('active');
    searchModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 100);
  }

  function closeSearch() {
    searchModal.classList.remove('active');
    searchModal.setAttribute('aria-hidden', 'true');
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (closeSearchModal) closeSearchModal.addEventListener('click', closeSearch);

  suggestionTags.forEach(tag => {
    tag.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = tag.textContent;
        searchInput.focus();
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        showToast(`Searching for "${searchInput.value.trim()}"...`);
        closeSearch();
      }
    });
  }

  // --- Consult an Expert Modal ---
  window.openConsultModal = function() {
    consultModal.classList.add('active');
    consultModal.setAttribute('aria-hidden', 'false');
    const firstInput = consultModal.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  };

  function closeConsult() {
    consultModal.classList.remove('active');
    consultModal.setAttribute('aria-hidden', 'true');
  }

  if (consultExpertBtn) {
    consultExpertBtn.addEventListener('click', window.openConsultModal);
  }
  if (closeConsultModal) {
    closeConsultModal.addEventListener('click', closeConsult);
  }

  window.submitConsult = function() {
    const firstName = document.getElementById('firstName')?.value || 'Guest';
    closeConsult();
    showToast(`Thank you, ${firstName}! A Sidd Business Consulting specialist will connect with you shortly.`);
    const consultForm = document.getElementById('consultForm');
    if (consultForm) consultForm.reset();
  };

  // --- Close Modals on Backdrop Click ---
  const careerApplyModal = document.getElementById('careerApplyModal');

  function closeAllModals() {
    closeSearch();
    closeConsult();
    if (window.closeCareerApplyModal) window.closeCareerApplyModal();
    if (mobileDrawer) mobileDrawer.classList.remove('active');
  }

  [searchModal, consultModal, careerApplyModal].filter(Boolean).forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // --- Mobile Drawer Menu ---
  if (mobileMenuBtn && mobileDrawer && closeMobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    });

    closeMobileDrawer.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
      mobileDrawer.setAttribute('aria-hidden', 'true');
    });
  }

  // --- Footer Locale Selector ---
  const footerLocaleBtn = document.getElementById('footerLocaleBtn');
  if (footerLocaleBtn) {
    footerLocaleBtn.addEventListener('click', () => {
      showToast('Region: United States (English) selected.');
    });
  }

  // --- Adaptive Navbar Scroll State ---
  const glassNavbar = document.querySelector('.glass-navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      glassNavbar?.classList.add('scrolled-light');
    } else {
      glassNavbar?.classList.remove('scrolled-light');
    }
  });

  // --- FAQ Brand Dropdown & Category Switching ---
  const faqBrandDropdownBtn = document.getElementById('faqBrandDropdownBtn');
  const faqSidebar = document.querySelector('.faq-sidebar');
  const faqCatBtns = document.querySelectorAll('.faq-cat-btn');
  const faqGroups = document.querySelectorAll('.faq-group');
  const faqQuestions = document.querySelectorAll('.faq-question');

  // Toggle Category List on Brand Arrow Click
  if (faqBrandDropdownBtn && faqSidebar) {
    faqBrandDropdownBtn.addEventListener('click', () => {
      const isExpanded = faqSidebar.classList.toggle('expanded');
      faqBrandDropdownBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
  }

  // Category Tab Switching
  faqCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCategory = btn.getAttribute('data-category');
      
      faqCatBtns.forEach(b => {
        const isSelected = b === btn;
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      faqGroups.forEach(group => {
        const isMatch = group.getAttribute('data-group') === targetCategory;
        group.classList.toggle('active', isMatch);
      });
    });
  });

  // Accordion Expand / Collapse
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const parentItem = question.closest('.faq-item');
      if (!parentItem) return;
      const isOpen = parentItem.classList.contains('open');

      // Close sibling items in the same group
      const currentGroup = question.closest('.faq-group');
      if (currentGroup) {
        currentGroup.querySelectorAll('.faq-item.open').forEach(item => {
          if (item !== parentItem) {
            item.classList.remove('open');
            item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          }
        });
      }

      parentItem.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  // --- Pattern 1: Vertical Tab Reader Switching (Image 1 Pattern) ---
  const verticalTabBtns = document.querySelectorAll('.vertical-tab-btn');
  const readerTabPanels = document.querySelectorAll('.reader-tab-panel');

  verticalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      verticalTabBtns.forEach(b => {
        const isSelected = b === btn;
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      readerTabPanels.forEach(panel => {
        const isMatch = panel.id === targetTab;
        panel.classList.toggle('active', isMatch);
      });
    });
  });

  // --- Career Page: Interactive Application & Modals ---
  window.openCareerApplyModal = function(roleName) {
    if (careerApplyModal) {
      careerApplyModal.classList.add('active');
      careerApplyModal.setAttribute('aria-hidden', 'false');
      if (roleName) {
        const modalRoleSelect = document.getElementById('modalApplicantRole');
        if (modalRoleSelect) modalRoleSelect.value = roleName;
      }
      const firstInput = careerApplyModal.querySelector('input');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
  };

  window.closeCareerApplyModal = function() {
    if (careerApplyModal) {
      careerApplyModal.classList.remove('active');
      careerApplyModal.setAttribute('aria-hidden', 'true');
    }
  };

  window.selectRoleAndApply = function(roleName) {
    // Populate on-page form dropdown if present
    const pageRoleSelect = document.getElementById('applicantRole');
    if (pageRoleSelect) {
      pageRoleSelect.value = roleName;
      const applySection = document.getElementById('apply');
      if (applySection) {
        applySection.scrollIntoView({ behavior: 'smooth' });
        const nameInput = document.getElementById('applicantName');
        if (nameInput) setTimeout(() => nameInput.focus(), 600);
        return;
      }
    }
    // Fallback to quick apply modal
    window.openCareerApplyModal(roleName);
  };

  // Resume File Selection & Drag & Drop Handling
  window.handleFileSelect = function(inputElement, statusElementId) {
    const statusEl = document.getElementById(statusElementId);
    if (!inputElement.files || inputElement.files.length === 0) {
      if (statusEl) statusEl.textContent = '';
      return;
    }

    const file = inputElement.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    const maxSizeMB = 5;
    const isSizeOk = file.size <= maxSizeMB * 1024 * 1024;

    if (!isValidType) {
      alert('Please upload a valid document (.PDF, .DOC, or .DOCX).');
      inputElement.value = '';
      if (statusEl) {
        statusEl.innerHTML = '<span style="color: #e53935;">✕ Invalid format. PDF or Word only.</span>';
      }
      return;
    }

    if (!isSizeOk) {
      alert(`File size exceeds ${maxSizeMB}MB limit. Please attach a smaller file.`);
      inputElement.value = '';
      if (statusEl) {
        statusEl.innerHTML = '<span style="color: #e53935;">✕ File exceeds 5MB limit.</span>';
      }
      return;
    }

    const fileSizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: #0d8a42; font-weight: 600;">✓ Attached: ${file.name} (${fileSizeFormatted})</span>`;
    }
  };

  // Drag and drop events for file drop zone
  const fileDropZone = document.getElementById('fileDropZone');
  const mainFileInput = document.getElementById('applicantResume');

  if (fileDropZone && mainFileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropZone.classList.remove('dragover');
      });
    });

    fileDropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        mainFileInput.files = e.dataTransfer.files;
        window.handleFileSelect(mainFileInput, 'fileUploadStatus');
      }
    });
  }

  // Application Submission Handler
  window.handleCareerApplication = function(e, formElement) {
    e.preventDefault();

    const formData = new FormData(formElement);
    const applicantName = formData.get('fullName') || 'Applicant';
    const role = formData.get('role') || 'Consulting Intern';
    const degree = formData.get('degree') || 'B.Com / M.Com';
    const email = formData.get('email');
    const mobile = formData.get('mobile');
    const resumeFile = formData.get('resume');

    if (!resumeFile || (resumeFile instanceof File && resumeFile.size === 0)) {
      alert('Please upload your Resume (PDF or Word) before submitting.');
      return;
    }

    // Success notification
    showToast(`Thank you, ${applicantName}! Your application for ${role} (${degree}) has been successfully submitted. Our team will review your profile within 48 hours.`);

    // Reset form & indicators
    formElement.reset();
    const status1 = document.getElementById('fileUploadStatus');
    const status2 = document.getElementById('modalFileStatus');
    if (status1) status1.innerHTML = '';
    if (status2) status2.innerHTML = '';

    // Close modal if open
    window.closeCareerApplyModal();
  };

  // Initialize auto slide
  startAutoSlide();
});
