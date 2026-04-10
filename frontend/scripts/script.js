document.addEventListener('DOMContentLoaded', () => {
  const API_URL = '/api/rsvp';

  // =========================================================
  // 1. THREE.JS - PARTÍCULAS DOURADAS 3D
  // =========================================================
  const initThreeJS = () => {
    const container = document.getElementById('three-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const particlesCount = window.innerWidth < 768 ? 800 : 1500;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 80;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xd4af37,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);

    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.0005 + mouseX * 0.005;
      mesh.rotation.x += 0.0002 + mouseY * 0.005;
      renderer.render(scene, camera);
    };

    animate();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 150);
    });
  };

  initThreeJS();

  // =========================================================
  // 2. GSAP ANIMATIONS
  // =========================================================
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to('.layer-top', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    });

    gsap.to('.layer-bottom', {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    });

    document.querySelectorAll('.fade-anim').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }

  // Tilt 3D (Desktop only)
  if (window.innerWidth > 768 && typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.tilt-effect'), {
      max: 10,
      speed: 400,
      glare: true,
      'max-glare': 0.3,
      scale: 1.02,
    });
  }

  // =========================================================
  // 3. CUSTOM SELECTS (DROPDOWN)
  // =========================================================
  document.querySelectorAll('.custom-dropdown-area').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.custom-select-trigger');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');
    const selectedText = dropdown.querySelector('.selected-value');
    const optionItems = dropdown.querySelectorAll('.option');

    trigger.addEventListener('click', () => {
      const isActive = trigger.classList.contains('active');
      document.querySelectorAll('.custom-select-trigger').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-expanded', 'false');
        t.closest('.input-wrapper')?.classList.remove('z-index-active');
      });

      if (!isActive) {
        trigger.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        dropdown.classList.add('z-index-active');
      }
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });

    optionItems.forEach((opt) => {
      opt.addEventListener('click', () => {
        selectedText.textContent = opt.textContent;
        selectedText.style.color = '#d4af37';
        hiddenInput.value = opt.getAttribute('data-value');
        dropdown.classList.remove('error', 'shake');
        trigger.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('z-index-active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        trigger.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('z-index-active');
      }
    });
  });

  // =========================================================
  // 4. CHILDREN TOGGLE
  // =========================================================
  const childCheckbox = document.getElementById('cbx-12');
  const childFields = document.getElementById('childrenFields');
  const childrenQtyInput = document.getElementById('childrenQty');
  const childrenDetails = document.getElementById('childrenDetails');
  const childQtyWrapper = document.getElementById('childQtyWrapper');

  if (childCheckbox) {
    childCheckbox.addEventListener('change', () => {
      if (childCheckbox.checked) {
        childFields.classList.add('active');
        childrenQtyInput.setAttribute('required', 'true');
        childrenDetails.setAttribute('required', 'true');
      } else {
        childFields.classList.remove('active');
        childrenQtyInput.removeAttribute('required');
        childrenDetails.removeAttribute('required');
        childQtyWrapper?.classList.remove('error', 'shake');
        childrenDetails?.parentElement.classList.remove('error', 'shake');
      }
    });
  }

  // =========================================================
  // 5. FORM VALIDATION & SUBMIT
  // =========================================================
  const form = document.getElementById('rsvpForm');
  const formContent = document.getElementById('formContent');
  const successMessage = document.getElementById('successMessage');

  if (!form) return;

  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.input-wrapper')?.classList.remove('error', 'shake');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    form.querySelectorAll('input[type="text"]:required, textarea:required').forEach((input) => {
      if (input.offsetParent !== null && !input.value.trim()) {
        isValid = false;
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.add('error', 'shake');
        setTimeout(() => wrapper.classList.remove('shake'), 500);
      }
    });

    form.querySelectorAll('input[type="hidden"]:required').forEach((input) => {
      if (input.offsetParent !== null && !input.value) {
        isValid = false;
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.add('error', 'shake');
        setTimeout(() => wrapper.classList.remove('shake'), 500);
      }
    });

    if (!isValid) return;

    const btn = form.querySelector('.Btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    btn.disabled = true;
    btn.classList.add('loading');
    if (btnText) btnText.style.opacity = '0';
    if (btnLoader) btnLoader.style.display = 'block';

    const formData = {
      name: document.getElementById('name').value.trim(),
      adults: document.getElementById('guests').value,
      hasChildren: childCheckbox.checked,
      childrenQty: childCheckbox.checked ? document.getElementById('childrenQty').value : null,
      childrenDetails: childCheckbox.checked ? document.getElementById('childrenDetails').value : null,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        gsap.to(formContent, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          onComplete: () => {
            formContent.classList.add('hidden');
            successMessage.classList.remove('hidden');
            gsap.fromTo(successMessage, { opacity: 0 }, { opacity: 1, duration: 0.5 });
            gsap.to('#successMessage h3, #successMessage p', {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.2,
              ease: 'power2.out',
              delay: 0.2,
            });
          },
        });
      } else {
        showFormError(data.error || 'Erro ao confirmar. Tente novamente.');
        resetButton();
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      showFormError('Erro de conexão. Tente novamente em instantes.');
      resetButton();
    }

    function resetButton() {
      btn.disabled = false;
      btn.classList.remove('loading');
      if (btnText) btnText.style.opacity = '1';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  });

  function showFormError(msg) {
    let errorEl = document.querySelector('.form-error-toast');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error-toast';
      document.body.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
    setTimeout(() => errorEl.classList.remove('visible'), 4000);
  }
});
