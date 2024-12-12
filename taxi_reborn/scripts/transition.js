// Gestionnaire de transition entre les pages
class PageTransitionManager {
    constructor() {
        this.initialize();
        // Nous gardons une trace de l'état de la transition
        this.isTransitioning = false;
    }

    initialize() {
        // Création et injection de l'élément de transition
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
        // Gestion des clics sur les éléments de navigation
        document.querySelectorAll('[data-navigate]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isTransitioning) {
                    const target = e.currentTarget.getAttribute('data-navigate');
                    this.executeTransition(target);
                }
            });
        });

        // Écouteur pour les animations
        this.transitionElement.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform') {
                this.handleTransitionPhase();
            }
        });
    }

    async executeTransition(targetUrl) {
        this.isTransitioning = true;
        this.targetUrl = targetUrl;
        this.currentPhase = 'descending';
        
        // Phase 1 : Descente
        this.transitionElement.classList.add('transitioning-down');
    }

    handleTransitionPhase() {
        switch (this.currentPhase) {
            case 'descending':
                // Une fois la descente terminée, attendre 1 seconde
                this.currentPhase = 'waiting';
                setTimeout(() => {
                    this.currentPhase = 'ascending';
                    this.transitionElement.classList.add('transitioning-up');
                    // Changer de page pendant que la transition remonte
                    window.location.href = this.targetUrl;
                }, 1000);
                break;
                
            case 'ascending':
                this.isTransitioning = false;
                this.currentPhase = null;
                break;
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.pageTransition = new PageTransitionManager();
});