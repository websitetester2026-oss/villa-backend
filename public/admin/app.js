// Client-side JS for Admin Dashboard
let token = localStorage.getItem('adminToken');

document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Switch Views
function showLogin() {
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';
    loadBookings();
}

// Switch Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
    
    event.target.classList.add('active');
    const content = document.getElementById(tabId + 'Tab');
    content.classList.add('active');
    content.style.display = 'block';
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    try {
        const res = await fetch('/admin/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            errorEl.textContent = '';
            showDashboard();
        } else {
            errorEl.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorEl.textContent = 'Server error during login';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    token = null;
    localStorage.removeItem('adminToken');
    showLogin();
});

// Load Bookings
async function loadBookings() {
    try {
        const res = await fetch('/admin/api/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
            // Token expired or invalid
            document.getElementById('logoutBtn').click();
            return;
        }

        const data = await res.json();
        const tbody = document.querySelector('#bookingsTable tbody');
        tbody.innerHTML = '';

        data.forEach(booking => {
            const guestName = booking.userId ? booking.userId.name : 'Unknown';
            const guestEmail = booking.userId ? booking.userId.email : 'Unknown';
            const villaName = booking.villaId ? booking.villaId.villaName : 'Unknown';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${guestName}</td>
                <td>${guestEmail}</td>
                <td>${villaName}</td>
                <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
                <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
                <td>$${booking.totalPrice}</td>
                <td><span class="status ${booking.bookingStatus}">${booking.bookingStatus}</span></td>
                <td>
                    ${booking.bookingStatus === 'pending' ? `
                        <button class="action-btn" onclick="updateBooking('${booking._id}', 'approved')">Approve</button>
                        <button class="action-btn" style="background:#e74c3c;" onclick="updateBooking('${booking._id}', 'cancelled')">Cancel</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error fetching bookings', error);
    }
}

// Update Booking
async function updateBooking(bookingId, status) {
    try {
        const res = await fetch('/admin/api/booking-status', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId, status })
        });

        if (res.ok) {
            loadBookings();
        } else {
            alert('Failed to update booking status');
        }
    } catch (error) {
        console.error('Error updating status', error);
    }
}

// Add Villa
document.getElementById('addVillaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        villaName: document.getElementById('vName').value,
        bedrooms: document.getElementById('vBedrooms').value,
        bathrooms: document.getElementById('vBathrooms').value,
        maxGuests: document.getElementById('vMaxGuests').value,
        pricePerNight: document.getElementById('vPrice').value,
        description: document.getElementById('vDesc').value,
    };

    try {
        const res = await fetch('/admin/api/villas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Villa added successfully!');
            document.getElementById('addVillaForm').reset();
        } else {
            const data = await res.json();
            alert(data.message || 'Failed to add villa');
        }
    } catch (error) {
        console.error('Error adding villa', error);
        alert('Server error adding villa');
    }
});
