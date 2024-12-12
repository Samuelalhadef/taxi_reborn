// Gestionnaire de navigation pour le jeu
class GameNavigationManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Création de l'élément de transition
        const transitionHTML = `
            <div class="page-transition">
                <div class="taxi-pattern"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', transitionHTML);
        
        this.transitionElement = document.querySelector('.page-transition');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Écoute le clic sur le bouton "Prendre la route"
        const playButton = document.querySelector('.play-button');
        if (playButton) {
            playButton.addEventListener('click', () => this.startGameTransition());
        }

        // Gestion des phases de la transition
        this.transitionElement.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform') {
                this.handleTransitionPhase();
            }
        });
    }

    startGameTransition() {
        // Désactive le bouton pendant la transition
        const playButton = document.querySelector('.play-button');
        if (playButton) {
            playButton.disabled = true;
        }

        // Commence la transition
        this.currentPhase = 'descending';
        this.transitionElement.classList.add('transitioning-down');

        // Ajoute un effet visuel au bouton
        if (playButton) {
            playButton.classList.add('button-clicked');
        }
    }

    handleTransitionPhase() {
        switch (this.currentPhase) {
            case 'descending':
                // Pause d'une seconde une fois descendu
                this.currentPhase = 'waiting';
                setTimeout(() => {
                    this.currentPhase = 'ascending';
                    this.transitionElement.classList.add('transitioning-up');
                    // Rediriger vers la page du jeu
                    window.location.href = 'regles.html';
                }, 1000);
                break;
        }
    }
}

// Les styles CSS nécessaires pour la transition
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    /* Conteneur de transition */
    .page-transition {
        position: fixed;
        top: -100%;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        pointer-events: none;
    }

    /* Motif taxi */
    .taxi-pattern {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, 
            #FFD700 0%,
            #FFD700 90%
        );
    }

    /* Bande damier */
    .taxi-pattern::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background-image: 
            linear-gradient(45deg, #000 25%, transparent 25%),
            linear-gradient(-45deg, #000 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #000 75%),
            linear-gradient(-45deg, transparent 75%, #000 75%);
        background-size: 50px 50px;
        background-position: 0 0, 0 25px, 25px -25px, -25px 0px;
        animation: patternScroll 1s linear infinite;
    }

    /* Animation de la transition */
    .transitioning-down {
        transform: translateY(100%);
        transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1);
    }

    .transitioning-up {
        transform: translateY(200%);
        transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1);
    }

    /* Animation du damier */
    @keyframes patternScroll {
        to {
            background-position: 50px 0, 50px 25px, 75px -25px, 25px 0px;
        }
    }

    /* Animation du bouton lors du clic */
    .button-clicked {
        transform: scale(0.95);
        opacity: 0.8;
        transition: all 0.3s ease;
    }
`;

document.head.appendChild(styleSheet);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const navigationManager = new GameNavigationManager();
});