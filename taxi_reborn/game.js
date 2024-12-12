const CONFIG = {
    INITIAL_MONEY: 1250,
    INITIAL_MENTAL_HEALTH: 100,
    RADIO_STATIONS: [
        { frequency: 88.1, name: "Radio Jazz", genre: "Jazz" },
        { frequency: 91.3, name: "Radio Classique", genre: "Classique" },
        { frequency: 95.7, name: "Radio Rock", genre: "Rock" },
        { frequency: 98.2, name: "Radio Pop", genre: "Pop" },
        { frequency: 103.5, name: "Radio News", genre: "Actualités" }
    ],
    MENTAL_HEALTH_DECAY_RATE: 0.5,
    MIN_RIDE_PRICE: 15,
    MAX_RIDE_PRICE: 80
};

// Gestion de l'état global du jeu
class GameState {
    constructor() {
        this.money = CONFIG.INITIAL_MONEY;
        this.mentalHealth = CONFIG.INITIAL_MENTAL_HEALTH;
        this.currentLocation = "Paris, 75001";
        this.activeRides = [];
        this.currentRide = null;
        this.workingHours = 0;
        
        // Initialiser les mises à jour périodiques
        this.startPeriodicUpdates();
    }

    // Mise à jour périodique de l'état du jeu
    startPeriodicUpdates() {
        setInterval(() => {
            if (this.currentRide) {
                this.mentalHealth -= CONFIG.MENTAL_HEALTH_DECAY_RATE;
                this.updateUI();
            }
        }, 1000);
    }

    // Mise à jour de l'interface utilisateur
    updateUI() {
        document.querySelector('.money span').textContent = `${this.money.toFixed(2)} €`;
        document.querySelector('.health-fill').style.width = `${this.mentalHealth}%`;
        
        // Changer la couleur de la barre de santé mentale selon le niveau
        const healthBar = document.querySelector('.health-fill');
        if (this.mentalHealth < 30) {
            healthBar.style.backgroundColor = '#ff3333';
        } else if (this.mentalHealth < 60) {
            healthBar.style.backgroundColor = '#ffff33';
        }
    }

    // Ajouter de l'argent au compteur
    addMoney(amount) {
        this.money += amount;
        this.updateUI();
    }

    // Réduire la santé mentale
    reduceMentalHealth(amount) {
        this.mentalHealth = Math.max(0, this.mentalHealth - amount);
        this.updateUI();
        
        if (this.mentalHealth <= 0) {
            this.gameOver("Épuisement mental");
        }
    }

    // Fin de partie
    gameOver(reason) {
        alert(`Fin de partie : ${reason}\nArgent final : ${this.money.toFixed(2)} €`);
        location.reload();
    }
}

// Gestion de la radio
class RadioKnobController {
    constructor() {
        this.currentRotation = 0;
        this.isDragging = false;
        this.startAngle = 0;
        this.currentFrequency = 88.0;
        this.minFrequency = 88.0;
        this.maxFrequency = 108.0;
        
        // Créer les éléments du bouton
        this.createKnobElements();
        // Initialiser les événements
        this.initializeEvents();
        // Mise à jour initiale de l'affichage
        this.updateDisplay();
    }

    createKnobElements() {
        // Créer le conteneur du bouton
        const container = document.createElement('div');
        container.className = 'radio-knob-container';
        
        // Créer l'échelle graduée
        const scale = document.createElement('div');
        scale.className = 'radio-knob-scale';
        
        // Ajouter les graduations numérotées
        for (let i = 88; i <= 108; i += 2) {
            const number = document.createElement('div');
            number.className = 'frequency-number';
            number.textContent = i;
            
            // Calculer la position du numéro
            const angle = this.mapFrequencyToAngle(i);
            const radius = 45; // Rayon pour les numéros
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            
            number.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
            scale.appendChild(number);
        }
        
        // Créer le bouton rotatif
        const knob = document.createElement('div');
        knob.className = 'radio-knob';
        
        // Assembler les éléments
        container.appendChild(scale);
        container.appendChild(knob);
        
        // Remplacer l'ancien élément input par notre nouveau bouton
        const oldKnob = document.querySelector('.frequency-knob');
        oldKnob.parentNode.replaceChild(container, oldKnob);
        
        this.knob = knob;
    }

