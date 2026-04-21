// Global variables for app state
let currentUser = {};
let trackingData = {
    location: { lat: 0, lng: 0 },
    heartRate: 72,
    isTracking: false,
    battery: 95,
    speed: 0,
    altitude: 0,
    direction: 0
};
let emergencyActive = false;
let trackingInterval = null;
let heartRateInterval = null;

// Utility Functions
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    
    // Initialize screen-specific functionality
    initializeScreen(screenId);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function generateDID() {
    const randomHex = () => Math.random().toString(16).substr(2, 8);
    return `did:ethr:0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function getRandomLocation() {
    // Simulate GPS coordinates around Chennai, Tamil Nadu
    const baseLat = 13.0827;
    const baseLng = 80.2707;
    const variance = 0.1;
    
    return {
        lat: baseLat + (Math.random() - 0.5) * variance,
        lng: baseLng + (Math.random() - 0.5) * variance
    };
}

// Screen Initialization Functions
function initializeScreen(screenId) {
    switch(screenId) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'tracking':
            initializeTracking();
            break;
        case 'profile':
            initializeProfile();
            break;
        case 'emergency':
            initializeEmergency();
            break;
    }
}

function initializeDashboard() {
    if (currentUser.name) {
        document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}!`;
    }
    
    // Start location tracking
    if (navigator.geolocation && !trackingData.isTracking) {
        startLocationTracking();
    } else {
        // Simulate location for demo
        simulateLocation();
    }
    
    // Start heart rate monitoring
    startHeartRateMonitoring();
    
    updateDashboardStatus();
}

function initializeTracking() {
    updateTrackingData();
    // Start real-time data updates
    if (!trackingInterval) {
        trackingInterval = setInterval(updateTrackingData, 2000);
    }
}

function initializeProfile() {
    document.getElementById('profileName').textContent = currentUser.name || '--';
    document.getElementById('profileEmail').textContent = currentUser.email || '--';
    document.getElementById('profilePhone').textContent = currentUser.phone || '--';
    document.getElementById('profileNationality').textContent = currentUser.nationality || '--';
    document.getElementById('profileDID').textContent = currentUser.did || '--';
    document.getElementById('registrationDate').textContent = currentUser.registrationDate || '--';
}

function initializeEmergency() {
    const now = new Date();
    document.getElementById('emergencyTime').textContent = `Emergency activated at: ${formatTime(now)}`;
    
    // Simulate emergency response
    setTimeout(() => {
        document.getElementById('responseTeam').textContent = 'Mountain Rescue Team #7 dispatched';
    }, 2000);
    
    setTimeout(() => {
        document.getElementById('rescueETA').textContent = '12-15 minutes';
    }, 4000);
    
    // Update location
    if (trackingData.location.lat && trackingData.location.lng) {
        document.getElementById('emergencyLocation').textContent = 
            `${trackingData.location.lat.toFixed(4)}, ${trackingData.location.lng.toFixed(4)}`;
    }
}

// Registration Process
function processRegistration() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Store user data
    currentUser = {
        name: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        nationality: formData.get('nationality'),
        emergencyContact: formData.get('emergencyContact'),
        registrationDate: new Date().toLocaleDateString()
    };
    
    showToast('Registration data captured successfully!');
    showScreen('documentScan');
}

// Document Scanning Simulation
function startDocumentScan() {
    const progressFill = document.getElementById('progressFill');
    const scanStatus = document.getElementById('scanStatus');
    const scanBtn = document.getElementById('scanBtn');
    
    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning...';
    
    let progress = 0;
    const scanInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        progressFill.style.width = Math.min(progress, 100) + '%';
        
        if (progress < 30) {
            scanStatus.textContent = 'Detecting document...';
        } else if (progress < 60) {
            scanStatus.textContent = 'Processing OCR...';
        } else if (progress < 90) {
            scanStatus.textContent = 'Extracting data...';
        } else if (progress >= 100) {
            scanStatus.textContent = 'Document verified successfully!';
            clearInterval(scanInterval);
            
            // Generate blockchain DID
            currentUser.did = generateDID();
            
            showToast('Document scan complete!');
            setTimeout(() => {
                showScreen('qrCode');
                generateQRCode();
            }, 1500);
        }
    }, 300);
}

