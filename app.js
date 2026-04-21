// Global State Management
let dashboardState = {
    tourists: [],
    teams: [],
    alerts: [],
    selectedTourist: null,
    selectedAlert: null,
    activeEmergency: null,
    mapLayers: {
        tourists: true,
        teams: true,
        zones: true,
        cameras: false
    }
};

// Sample Data Generation
function generateSampleData() {
    // Generate sample tourists
    const touristNames = [
        'Sarah Johnson', 'Mike Chen', 'Elena Rodriguez', 'David Kim',
        'Anna Petrov', 'James Wilson', 'Lisa Anderson', 'Carlos Silva',
        'Yuki Tanaka', 'Ahmed Hassan', 'Sophie Martin', 'Lucas Brown'
    ];

    const locations = [
        { lat: 13.0827, lng: 80.2707, name: 'Marina Beach Trail' },
        { lat: 13.0878, lng: 80.2785, name: 'Lighthouse Point' },
        { lat: 13.0756, lng: 80.2634, name: 'Fort St. George' },
        { lat: 13.0569, lng: 80.2993, name: 'Adyar River Walk' },
        { lat: 13.1067, lng: 80.2842, name: 'Kapaleeshwarar Temple' },
        { lat: 13.0475, lng: 80.2829, name: 'Santhome Beach' }
    ];

    dashboardState.tourists = touristNames.map((name, index) => {
        const location = locations[index % locations.length];
        const statusTypes = ['safe', 'warning', 'danger'];
        const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
        
        // Higher chance of safe status
        const adjustedStatus = Math.random() > 0.7 ? status : 'safe';
        
        return {
            id: `tourist_${index + 1}`,
            name: name,
            status: adjustedStatus,
            location: {
                lat: location.lat + (Math.random() - 0.5) * 0.02,
                lng: location.lng + (Math.random() - 0.5) * 0.02,
                name: location.name
            },
            heartRate: adjustedStatus === 'danger' ? 120 + Math.random() * 20 :
                       adjustedStatus === 'warning' ? 85 + Math.random() * 15 :
                       65 + Math.random() * 20,
            lastUpdate: new Date(Date.now() - Math.random() * 300000),
            battery: 20 + Math.random() * 80,
            nationality: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'KR'][Math.floor(Math.random() * 8)],
            emergencyContact: '+1-555-' + Math.floor(Math.random() * 9000 + 1000),
            did: `did:ethr:0x${Math.random().toString(16).substr(2, 40)}`
        };
    });

    // Generate sample teams
    const teamNames = [
        'Mountain Rescue Alpha', 'Coastal Guard Beta', 'Medical Response Gamma',
        'Fire & Rescue Delta', 'Emergency Response Echo', 'Search & Rescue Foxtrot',
        'Paramedic Team Golf', 'Helicopter Rescue Hotel'
    ];

    dashboardState.teams = teamNames.map((name, index) => {
        const location = locations[index % locations.length];
        const statusTypes = ['available', 'deployed', 'busy'];
        const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
        
        return {
            id: `team_${index + 1}`,
            name: name,
            status: Math.random() > 0.6 ? status : 'available',
            location: {
                lat: location.lat + (Math.random() - 0.5) * 0.03,
                lng: location.lng + (Math.random() - 0.5) * 0.03
            },
            members: 3 + Math.floor(Math.random() * 5),
            equipment: ['Medical Kit', 'Rescue Gear', 'Communication', 'Transport'][Math.floor(Math.random() * 4)],
            estimatedArrival: Math.floor(5 + Math.random() * 15) + ' min'
        };
    });

    // Generate active alerts for danger status tourists
    dashboardState.alerts = dashboardState.tourists
        .filter(tourist => tourist.status === 'danger')
        .map(tourist => ({
            id: `alert_${tourist.id}`,
            touristId: tourist.id,
            type: 'EMERGENCY',
            severity: 'HIGH',
            message: `${tourist.name} - Heart rate spike detected with sudden movement stop`,
            timestamp: new Date(Date.now() - Math.random() * 600000),
            location: tourist.location,
            autoTriggered: Math.random() > 0.5,
            evidenceCaptured: true,
            fundsReserved: true
        }));
}

// UI Update Functions
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
}

