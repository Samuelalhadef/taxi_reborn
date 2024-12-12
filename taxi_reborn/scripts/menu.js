// ====================================
// Configuration du jeu
// ====================================
const GAME_CONFIG = {
    LOADING: {
        MIN_DURATION: 2000,    // Durée minimale de l'écran de chargement (ms)
        MAX_DURATION: 4000,    // Durée maximale de l'écran de chargement (ms)
        FADE_DURATION: 1000    // Durée de la transition de fondu (ms)
    },
    AUDIO: {
        FADE_DURATION: 800,    // Durée des fondus sonores (ms)
        VOLUMES: {
            BACKGROUND: 0.4,   // Volume de la musique de fond
            RAIN: 0.3,        // Volume de la pluie
            NEON: 0.2         // Volume des effets néon
        }
    },
    EFFECTS: {
        RAIN: {
            DROPS: 100,        // Nombre de gouttes de pluie
            MIN_SPEED: 0.8,    // Vitesse minimale des gouttes
            MAX_SPEED: 1.5     // Vitesse maximale des gouttes
        },
        NEON: {
            FLICKER_CHANCE: 0.05,      // Probabilité de scintillement
            FLICKER_DURATION: 50,      // Durée du scintillement (ms)
            DISTORTION_CHANCE: 0.1,    // Probabilité de distorsion
            DISTORTION_DURATION: 100    // Durée de la distorsion (ms)
        }
    }
};

// État global du jeu
const GameState = {
    isLoading: true,          // État du chargement
    isSoundInitialized: false,// État de l'initialisation audio
    isSoundEnabled: true,     // État du son
    isInitialized: false      // État global d'initialisation
};

// ====================================
// Système de chargement
// ====================================
class LoadingManager {
    constructor() {
        this.screen = document.getElementById('loadingScreen');
        this.progressText = document.querySelector('.loading-progress');
        this.gameContainer = document.querySelector('.game-container');
        this.progress = 0;
        this.startTime = null;
    }

    async initialize() {
        this.startTime = Date.now();
        await this.simulateLoading();
        await this.transitionToGame();
    }

    async simulateLoading() {
        return new Promise(resolve => {
            const updateProgress = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - this.startTime;
                
                // Calcul du progrès avec une part aléatoire
                this.progress = Math.min(
                    (elapsed / GAME_CONFIG.LOADING.MAX_DURATION) * 100 + (Math.random() * 2),
                    100
                );
                
                // Mise à jour de l'affichage
                this.progressText.textContent = `${Math.floor(this.progress)}%`;

                if (this.progress < 100 && elapsed < GAME_CONFIG.LOADING.MAX_DURATION) {
                    requestAnimationFrame(updateProgress);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(updateProgress);
        });
    }

    async transitionToGame() {
        // Assure une durée minimale de chargement
        const remainingTime = Math.max(
            0,
            GAME_CONFIG.LOADING.MIN_DURATION - (Date.now() - this.startTime)
        );

        await new Promise(resolve => setTimeout(resolve, remainingTime));

        // Transition en fondu
        this.screen.style.opacity = '0';
        this.gameContainer.style.display = 'block';
        
        await new Promise(resolve => 
            setTimeout(resolve, GAME_CONFIG.LOADING.FADE_DURATION)
        );

        this.screen.style.display = 'none';
        GameState.isLoading = false;
    }
}

// ====================================
// Système audio
// ====================================
class AudioManager {
    constructor() {
        this.context = null;
        this.sounds = this.initializeSounds();
        this.button = document.getElementById('audioButton');
        this.setupListeners();
    }

    initializeSounds() {
        return {
            background: this.createSound('backgroundMusic', true),
            rain: this.createSound('rainSound', true),
            neon: this.createSound('neonSound', false)
        };
    }

    createSound(id, isLooping) {
        const element = document.getElementById(id);
        const volumeKey = id.replace('Music', '').replace('Sound', '').toUpperCase();
        
        return {
            element,
            defaultVolume: GAME_CONFIG.AUDIO.VOLUMES[volumeKey],
            isLooping,
            isPlaying: false
        };
    }

    setupListeners() {
        this.button.addEventListener('click', () => this.toggleAudio());
        document.addEventListener('click', () => this.initialize(), { once: true });
    }

    async initialize() {
        if (GameState.isSoundInitialized) return;

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        await this.startAmbientSounds();
        GameState.isSoundInitialized = true;
    }

    async startAmbientSounds() {
        const loopingSounds = Object.values(this.sounds).filter(sound => sound.isLooping);
        
        for (const sound of loopingSounds) {
            sound.element.volume = 0;
            await this.fadeSound(sound, true);
            sound.element.play();
            sound.isPlaying = true;
        }
    }

