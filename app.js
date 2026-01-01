// app.js - Mobile USCIS Case Tracker

const API_BASE = 'https://my.uscis.gov:443/account/case-service/api/cases';

// Service Centers
const SERVICE_CENTERS = {
    'WAC': 'California Service Center',
    'LIN': 'Nebraska Service Center',
    'SRC': 'Texas Service Center',
    'EAC': 'Vermont Service Center',
    'IOE': 'USCIS Electronic Immigration System',
    'MSC': 'National Benefits Center',
    'NBC': 'National Benefits Center',
    'YSC': 'Potomac Service Center'
};

// Form Types
const FORM_TYPES = {
    'I-130': 'Petition for Alien Relative',
    'I-129': 'Petition for Nonimmigrant Worker',
    'I-129F': 'Petition for Alien Fiancé(e)',
    'I-140': 'Immigrant Petition for Alien Worker',
    'I-485': 'Application to Register Permanent Residence or Adjust Status',
    'I-539': 'Application to Extend/Change Nonimmigrant Status',
    'I-765': 'Application for Employment Authorization',
    'I-131': 'Application for Travel Document',
    'I-751': 'Petition to Remove Conditions on Residence',
    'I-821': 'Application for Temporary Protected Status',
    'I-90': 'Application to Replace Permanent Resident Card',
    'N-400': 'Application for Naturalization',
    'N-600': 'Application for Certificate of Citizenship'
};

// Event Codes
const EVENT_CODES = {
    'IAF': 'Initial Acceptance and Fee Payment - Your application has been accepted and fees have been processed',
    'RFE': 'Request for Evidence - USCIS needs additional documentation',
    'NOA': 'Notice of Action - Official notice about your case',
    'APR': 'Case Approved - Your application has been approved',
    'DEN': 'Case Denied - Your application has been denied',
    'WDR': 'Case Withdrawn - Application has been withdrawn',
    'TRM': 'Case Terminated - Application has been terminated',
    'INT': 'Interview Scheduled - You have been scheduled for an interview',
    'FPR': 'Fingerprint Review - Fingerprints are being reviewed',
    'CPO': 'Card Production Ordered - Your card is being produced',
    'CPM': 'Card Mailed - Your card has been mailed to you',
    'RET': 'Case Returned - Case has been returned',
    'ADM': 'Administrative Processing - Case is in administrative review',
    'TSC': 'Transferred to Service Center - Case transferred',
    'EAD': 'Employment Authorization Document - Related to work permit',
    'AP': 'Advance Parole - Travel document processing'
};

// State
let currentCaseData = null;
let previousCaseData = null;
let userTimezone = 'America/Chicago';
let deferredPrompt = null;

// DOM Elements
const authBadge = document.getElementById('authBadge');
const authText = document.getElementById('authText');
const statusDot = document.getElementById('statusDot');
const loginPrompt = document.getElementById('loginPrompt');
const mainContent = document.getElementById('mainContent');
const installPrompt = document.getElementById('installPrompt');
const installButton = document.getElementById('installButton');
const timezoneSelect = document.getElementById('timezone');
const caseNumberInput = document.getElementById('caseNumber');
const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const savedCases = document.getElementById('savedCases');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Load saved timezone
    const savedTimezone = localStorage.getItem('timezone');
    if (savedTimezone) {
        userTimezone = savedTimezone;
        timezoneSelect.value = userTimezone;
    }

    // Check authentication (unless skipped)
    if (window.skipAuthCheck) {
        showAuth();
    } else {
        checkAuth();
    }

    // Event listeners
    checkBtn.addEventListener('click', checkCase);
    clearBtn.addEventListener('click', clearResults);
    clearHistory.addEventListener('click', clearAllHistory);
    timezoneSelect.addEventListener('change', saveTimezone);
    caseNumberInput.addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
    });
    caseNumberInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') checkCase();
    });

    // PWA Install
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        installPrompt.style.display = 'block';
    });

    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        installPrompt.style.display = 'none';
    });

    // Load history
    loadHistory();

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(() => {
            console.log('Service Worker registered');
        }).catch((err) => {
            console.log('Service Worker registration failed:', err);
        });
    }
}

// Check Authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/IOE0000000000`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Auth check status:', response.status);

        // Only treat 401 and 403 as "not authenticated"
        // Any other status (including 404, 500, etc.) means we're probably logged in
        if (response.status === 401 || response.status === 403) {
            showNotAuth();
        } else {
            // If we got any other response, we're authenticated
            showAuth();
        }
    } catch (error) {
        console.log('Auth check error:', error);
        // On CORS/network errors, show not authenticated with helpful message
        showNotAuth();
    }
}

function showAuth() {
    authText.textContent = '✅ Authenticated';
    statusDot.style.background = '#10b981';
    loginPrompt.style.display = 'none';
    mainContent.style.display = 'block';
}

function showNotAuth() {
    authText.textContent = '❌ Not Logged In';
    statusDot.style.background = '#ef4444';
    loginPrompt.style.display = 'block';
    mainContent.style.display = 'none';
}