function updateAlertList() {
    const alertList = document.getElementById('alertList');
    
    if (dashboardState.alerts.length === 0) {
        alertList.innerHTML = '<div class="no-alerts">No active alerts</div>';
        return;
    }

    alertList.innerHTML = dashboardState.alerts.map(alert => `
        <div class="alert-item" onclick="selectAlert('${alert.id}')">
            <div class="alert-header">
                <span class="alert-type">${alert.type}</span>
                <span class="alert-time">${formatTime(alert.timestamp)}</span>
            </div>
            <div class="alert-details">${alert.message}</div>
        </div>
    `).join('');
}

function updateTouristList() {
    const touristList = document.getElementById('touristList');
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchTourists').value.toLowerCase();
    
    let filteredTourists = dashboardState.tourists;
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredTourists = filteredTourists.filter(tourist => tourist.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredTourists = filteredTourists.filter(tourist => 
            tourist.name.toLowerCase().includes(searchTerm)
        );
    }

    touristList.innerHTML = filteredTourists.map(tourist => `
        <div class="tourist-item ${tourist.status}" onclick="selectTourist('${tourist.id}')">
            <div class="tourist-header">
                <span class="tourist-name">${tourist.name}</span>
                <span class="tourist-status ${tourist.status}">${capitalize(tourist.status)}</span>
            </div>
            <div class="tourist-info">
                ❤️ ${Math.round(tourist.heartRate)} bpm | 🔋 ${Math.round(tourist.battery)}% | 
                📍 ${tourist.location.name}
            </div>
        </div>
    `).join('');
}

function updateTeamList() {
    const teamList = document.getElementById('teamList');
    
    teamList.innerHTML = dashboardState.teams.map(team => `
        <div class="team-item">
            <div class="team-header">
                <span class="team-name">${team.name}</span>
                <span class="team-status ${team.status}">${capitalize(team.status)}</span>
            </div>
            <div class="tourist-info">
                👥 ${team.members} members | 📦 ${team.equipment} | ⏱️ ${team.estimatedArrival}
            </div>
        </div>
    `).join('');
}

function updateMapDisplay() {
    const mapGrid = document.querySelector('.map-grid');
    let markersHTML = '';

    // Add tourist markers
    if (dashboardState.mapLayers.tourists) {
        dashboardState.tourists.forEach(tourist => {
            const x = ((tourist.location.lng - 80.2500) / 0.0500) * 100;
            const y = ((13.1100 - tourist.location.lat) / 0.0500) * 100;
            
            markersHTML += `
                <div class="map-marker tourist-${tourist.status}" 
                     style="left: ${Math.max(0, Math.min(95, x))}%; top: ${Math.max(0, Math.min(95, y))}%"
                     onclick="selectTourist('${tourist.id}')"
                     title="${tourist.name} - ${capitalize(tourist.status)}">
                    👤
                </div>
            `;
        });
    }

    // Add team markers
    if (dashboardState.mapLayers.teams) {
        dashboardState.teams.forEach(team => {
            const x = ((team.location.lng - 80.2500) / 0.0500) * 100;
            const y = ((13.1100 - team.location.lat) / 0.0500) * 100;
            
            markersHTML += `
                <div class="map-marker team-${team.status}" 
                     style="left: ${Math.max(0, Math.min(95, x))}%; top: ${Math.max(0, Math.min(95, y))}%"
                     title="${team.name} - ${capitalize(team.status)}">
                    🚑
                </div>
            `;
        });
    }

    // Add risk zones
    if (dashboardState.mapLayers.zones) {
        markersHTML += `
            <div class="risk-zone high" style="left: 20%; top: 15%; width: 15%; height: 15%; 
                 background: rgba(239, 68, 68, 0.2); border-radius: 50%; position: absolute;">
            </div>
            <div class="risk-zone medium" style="left: 60%; top: 60%; width: 20%; height: 20%; 
                 background: rgba(245, 158, 11, 0.2); border-radius: 50%; position: absolute;">
            </div>
        `;
    }

    mapGrid.innerHTML = markersHTML;
}

// Selection Functions
function selectTourist(touristId) {
    const tourist = dashboardState.tourists.find(t => t.id === touristId);
    if (!tourist) return;

    dashboardState.selectedTourist = tourist;
    showTouristDetails(tourist);
}