function generateQRCode() {
    // Simulate QR code generation
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    qrPlaceholder.innerHTML = '<div class="qr-grid"></div>';
    
    // Display DID
    document.getElementById('didCode').textContent = currentUser.did;
    
    showToast('Blockchain DID created successfully!');
}

function toggleTracker() {
    const trackerEnabled = document.getElementById('trackerEnabled').checked;
    if (trackerEnabled) {
        showToast('IoT tracker enabled - Enhanced monitoring active');
        trackingData.isTracking = true;
    } else {
        showToast('Using smartphone GPS only', 'warning');
    }
}

// Location and Tracking Functions
function startLocationTracking() {
    if (navigator.geolocation) {
        trackingData.isTracking = true;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                trackingData.location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateDashboardStatus();
            },
            () => {
                showToast('Location access denied - using simulated GPS', 'warning');
                simulateLocation();
            }
        );
        
        navigator.geolocation.watchPosition(
            (position) => {
                trackingData.location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateDashboardStatus();
            },
            null,
            { enableHighAccuracy: true, maximumAge: 10000 }
        );
    } else {
        simulateLocation();
    }
}

function simulateLocation() {
    trackingData.location = getRandomLocation();
    trackingData.isTracking = true;
    
    // Simulate movement
    setInterval(() => {
        if (trackingData.isTracking && !emergencyActive) {
            const variation = 0.0001;
            trackingData.location.lat += (Math.random() - 0.5) * variation;
            trackingData.location.lng += (Math.random() - 0.5) * variation;
            trackingData.speed = Math.random() * 5 + 1; // 1-6 km/h
            trackingData.altitude = Math.random() * 50 + 100; // 100-150m
            trackingData.direction = Math.random() * 360;
        }
    }, 5000);
}

function updateDashboardStatus() {
    if (trackingData.location.lat && trackingData.location.lng) {
        document.getElementById('currentLocation').textContent = 
            `${trackingData.location.lat.toFixed(4)}, ${trackingData.location.lng.toFixed(4)}`;
    }
    
    document.getElementById('heartRate').textContent = `${trackingData.heartRate} bpm`;
    document.getElementById('batteryLevel').textContent = `${trackingData.battery}%`;
    
    // Simulate battery drain
    if (trackingData.battery > 20) {
        trackingData.battery -= 0.1;
    }
}

function startHeartRateMonitoring() {
    if (!heartRateInterval) {
        heartRateInterval = setInterval(() => {
            if (!emergencyActive) {
                // Normal heart rate variation
                trackingData.heartRate = 65 + Math.random() * 20;
            }
            updateDashboardStatus();
        }, 3000);
    }
}

function updateTrackingData() {
    document.getElementById('gpsCoords').textContent = 
        `${trackingData.location.lat.toFixed(6)}, ${trackingData.location.lng.toFixed(6)}`;
    document.getElementById('altitude').textContent = `${trackingData.altitude.toFixed(1)} m`;
    document.getElementById('speed').textContent = `${trackingData.speed.toFixed(1)} km/h`;
    document.getElementById('direction').textContent = `${trackingData.direction.toFixed(0)}°`;
    document.getElementById('currentHR').textContent = `${trackingData.heartRate.toFixed(0)} bpm`;
    
    // Determine activity type based on speed
    let activity = 'Stationary';
    if (trackingData.speed > 0.5 && trackingData.speed < 2) {
        activity = 'Walking';
    } else if (trackingData.speed >= 2 && trackingData.speed < 6) {
        activity = 'Hiking';
    } else if (trackingData.speed >= 6) {
        activity = 'Running';
    }
    document.getElementById('activityType').textContent = activity;
}

// Emergency Functions
function triggerEmergency() {
    if (emergencyActive) {
        return;
    }
    
    emergencyActive = true;
    
    // Simulate emergency conditions
    trackingData.heartRate = 120 + Math.random() * 20; // Elevated heart rate
    trackingData.speed = 0; // Sudden stop
    
    showToast('EMERGENCY SOS ACTIVATED!', 'error');
    showScreen('emergency');
    
    // Simulate blockchain evidence capture
    setTimeout(() => {
        showToast('Evidence captured and secured on blockchain', 'warning');
    }, 2000);
    
    // Simulate smart contract fund reservation
    setTimeout(() => {
        showToast('Emergency funds reserved via smart contract');
    }, 3000);
}