// Check Case
async function checkCase() {
    const caseNumber = caseNumberInput.value.trim();

    if (!caseNumber) {
        showError('Please enter a receipt number');
        return;
    }

    const pattern = /^[A-Z]{3}\d{10}$/;
    if (!pattern.test(caseNumber)) {
        showError('Invalid format. Should be 3 letters + 10 digits (e.g., IOE0934989946)');
        return;
    }

    loading.style.display = 'block';
    result.innerHTML = '';
    checkBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/${caseNumber}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            showError('Not authenticated. Please log in to USCIS in this browser first, then try again.');
            showNotAuth();
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const responseData = await response.json();
        const data = responseData.data || responseData;

        if (data && Object.keys(data).length > 0) {
            // Load previous data for comparison
            const history = JSON.parse(localStorage.getItem('caseHistory') || '[]');
            const prev = history.find(h => h.caseNumber === caseNumber);
            previousCaseData = prev ? prev.data : null;
            currentCaseData = data;

            displayResult(data, caseNumber);
            saveToHistory(caseNumber, data);
        } else {
            showError('No data returned for this case');
        }

    } catch (error) {
        showError(`Failed to fetch: ${error.message}. Make sure you're logged into USCIS in this browser.`);
    } finally {
        loading.style.display = 'none';
        checkBtn.disabled = false;
    }
}

// Display Result
function displayResult(data, caseNumber) {
    let html = '';

    // Service Center
    const serviceCenter = SERVICE_CENTERS[caseNumber.substring(0, 3)] || caseNumber.substring(0, 3);

    // Header Card
    html += `<div class="card">`;
    html += `<h2 style="font-size: 18px; margin-bottom: 4px;">📋 ${caseNumber}</h2>`;
    html += `<p style="font-size: 13px; color: #6b7280;">${serviceCenter}</p>`;

    // Status Badge
    if (data.closed !== undefined) {
        const statusClass = data.closed ? 'status-closed' : 'status-active';
        const statusText = data.closed ? '🔴 Closed' : '🟢 Active';
        html += `<div class="status-badge ${statusClass}" style="margin-top: 12px;">${statusText}</div>`;
    }

    // Action Required
    if (data.actionRequired) {
        html += `<div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 12px; border-left: 3px solid #f59e0b;">`;
        html += `<strong style="color: #92400e;">⚠️ ACTION REQUIRED</strong>`;
        html += `</div>`;
    }

    html += `</div>`;

    // Form Type
    if (data.formType || data.formName) {
        html += `<div class="form-display">`;
        if (data.formType) {
            html += `<div class="form-code">${data.formType}</div>`;
        }
        if (data.formName) {
            html += `<div class="form-name">${data.formName}</div>`;
        }
        html += `</div>`;
    }

    // Applicant Info
    if (data.applicantName || data.representativeName) {
        html += `<div class="card"><div class="section-title">👤 Applicant Information</div>`;
        if (data.applicantName) {
            html += `<div class="info-row">`;
            html += `<span class="info-label">Name</span>`;
            html += `<span class="info-value">${data.applicantName}</span>`;
            html += `</div>`;
        }
        if (data.representativeName) {
            html += `<div class="info-row">`;
            html += `<span class="info-label">Attorney</span>`;
            html += `<span class="info-value">${data.representativeName}</span>`;
            html += `</div>`;
        }
        html += `</div>`;
    }

    // Key Dates
    if (data.submissionTimestamp || data.updatedAtTimestamp) {
        html += `<div class="card"><div class="section-title">📅 Key Dates</div>`;
        if (data.submissionTimestamp) {
            html += `<div class="info-row">`;
            html += `<span class="info-label">Submitted</span>`;
            html += `<span class="info-value">${formatDate(data.submissionTimestamp)}</span>`;
            html += `</div>`;
        }
        if (data.updatedAtTimestamp) {
            html += `<div class="info-row">`;
            html += `<span class="info-label">Last Updated</span>`;
            html += `<span class="info-value">${formatDate(data.updatedAtTimestamp)}</span>`;
            html += `</div>`;
        }
        html += `</div>`;
    }

    // Notices
    if (data.notices && data.notices.length > 0) {
        html += `<div class="card">`;
        html += `<div class="section-title">📬 Notices (${data.notices.length})${hasChanged('notices') ? '<span class="new-badge">🆕 NEW</span>' : ''}</div>`;
        
        data.notices.forEach((notice, idx) => {
            html += `<div class="notice-card">`;
            html += `<div class="notice-title">Notice #${idx + 1}</div>`;
            
            if (notice.actionType) {
                html += `<div style="font-size: 14px; margin: 6px 0;"><strong>${notice.actionType}</strong></div>`;
            }
            
            if (notice.appointmentDateTime) {
                html += `<div class="appointment-time">📍 ${formatDate(notice.appointmentDateTime)}</div>`;
            }
            
            if (notice.generationDate) {
                html += `<div style="font-size: 12px; color: #6b7280; margin-top: 6px;">Generated: ${formatDate(notice.generationDate)}</div>`;
            }
            
            if (notice.letterId) {
                html += `<div style="font-size: 11px; color: #6b7280; margin-top: 4px; font-family: monospace;">Letter ID: ${notice.letterId}</div>`;
            }
            
            html += `</div>`;
        });
        html += `</div>`;
    }

    // Events
    if (data.events && data.events.length > 0) {
        html += `<div class="card">`;
        html += `<div class="section-title">📊 Events (${data.events.length})${hasChanged('events') ? '<span class="new-badge">🆕 NEW</span>' : ''}</div>`;
        
        data.events.forEach((event, idx) => {
            html += `<div class="event-card">`;
            html += `<div style="font-weight: bold; margin-bottom: 4px;">Event #${idx + 1}</div>`;
            
            if (event.eventCode) {
                const description = EVENT_CODES[event.eventCode] || 'Event description not available';
                html += `<div class="event-code">Code: ${event.eventCode}</div>`;
                html += `<div class="event-description"><strong>What this means:</strong> ${description}</div>`;
            }
            
            if (event.eventDateTime) {
                html += `<div style="font-size: 12px; color: #6b7280; margin-top: 8px;">Date: ${formatDate(event.eventDateTime)}</div>`;
            }
            
            if (event.createdAt) {
                html += `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Created: ${formatDate(event.createdAt)}</div>`;
            }
            
            html += `</div>`;
        });
        html += `</div>`;
    }

    // Case Details
    const detailFields = [
        { key: 'elisChannelType', label: 'Filing Channel' },
        { key: 'isPremiumProcessed', label: 'Premium Processing' },
        { key: 'noticeMailingPrefIndicator', label: 'Notice Mailing Preference' },
        { key: 'areAllGroupMembersAuthorizedForTravel', label: 'Authorized for Travel' }
    ];

    const hasDetails = detailFields.some(f => data[f.key] !== null && data[f.key] !== undefined);
    
    if (hasDetails) {
        html += `<div class="card"><div class="section-title">📊 Case Details</div>`;
        detailFields.forEach(field => {
            if (data[field.key] !== null && data[field.key] !== undefined) {
                html += `<div class="info-row">`;
                html += `<span class="info-label">${field.label}</span>`;
                html += `<span class="info-value">${formatValue(data[field.key])}</span>`;
                html += `</div>`;
            }
        });
        html += `</div>`;
    }

    result.innerHTML = html;
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: userTimezone,
            timeZoneName: 'short'
        };
        
        const formatted = date.toLocaleString('en-US', options);
        
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return `${formatted} (today)`;
        if (diffDays === 1) return `${formatted} (yesterday)`;
        if (diffDays > 1 && diffDays < 30) return `${formatted} (${diffDays} days ago)`;
        
        return formatted;
    } catch (e) {
        return dateString;
    }
}