function selectAlert(alertId) {
    const alert = dashboardState.alerts.find(a => a.id === alertId);
    if (!alert) return;

    dashboardState.selectedAlert = alert;
    const tourist = dashboardState.tourists.find(t => t.id === alert.touristId);
    
    if (alert.severity === 'HIGH') {
        showEmergencyModal(alert, tourist);
    } else {
        showTouristDetails(tourist);
    }
}

function showTouristDetails(tourist) {
    const detailsPanel = document.getElementById('detailsPanel');
    const panelTitle = document.getElementById('panelTitle');
    const panelContent = document.getElementById('panelContent');
    
    detailsPanel.classList.remove('hidden');
    panelTitle.textContent = `${tourist.name} - Details`;
    
    panelContent.innerHTML = `
        <div class="tourist-details">
            <div class="detail-card">
                <h4>👤 Personal Information</h4>
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${tourist.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Nationality:</span>
                    <span class="detail-value">${tourist.nationality}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Emergency Contact:</span>
                    <span class="detail-value">${tourist.emergencyContact}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">DID:</span>
                    <span class="detail-value">${tourist.did.substr(0, 20)}...</span>
                </div>
            </div>
            
            <div class="detail-card">
                <h4>📍 Location & Status</h4>
                <div class="detail-item">
                    <span class="detail-label">Current Status:</span>
                    <span class="detail-value tourist-status ${tourist.status}">${capitalize(tourist.status)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${tourist.location.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Coordinates:</span>
                    <span class="detail-value">${tourist.location.lat.toFixed(4)}, ${tourist.location.lng.toFixed(4)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Last Update:</span>
                    <span class="detail-value">${formatTime(tourist.lastUpdate)}</span>
                </div>
            </div>
            
            <div class="detail-card">
                <h4>💗 Vital Signs</h4>
                <div class="detail-item">
                    <span class="detail-label">Heart Rate:</span>
                    <span class="detail-value">${Math.round(tourist.heartRate)} bpm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Battery Level:</span>
                    <span class="detail-value">${Math.round(tourist.battery)}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Device Status:</span>
                    <span class="detail-value">Connected</span>
                </div>
            </div>
            
            <div class="action-buttons">
                ${tourist.status === 'danger' ? 
                    '<button class="btn btn-danger" onclick="triggerEmergencyResponse()">🚨 Emergency Response</button>' : 
                    '<button class="btn btn-primary" onclick="contactTourist()">📞 Contact Tourist</button>'
                }
                <button class="btn btn-secondary" onclick="viewTouristHistory()">📊 View History</button>
                <button class="btn btn-secondary" onclick="updateRiskAssessment()">⚠️ Update Risk Level</button>
            </div>
        </div>
    `;
}

// Emergency Functions
function showEmergencyModal(alert, tourist) {
    const modal = document.getElementById('emergencyModal');
    const emergencyDetails = document.getElementById('emergencyDetails');
    const teamSelection = document.getElementById('teamSelection');
    const emergencyTimer = document.getElementById('emergencyTimer');
    
    dashboardState.activeEmergency = { alert, tourist, startTime: new Date() };
    
    emergencyDetails.innerHTML = `
        <div class="emergency-info">
            <div class="emergency-item">
                <span>Tourist:</span>
                <span>${tourist.name}</span>
            </div>
            <div class="emergency-item">
                <span>Alert Type:</span>
                <span>${alert.type}</span>
            </div>
            <div class="emergency-item">
                <span>Location:</span>
                <span>${tourist.location.name}</span>
            </div>
            <div class="emergency-item">
                <span>Heart Rate:</span>
                <span>${Math.round(tourist.heartRate)} bpm</span>
            </div>
            <div class="emergency-item">
                <span>Risk Factors:</span>
                <span>Heart rate spike, Movement stopped, ${alert.autoTriggered ? 'Auto-detected' : 'Manual SOS'}</span>
            </div>
            <div class="emergency-item">
                <span>Evidence Status:</span>
                <span>${alert.evidenceCaptured ? '✅ Captured & Secured' : '❌ Not Available'}</span>
            </div>
        </div>
    `;
    
    // Show available teams
    const availableTeams = dashboardState.teams.filter(team => team.status === 'available');
    teamSelection.innerHTML = availableTeams.map(team => `
        <div class="team-option" onclick="selectTeamForDispatch('${team.id}')">
            <div class="team-option-header">
                <span class="team-option-name">${team.name}</span>
                <span class="team-option-distance">${team.estimatedArrival}</span>
            </div>
            <div class="team-option-details">
                ${team.members} members • ${team.equipment} • Available
            </div>
        </div>
    `).join('');
    
    modal.classList.add('show');
    
    // Start emergency timer
    startEmergencyTimer();
}