    initializeEvents() {
        // Événement pour le début du drag
        this.knob.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const rect = this.knob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculer l'angle initial
            this.startAngle = this.calculateAngle(centerX, centerY, e.clientX, e.clientY);
            
            // Empêcher la sélection de texte pendant le drag
            e.preventDefault();
        });
        
        // Événement pour le drag
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const rect = this.knob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculer le nouvel angle
            const currentAngle = this.calculateAngle(centerX, centerY, e.clientX, e.clientY);
            let deltaAngle = currentAngle - this.startAngle;
            
            // Ajuster la rotation
            this.currentRotation += deltaAngle;
            // Limiter la rotation
            this.currentRotation = Math.max(-150, Math.min(150, this.currentRotation));
            
            // Mettre à jour la position du bouton
            this.knob.style.transform = `rotate(${this.currentRotation}deg)`;
            
            // Calculer et mettre à jour la fréquence
            this.currentFrequency = this.mapAngleToFrequency(this.currentRotation);
            this.updateDisplay();
            
            this.startAngle = currentAngle;
        });
        
        // Événement pour la fin du drag
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    calculateAngle(centerX, centerY, mouseX, mouseY) {
        return Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
    }

    mapFrequencyToAngle(frequency) {
        // Convertir la fréquence (88-108) en angle (-150 à 150)
        return -150 + (frequency - 88) * (300 / 20);
    }

    mapAngleToFrequency(angle) {
        // Convertir l'angle (-150 à 150) en fréquence (88-108)
        return 88 + (angle + 150) * (20 / 300);
    }

    updateDisplay() {
        // Mettre à jour l'affichage de la fréquence
        const frequencyDisplay = document.querySelector('.frequency-display');
        if (frequencyDisplay) {
            frequencyDisplay.textContent = `${this.currentFrequency.toFixed(1)} MHz`;
        }
        
        // Trouver et afficher la station la plus proche
        const nearestStation = this.findNearestStation(this.currentFrequency);
        const stationName = document.querySelector('.station-name');
        if (stationName && nearestStation) {
            stationName.textContent = nearestStation.name;
        }
    }

    findNearestStation(frequency) {
        return CONFIG.RADIO_STATIONS.reduce((closest, current) => {
            return Math.abs(current.frequency - frequency) < Math.abs(closest.frequency - frequency) 
                ? current 
                : closest;
        });
    }
}

// Modification de la classe RadioController
class RadioController {
    constructor() {
        this.currentStation = null;
        this.isPlaying = false;
        this.knobController = new RadioKnobController();
        this.initializeControls();
    }}

// Gestion du téléphone et des courses
class PhoneController {
    constructor(gameState) {
        this.gameState = gameState;
        this.isExpanded = false;
        this.rides = [];
        this.initializePhone();
    }

    initializePhone() {
        // Événement pour ouvrir/fermer le téléphone
        document.querySelector('.phone-preview').addEventListener('click', () => {
            this.togglePhone();
        });

        // Générer de nouvelles courses périodiquement
        this.generateNewRides();
        setInterval(() => this.generateNewRides(), 30000);
    }

    togglePhone() {
        this.isExpanded = !this.isExpanded;
        document.querySelector('.phone-expanded').hidden = !this.isExpanded;
    }

    generateNewRides() {
        // Générer des courses aléatoires
        const newRides = Array.from({length: 3}, () => this.generateRide());
        this.rides = [...this.rides, ...newRides].slice(0, 5); // Garder max 5 courses
        this.updateRidesList();
    }

