// Nous attendons que le document soit complètement chargé avant d'initialiser notre application
document.addEventListener('DOMContentLoaded', function() {
    // Configuration globale du jeu et de ses animations
    const CONFIG = {
        // Paramètres d'animation et de timing
        animationSpeed: 30,        // Vitesse de base des animations (en ms)
        scrollThreshold: 100,      // Délai minimum entre les défilements (en ms)
        glitchProbability: 0.1,    // Probabilité d'apparition d'un effet glitch
        
        // Paramètres sonores
        audioVolume: {
            ambient: 0.3,          // Volume des sons d'ambiance
            effects: 0.5,          // Volume des effets sonores
            narration: 0.8         // Volume des narrations
        },
        
        // Paramètres visuels
        neonColors: {
            blue: '#00f3ff',
            red: '#ff0033',
            purple: '#bc13fe'
        }
    };

    // Gestionnaire des effets d'ambiance
// Gestionnaire des effets d'ambiance
const AmbianceManager = {
    init() {
        this.createRainEffect();
        this.createNeonReflections();
        this.createStreetLights();  // Maintenant cette fonction existe
        this.initializeAmbientSounds();
    },

    // Création de l'effet de pluie en arrière-plan
    createRainEffect() {
        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-container';
        
        // Création de multiples gouttes de pluie pour un effet réaliste
        for (let i = 0; i < 100; i++) {
            const raindrop = document.createElement('div');
            raindrop.className = 'raindrop';
            raindrop.style.left = `${Math.random() * 100}%`;
            raindrop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            raindrop.style.animationDelay = `${Math.random() * 2}s`;
            rainContainer.appendChild(raindrop);
        }
        
        document.body.prepend(rainContainer);
    },

    // Création des reflets de néons pour l'ambiance urbaine
    createNeonReflections() {
        const neonContainer = document.createElement('div');
        neonContainer.className = 'neon-reflections';
        
        Object.entries(CONFIG.neonColors).forEach(([color, value], index) => {
            const reflection = document.createElement('div');
            reflection.className = `neon-reflection ${color}`;
            reflection.style.animationDelay = `${index * 0.5}s`;
            neonContainer.appendChild(reflection);
        });
        
        document.body.appendChild(neonContainer);
    },

    // Ajout de la fonction manquante pour créer les lumières de rue
    createStreetLights() {
        const lightsContainer = document.createElement('div');
        lightsContainer.className = 'street-lights';

        // Création de 5 lampadaires
        for (let i = 0; i < 5; i++) {
            const light = document.createElement('div');
            light.className = 'street-light';
            
            // Ajout d'un délai différent pour chaque lumière pour un effet plus réaliste
            light.style.animationDelay = `${i * 0.8}s`;
            
            // Position horizontale aléatoire pour plus de naturel
            light.style.left = `${(i * 20) + Math.random() * 10}%`;
            
            lightsContainer.appendChild(light);
        }

        document.body.appendChild(lightsContainer);
    },

    // Gestion des sons d'ambiance
    initializeAmbientSounds() {
        const ambientSounds = {
            rain: new Audio('assets/sounds/rain.mp3'),
            traffic: new Audio('assets/sounds/city-traffic.mp3')
        };

        Object.values(ambientSounds).forEach(sound => {
            sound.loop = true;
            sound.volume = CONFIG.audioVolume.ambient;
        });

        return ambientSounds;
    }
};

    // Gestionnaire du contenu textuel et des animations de texte
    const TextManager = {
        sections: null,
        currentSection: 0,
        isAnimating: false,

        init() {
            this.sections = document.querySelectorAll('.narrative-section');
            this.setupSections();
            this.initializeScrolling();
        },

        setupSections() {
            this.sections.forEach((section, index) => {
                section.style.opacity = index === 0 ? '1' : '0.3';
                section.dataset.index = index;
                this.prepareTextContent(section);
            });
        },

        // Préparation du contenu textuel pour l'animation
        prepareTextContent(section) {
            const content = section.querySelector('.text-content');
            if (content) {
                const originalText = content.textContent;
                content.textContent = '';
                content.dataset.originalText = originalText;
            }
        },

        // Animation du texte avec effets de glitch
        async animateText(element, text) {
            for (const char of text) {
                element.textContent += char;

                if (Math.random() < CONFIG.glitchProbability) {
                    await this.applyGlitchEffect(element);
                }

                await new Promise(resolve => setTimeout(resolve, CONFIG.animationSpeed));
            }
        },

        // Application des effets de glitch sur le texte
        async applyGlitchEffect(element) {
            element.style.textShadow = '2px 0 #ff0033, -2px 0 #00ff00';
            await new Promise(resolve => setTimeout(resolve, 50));
            element.style.textShadow = 'none';
        },

        // Gestion du défilement
        initializeScrolling() {
            let lastScrollTime = Date.now();

            // Écouteur pour la molette de souris
            window.addEventListener('wheel', (e) => {
                const currentTime = Date.now();
                if (currentTime - lastScrollTime < CONFIG.scrollThreshold) return;

                if (e.deltaY > 0) {
                    this.showNextSection();
                } else {
                    this.showPreviousSection();
                }

                lastScrollTime = currentTime;
            });

            // Écouteur pour le défilement tactile
            this.initializeTouchScrolling();
        },

        // Gestion du défilement tactile
        initializeTouchScrolling() {
            let touchStartY = 0;
            
            window.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            });

            window.addEventListener('touchmove', (e) => {
                const touchEndY = e.touches[0].clientY;
                const deltaY = touchStartY - touchEndY;

                if (Math.abs(deltaY) > 50) {
                    if (deltaY > 0) {
                        this.showNextSection();
                    } else {
                        this.showPreviousSection();
                    }
                    touchStartY = touchEndY;
                }
            });
        },

        // Navigation entre les sections
        showNextSection() {
            if (this.currentSection < this.sections.length - 1) {
                this.revealSection(this.currentSection + 1);
            }
        },

        showPreviousSection() {
            if (this.currentSection > 0) {
                this.revealSection(this.currentSection - 1);
            }
        }
    };

    // Gestionnaire des interactions utilisateur
    const InteractionManager = {
        init() {
            this.setupSkipButton();
            this.setupStartButton();
            this.setupKeyboardControls();
        },

        setupSkipButton() {
            const skipButton = document.getElementById('skip-button');
            skipButton?.addEventListener('click', () => this.skipIntro());
        },

        setupStartButton() {
            const startButton = document.querySelector('.start-button');
            startButton?.addEventListener('click', () => this.startGame());
        },

        setupKeyboardControls() {
            document.addEventListener('keydown', (e) => {
                switch(e.code) {
                    case 'Space':
                    case 'Enter':
                        if (!TextManager.isAnimating) {
                            TextManager.showNextSection();
                        }
                        break;
                    case 'Escape':
                        this.skipIntro();
                        break;
                }
            });
        },

        skipIntro() {
            TextManager.sections.forEach(section => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            });
            document.querySelector('.start-button').classList.add('visible');
            document.getElementById('skip-button').style.display = 'none';
        },

        startGame() {
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = 'game.html';
            }, 1000);
        }
    };

    // Fonction d'initialisation principale
    function initializeGame() {
        AmbianceManager.init();
        TextManager.init();
        InteractionManager.init();
    }
    

    // Lancement de l'application
    initializeGame();
});