function startEmergencyTimer() {
    const timerElement = document.getElementById('emergencyTimer');
    let startTime = dashboardState.activeEmergency.startTime;
    
    const timerInterval = setInterval(() => {
        if (!dashboardState.activeEmergency) {
            clearInterval(timerInterval);
            return;
        }
        
        const elapsed = new Date() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function selectTeamForDispatch(teamId) {
    // Remove previous selection
    document.querySelectorAll('.team-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked team
    event.target.closest('.team-option').classList.add('selected');
    dashboardState.selectedTeamForDispatch = teamId;
}

function dispatchTeam() {
    if (!dashboardState.selectedTeamForDispatch) {
        showNotification('Please select a team to dispatch', 'warning');
        return;
    }
    
    const team = dashboardState.teams.find(t => t.id === dashboardState.selectedTeamForDispatch);
    const tourist = dashboardState.activeEmergency.tourist;
    
    // Update team status
    team.status = 'deployed';
    team.assignedTourist = tourist.id;
    
    // Create notification for tourist app (simulated)
    showNotification(`${team.name} dispatched to ${tourist.name}`, 'success');
    
    // Update UI
    updateTeamList();
    updateMapDisplay();
    
    // Close emergency modal
    closeEmergencyModal();
    
    // Show dispatch confirmation
    setTimeout(() => {
        showNotification(`ETA: ${team.estimatedArrival} - Tourist notified`, 'success');
    }, 2000);
}

function escalateEmergency() {
    showNotification('Emergency escalated to regional command center', 'warning');
    // In real system, this would trigger additional protocols
}

function closeEmergencyModal() {
    document.getElementById('emergencyModal').classList.remove('show');
    dashboardState.activeEmergency = null;
    dashboardState.selectedTeamForDispatch = null;
}

function triggerEmergencyResponse() {
    if (dashboardState.selectedTourist && dashboardState.selectedTourist.status === 'danger') {
        const alert = dashboardState.alerts.find(a => a.touristId === dashboardState.selectedTourist.id);
        if (alert) {
            showEmergencyModal(alert, dashboardState.selectedTourist);
        }
    }
}

// Contact Functions
function contactTourist() {
    showNotification('Contacting tourist via in-app messaging...', 'success');
    // Simulate contact attempt
    setTimeout(() => {
        showNotification('Tourist contacted successfully', 'success');
    }, 3000);
}

function viewTouristHistory() {
    showNotification('Opening tourist activity history...', 'success');
    // In real system, this would open a detailed history view
}

function updateRiskAssessment() {
    if (dashboardState.selectedTourist) {
        const tourist = dashboardState.selectedTourist;
        showNotification(`Risk assessment updated for ${tourist.name}`, 'success');
        
        // Simulate risk level change
        setTimeout(() => {
            if (tourist.status === 'warning') {
                tourist.status = 'safe';
                updateTouristList();
                updateMapDisplay();
                showNotification('Risk level decreased to Safe', 'success');
            }
        }, 2000);
    }
}

// Map Layer Functions
function toggleLayer(layerName) {
    dashboardState.mapLayers[layerName] = !dashboardState.mapLayers[layerName];
    
    // Update button appearance
    const button = event.target.closest('.control-btn');
    button.classList.toggle('active');
    
    // Update map display
    updateMapDisplay();
    
    showNotification(`${layerName} layer ${dashboardState.mapLayers[layerName] ? 'enabled' : 'disabled'}`, 'success');
}

// Analytics Functions
function openAnalytics() {
    const modal = document.getElementById('analyticsModal');
    modal.classList.add('show');
    updateAnalyticsDisplay();
}

function closeAnalyticsModal() {
    document.getElementById('analyticsModal').classList.remove('show');
}

function updateAnalyticsDisplay() {
    // Update metrics
    document.getElementById('avgResponseTime').textContent = (3.5 + Math.random() * 2).toFixed(1);
    document.getElementById('totalEmergencies').textContent = Math.floor(120 + Math.random() * 20);
    
    // Simulate analytics data
    showNotification('Analytics data updated', 'success');
}

// Panel Functions
function closeDetailsPanel() {
    document.getElementById('detailsPanel').classList.add('hidden');
    dashboardState.selectedTourist = null;
}

// Data Management Functions
function refreshData() {
    showNotification('Refreshing real-time data...', 'success');
    
    // Simulate data refresh
    setTimeout(() => {
        // Update some tourist statuses randomly
        dashboardState.tourists.forEach(tourist => {
            if (Math.random() < 0.1) { // 10% chance to change status
                const statuses = ['safe', 'warning', 'danger'];
                const currentIndex = statuses.indexOf(tourist.status);
                // Prefer moving towards safe status
                if (currentIndex > 0 && Math.random() < 0.7) {
                    tourist.status = statuses[currentIndex - 1];
                }
            }
            
            // Update heart rate slightly
            tourist.heartRate += (Math.random() - 0.5) * 5;
            tourist.heartRate = Math.max(50, Math.min(150, tourist.heartRate));
            
            // Update battery
            tourist.battery = Math.max(5, tourist.battery - Math.random() * 2);
            
            // Update timestamp
            tourist.lastUpdate = new Date();
        });
        
        // Update alerts based on new statuses
        updateAlertsFromTouristStatus();
        
        // Refresh UI
        updateAllDisplays();
        showNotification('Data refreshed successfully', 'success');
    }, 2000);
}

function updateAlertsFromTouristStatus() {
    // Remove old alerts
    dashboardState.alerts = dashboardState.alerts.filter(alert => {
        const tourist = dashboardState.tourists.find(t => t.id === alert.touristId);
        return tourist && tourist.status === 'danger';
    });
    
    // Add new alerts for danger status tourists
    dashboardState.tourists.forEach(tourist => {
        if (tourist.status === 'danger') {
            const existingAlert = dashboardState.alerts.find(alert => alert.touristId === tourist.id);
            if (!existingAlert) {
                dashboardState.alerts.push({
                    id: `alert_${tourist.id}_${Date.now()}`,
                    touristId: tourist.id,
                    type: 'EMERGENCY',
                    severity: 'HIGH',
                    message: `${tourist.name} - Critical status detected`,
                    timestamp: new Date(),
                    location: tourist.location,
                    autoTriggered: true,
                    evidenceCaptured: true,
                    fundsReserved: true
                });
            }
        }
    });
}

// Notification Functions
let notificationCounter = 0;

function showNotification(message, type = 'success') {
    const notifications = document.getElementById('notifications');
    const notificationId = `notification_${++notificationCounter}`;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = notificationId;
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-title">${getNotificationTitle(type)}</span>
            <span class="notification-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    notifications.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notifications.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function getNotificationTitle(type) {
    switch (type) {
        case 'success': return 'Success';
        case 'warning': return 'Warning';
        case 'error': return 'Error';
        default: return 'Info';
    }
}

function toggleNotifications() {
    const notifications = document.getElementById('notifications');
    notifications.style.display = notifications.style.display === 'none' ? 'block' : 'none';
    
    const button = event.target;
    button.textContent = notifications.style.display === 'none' ? '🔕' : '🔔';
}

// Utility Functions
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateAllDisplays() {
    updateAlertList();
    updateTouristList();
    updateTeamList();
    updateMapDisplay();
}

// Real-time Simulation Functions
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Randomly update tourist locations slightly
        dashboardState.tourists.forEach(tourist => {
            if (tourist.status !== 'danger') { // Don't move tourists in emergency
                tourist.location.lat += (Math.random() - 0.5) * 0.0001;
                tourist.location.lng += (Math.random() - 0.5) * 0.0001;
            }
        });
        
        // Update map if visible
        updateMapDisplay();
    }, 10000); // Update every 10 seconds
    
    // Simulate occasional status changes
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance every 30 seconds
            const randomTourist = dashboardState.tourists[Math.floor(Math.random() * dashboardState.tourists.length)];
            if (randomTourist.status === 'safe' && Math.random() < 0.3) {
                randomTourist.status = 'warning';
                showNotification(`${randomTourist.name} status changed to Warning`, 'warning');
                updateAllDisplays();
            } else if (randomTourist.status === 'warning' && Math.random() < 0.8) {
                randomTourist.status = 'safe';
                showNotification(`${randomTourist.name} status improved to Safe`, 'success');
                updateAllDisplays();
            }
        }
    }, 30000); // Check every 30 seconds
}