    async fadeSound(sound, fadeIn) {
        const startVolume = fadeIn ? 0 : sound.defaultVolume;
        const endVolume = fadeIn ? sound.defaultVolume : 0;
        
        return new Promise(resolve => {
            const startTime = Date.now();
            
            const updateVolume = () => {
                const progress = Math.min(
                    (Date.now() - startTime) / GAME_CONFIG.AUDIO.FADE_DURATION,
                    1
                );
                
                sound.element.volume = startVolume + (endVolume - startVolume) * progress;
                
                if (progress < 1) {
                    requestAnimationFrame(updateVolume);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(updateVolume);
        });
    }

    async toggleAudio() {
        if (!GameState.isSoundInitialized) {
            await this.initialize();
            return;
        }

        GameState.isSoundEnabled = !GameState.isSoundEnabled;
        this.button.classList.toggle('sound-off', !GameState.isSoundEnabled);

        const promises = Object.values(this.sounds)
            .filter(sound => sound.isLooping)
            .map(async sound => {
                if (GameState.isSoundEnabled) {
                    sound.element.play();
                    await this.fadeSound(sound, true);
                } else {
                    await this.fadeSound(sound, false);
                    sound.element.pause();
                }
            });

        await Promise.all(promises);
        this.animateButton();
    }

    animateButton() {
        this.button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.button.style.transform = 'scale(1)';
        }, 100);
    }

    playNeonSound() {
        if (!GameState.isSoundEnabled) return;

        const neon = this.sounds.neon;
        neon.element.volume = neon.defaultVolume * (0.8 + Math.random() * 0.4);
        neon.element.currentTime = 0;
        neon.element.play();
    }
}

// ====================================
// Système d'effets visuels
// ====================================
class EffectsManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.title = document.querySelector('.neon-title');
        this.originalText = this.title.textContent;
        this.rainContainer = document.querySelector('.rain');
        
        this.initializeEffects();
    }

    initializeEffects() {
        this.createRaindrops();
        this.startNeonEffects();
    }

    createRaindrops() {
        for (let i = 0; i < GAME_CONFIG.EFFECTS.RAIN.DROPS; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            
            // Position et animation aléatoires
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${this.getRandomSpeed()}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            
            this.rainContainer.appendChild(drop);
        }
    }

    getRandomSpeed() {
        const { MIN_SPEED, MAX_SPEED } = GAME_CONFIG.EFFECTS.RAIN;
        return MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
    }

    startNeonEffects() {
        setInterval(() => this.updateNeonGlitch(), 200);
        setInterval(() => this.updateNeonDistortion(), 100);
    }

    updateNeonGlitch() {
        if (Math.random() < GAME_CONFIG.EFFECTS.NEON.FLICKER_CHANCE) {
            const glitchedText = this.originalText
                .split('')
                .map(char => Math.random() < 0.3 ? '!' : char)
                .join('');

            this.title.textContent = glitchedText;
            this.audioManager.playNeonSound();
            
            setTimeout(() => {
                this.title.textContent = this.originalText;
            }, GAME_CONFIG.EFFECTS.NEON.FLICKER_DURATION);
        }
    }

    updateNeonDistortion() {
        if (Math.random() < GAME_CONFIG.EFFECTS.NEON.DISTORTION_CHANCE) {
            this.title.style.transform = `skew(${Math.random() * 4 - 2}deg)`;
            
            setTimeout(() => {
                this.title.style.transform = 'skew(0deg)';
            }, GAME_CONFIG.EFFECTS.NEON.DISTORTION_DURATION);
        }
    }
}

// ====================================
// Gestionnaire d'événements
// ====================================
class EventManager {
    constructor() {
        this.initializeMouseEffects();
        this.initializeButtons();
    }

    initializeMouseEffects() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    handleMouseMove(event) {
        const x = event.clientX / window.innerWidth;
        const y = event.clientY / window.innerHeight;
        
        document.documentElement.style.setProperty('--mouse-x', x.toString());
        document.documentElement.style.setProperty('--mouse-y', y.toString());
    }

    initializeButtons() {
        document.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', () => this.handleButtonClick(button));
        });
    }

    handleButtonClick(button) {
        const destination = button.getAttribute('data-navigate');
        if (destination) {
            window.location.href = destination;
        }
    }
}

// ====================================
// Initialisation du jeu
// ====================================
async function initializeGame() {
    if (GameState.isInitialized) return;

    try {
        const loading = new LoadingManager();
        await loading.initialize();

        const audio = new AudioManager();
        const effects = new EffectsManager(audio);
        const events = new EventManager();

        GameState.isInitialized = true;
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error during game initialization:', error);
    }
}

// Démarrage au chargement de la page
document.addEventListener('DOMContentLoaded', initializeGame);