// Format Value
function formatValue(value) {
    if (typeof value === 'boolean') return value ? '✅ Yes' : '❌ No';
    if (typeof value === 'number') return value.toLocaleString();
    return value;
}

// Has Changed
function hasChanged(field) {
    if (!previousCaseData || !currentCaseData) return false;
    return JSON.stringify(previousCaseData[field]) !== JSON.stringify(currentCaseData[field]);
}

// Save Timezone
function saveTimezone() {
    userTimezone = timezoneSelect.value;
    localStorage.setItem('timezone', userTimezone);
    if (currentCaseData) {
        displayResult(currentCaseData, caseNumberInput.value.trim());
    }
}

// Save to History
function saveToHistory(caseNumber, data) {
    let history = JSON.parse(localStorage.getItem('caseHistory') || '[]');
    history = history.filter(h => h.caseNumber !== caseNumber);
    history.unshift({
        caseNumber,
        data,
        timestamp: new Date().toISOString()
    });
    history = history.slice(0, 10);
    localStorage.setItem('caseHistory', JSON.stringify(history));
    loadHistory();
}

// Load History
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('caseHistory') || '[]');
    
    if (history.length === 0) {
        savedCases.style.display = 'none';
        return;
    }

    savedCases.style.display = 'block';
    historyList.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const status = item.data.formType || 'Unknown';
        const time = new Date(item.timestamp).toLocaleString();
        
        div.innerHTML = `
            <div class="history-number">${item.caseNumber}</div>
            <div class="history-status">${status}</div>
            <div class="history-time">${time}</div>
        `;
        
        div.addEventListener('click', () => {
            caseNumberInput.value = item.caseNumber;
            previousCaseData = null;
            currentCaseData = item.data;
            displayResult(item.data, item.caseNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        historyList.appendChild(div);
    });
}

// Clear History
function clearAllHistory() {
    if (confirm('Clear all saved cases?')) {
        localStorage.removeItem('caseHistory');
        loadHistory();
    }
}

// Clear Results
function clearResults() {
    result.innerHTML = '';
    caseNumberInput.value = '';
}

// Show Error
function showError(message) {
    result.innerHTML = `<div class="card error-card"><strong>Error:</strong> ${message}</div>`;
}