function contactEmergencyServices() {
    showToast('Connecting to emergency services...');
    // In a real app, this would initiate a call
    setTimeout(() => {
        showToast('Emergency services contacted successfully!');
    }, 2000);
}

function cancelEmergency() {
    if (confirm('Are you sure you want to cancel the emergency alert?')) {
        emergencyActive = false;
        trackingData.heartRate = 72; // Reset to normal
        showToast('Emergency alert cancelled');
        showScreen('dashboard');
    }
}

// Risk Assessment Simulation
function assessRisk() {
    const currentHour = new Date().getHours();
    const isDusk = currentHour >= 18 || currentHour <= 6;
    const isHighAltitude = trackingData.altitude > 200;
    const isElevatedHR = trackingData.heartRate > 100;
    const isStationary = trackingData.speed < 0.5;
    
    let riskLevel = 'safe';
    let riskFactors = [];
    
    if (isDusk) {
        riskFactors.push('nightfall');
    }
    if (isHighAltitude) {
        riskFactors.push('high altitude');
    }
    if (isElevatedHR && isStationary) {
        riskFactors.push('elevated heart rate with no movement');
    }
    
    if (riskFactors.length >= 2) {
        riskLevel = 'danger';
    } else if (riskFactors.length === 1) {
        riskLevel = 'warning';
    }
    
    const safetyElement = document.getElementById('safetyLevel');
    if (safetyElement) {
        safetyElement.textContent = riskLevel === 'safe' ? 'Safe' : 
                                   riskLevel === 'warning' ? 'Caution' : 'High Risk';
        safetyElement.className = `status-value ${riskLevel}`;
    }
    
    // Auto-trigger emergency in high-risk situations (for demo)
    if (riskLevel === 'danger' && !emergencyActive && Math.random() > 0.95) {
        setTimeout(() => {
            if (document.getElementById('autoSOS')?.checked) {
                showToast('Auto SOS triggered due to high risk factors', 'error');
                triggerEmergency();
            }
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start risk assessment
    setInterval(assessRisk, 10000);
    
    // Simulate MQTT/Kafka connection status
    setInterval(() => {
        const mqttStatus = document.getElementById('mqttStatus');
        const kafkaStatus = document.getElementById('kafkaStatus');
        
        if (mqttStatus && kafkaStatus) {
            // Occasionally simulate connection issues
            if (Math.random() > 0.95) {
                mqttStatus.innerHTML = '<span class="indicator-dot" style="background: #ffc107;"></span>MQTT: Reconnecting...';
                setTimeout(() => {
                    mqttStatus.innerHTML = '<span class="indicator-dot"></span>MQTT: Connected';
                }, 3000);
            }
        }
    }, 15000);
    
    // Simulate data streaming
    setInterval(() => {
        if (trackingData.isTracking) {
            // Simulate sending data to backend
            console.log('Streaming data to MQTT/Kafka:', {
                location: trackingData.location,
                heartRate: trackingData.heartRate,
                timestamp: new Date().toISOString()
            });
        }
    }, 5000);
});

// Cleanup intervals when leaving tracking screen
window.addEventListener('beforeunload', function() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }
    if (heartRateInterval) {
        clearInterval(heartRateInterval);
    }
});

// Demo functions for hackathon presentation
function demoEmergencyScenario() {
    // Simulate a realistic emergency scenario
    trackingData.location = { lat: 13.1234, lng: 80.2567 }; // Hill trail location
    trackingData.heartRate = 140; // Panic level
    trackingData.speed = 0; // Sudden stop
    
    showToast('DEMO: Simulating emergency scenario...', 'warning');
    
    setTimeout(() => {
        triggerEmergency();
    }, 2000);
}

function resetDemo() {
    // Reset all demo data
    emergencyActive = false;
    trackingData = {
        location: getRandomLocation(),
        heartRate: 72,
        isTracking: true,
        battery: 95,
        speed: 1.2,
        altitude: 120,
        direction: 180
    };
    
    showToast('Demo reset complete');
    showScreen('welcome');
}

// Initial screen
showScreen('welcome');