function simulateDataStreaming() {
    setInterval(() => {
        // Simulate MQTT/Kafka data streaming
        const activeConnections = dashboardState.tourists.filter(t => t.battery > 10).length;
        console.log(`Streaming data from ${activeConnections} active tourists`);
        
        // Simulate occasional connection issues
        if (Math.random() < 0.02) { // 2% chance
            showNotification('Temporary connection issue detected - reconnecting...', 'warning');
            setTimeout(() => {
                showNotification('Connection restored - all systems operational', 'success');
            }, 5000);
        }
    }, 5000); // Every 5 seconds
}

// Demo Functions for Hackathon
function demoEmergencyScenario() {
    // Find a safe tourist to convert to emergency
    const safeTourist = dashboardState.tourists.find(t => t.status === 'safe');
    if (safeTourist) {
        safeTourist.status = 'danger';
        safeTourist.heartRate = 130 + Math.random() * 20;
        
        // Create emergency alert
        const alert = {
            id: `demo_alert_${Date.now()}`,
            touristId: safeTourist.id,
            type: 'EMERGENCY',
            severity: 'HIGH',
            message: `DEMO: ${safeTourist.name} - Heart rate spike with sudden stop`,
            timestamp: new Date(),
            location: safeTourist.location,
            autoTriggered: true,
            evidenceCaptured: true,
            fundsReserved: true
        };
        
        dashboardState.alerts.push(alert);
        
        updateAllDisplays();
        showNotification('DEMO: Emergency scenario activated!', 'error');
        
        // Auto-open emergency modal after 2 seconds
        setTimeout(() => {
            selectAlert(alert.id);
        }, 2000);
    }
}