    generateRide() {
        const destinations = ["Aéroport CDG", "Gare du Nord", "Tour Eiffel", "Arc de Triomphe", "Montmartre"];
        const clientTypes = [
            { type: "Homme d'affaires", preferences: { music: "Classique", speed: "Modérée" } },
            { type: "Touriste", preferences: { music: "Pop", speed: "Lente" } },
            { type: "Étudiant", preferences: { music: "Rock", speed: "Rapide" } }
        ];

        const client = clientTypes[Math.floor(Math.random() * clientTypes.length)];
        const destination = destinations[Math.floor(Math.random() * destinations.length)];
        const distance = Math.floor(Math.random() * 20) + 5;
        const price = Math.floor(distance * (Math.random() * 2 + 2));

        return {
            id: Date.now() + Math.random(),
            client: client.type,
            preferences: client.preferences,
            destination,
            distance,
            price,
            pickupTime: this.generatePickupTime()
        };
    }

    generatePickupTime() {
        const now = new Date();
        const minutes = Math.floor(Math.random() * 30) + 5;
        now.setMinutes(now.getMinutes() + minutes);
        return now.toLocaleTimeString().slice(0, -3);
    }

    updateRidesList() {
        const ridesList = document.querySelector('.rides-list');
        ridesList.innerHTML = '';

        this.rides.forEach(ride => {
            const rideElement = document.createElement('article');
            rideElement.className = 'ride-preview';
            rideElement.innerHTML = `
                <div class="ride-basic-info">
                    <span class="pickup">${this.gameState.currentLocation}</span>
                    <span class="arrow">→</span>
                    <span class="destination">${ride.destination}</span>
                    <span class="estimated-price">${ride.price} €</span>
                </div>
            `;

            rideElement.addEventListener('click', () => {
                this.showRideDetails(ride);
            });

            ridesList.appendChild(rideElement);
        });

        // Mettre à jour le badge de notification
        document.querySelector('.notification-badge').textContent = this.rides.length;
    }

    showRideDetails(ride) {
        const rideDetails = document.querySelector('.ride-details');
        rideDetails.hidden = false;
        rideDetails.innerHTML = `
            <div class="client-profile">
                <img src="/api/placeholder/120/120" alt="Client" />
                <h3>${ride.client}</h3>
                <p class="client-description">
                    Préfère la musique ${ride.preferences.music}<br>
                    Vitesse souhaitée: ${ride.preferences.speed}<br>
                    Distance: ${ride.distance} km
                </p>
            </div>
            <div class="ride-specific-info">
                <p class="pickup-time">Départ : ${ride.pickupTime}</p>
                <p class="estimated-duration">Durée estimée : ${Math.floor(ride.distance * 2)} min</p>
                <p class="distance">Distance : ${ride.distance} km</p>
            </div>
            <div class="action-buttons">
                <button class="accept-ride">Accepter (${ride.price} €)</button>
                <button class="decline-ride">Refuser</button>
            </div>
        `;

        // Gérer l'acceptation ou le refus de la course
        rideDetails.querySelector('.accept-ride').addEventListener('click', () => {
            this.acceptRide(ride);
        });

        rideDetails.querySelector('.decline-ride').addEventListener('click', () => {
            this.declineRide(ride);
        });
    }

    acceptRide(ride) {
        this.gameState.addMoney(ride.price);
        this.gameState.reduceMentalHealth(ride.distance * 0.5);
        this.rides = this.rides.filter(r => r.id !== ride.id);
        this.updateRidesList();
        
        alert(`Course acceptée ! Vous avez gagné ${ride.price} €`);
        document.querySelector('.ride-details').hidden = true;
    }

    declineRide(ride) {
        this.rides = this.rides.filter(r => r.id !== ride.id);
        this.updateRidesList();
        document.querySelector('.ride-details').hidden = true;
    }
}

// Gestion de la carte GPS
class GPSController {
    constructor(gameState) {
        this.gameState = gameState;
        this.initializeMap();
    }

    initializeMap() {
        // Ici, vous pourriez initialiser Google Maps
        // Pour cet exemple, nous utilisons une image statique
        this.updateLocation(this.gameState.currentLocation);
    }

    updateLocation(location) {
        document.querySelector('.current-location').textContent = location;
    }
}

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const radio = new RadioController();
    const phone = new PhoneController(gameState);
    const gps = new GPSController(gameState);
});