function resetDemo() {
    // Reset all tourist statuses
    dashboardState.tourists.forEach(tourist => {
        tourist.status = 'safe';
        tourist.heartRate = 65 + Math.random() * 20;
        tourist.battery = 70 + Math.random() * 30;
    });
    
    // Clear alerts
    dashboardState.alerts = [];
    
    // Reset team statuses
    dashboardState.teams.forEach(team => {
        team.status = 'available';
        delete team.assignedTourist;
    });
    
    // Close all modals
    closeEmergencyModal();
    closeAnalyticsModal();
    closeDetailsPanel();
    
    updateAllDisplays();
    showNotification('Demo reset complete', 'success');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sample data
    generateSampleData();
    
    // Initial UI updates
    updateAllDisplays();
    updateCurrentTime();
    
    // Set up real-time updates
    setInterval(updateCurrentTime, 1000);
    simulateRealTimeUpdates();
    simulateDataStreaming();
    
    // Set up filter event listeners
    document.getElementById('statusFilter').addEventListener('change', updateTouristList);
    document.getElementById('searchTourists').addEventListener('input', updateTouristList);
    
    // Show initial notification
    setTimeout(() => {
        showNotification('SafeTrek Command Center initialized successfully', 'success');
    }, 1000);
    
    // Demo functions for hackathon (can be called from browser console)
    window.demoEmergency = demoEmergencyScenario;
    window.resetDemo = resetDemo;
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'r':
                event.preventDefault();
                refreshData();
                break;
            case 'e':
                event.preventDefault();
                if (dashboardState.alerts.length > 0) {
                    selectAlert(dashboardState.alerts[0].id);
                }
                break;
            case 'a':
                event.preventDefault();
                openAnalytics();
                break;
        }
    }
    
    // Escape key to close modals
    if (event.key === 'Escape') {
        closeEmergencyModal();
        closeAnalyticsModal();
        closeDetailsPanel();
    }
});

// Export for testing/demo
window.dashboardState = dashboardState;