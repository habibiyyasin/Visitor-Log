const supabaseUrl = 'https://vevljhibxlwyyqlyoszu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldmxqaGlieGx3eXlxbHlvc3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzI0MzgsImV4cCI6MjA4ODk0ODQzOH0.S27ShJXfZQHZoIzB3JhdnUBS8IE3rS90Kr6yjGFBa_k';
const _db = supabase.createClient(supabaseUrl, supabaseKey);

const ALLOWED_ADMINS = ['habibiy.yasin@neu.edu.ph', 'jcesperanza@neu.edu.ph']; 

let allLogs = [];
let currentFilteredLogs = [];
let timeFilter = 'today';

async function handleGoogleLogin() {
    try {
        const { error } = await _db.auth.signInWithOAuth({ 
            provider: 'google',
            options: { 
                redirectTo: window.location.origin + window.location.pathname 
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("Login Error:", err.message);
    }
}

window.onload = async () => {
    const { data: { session }, error } = await _db.auth.getSession();
    
    if (error) {
        console.error("Session Error:", error.message);
        return;
    }

    if (session) {
        const userEmail = session.user.email.toLowerCase();
        console.log("Logged in as:", userEmail);

        const isAuthorized = ALLOWED_ADMINS.some(admin => admin.toLowerCase() === userEmail);

        if (isAuthorized) {
            document.getElementById('adminLoginOverlay').classList.add('d-none');
            document.getElementById('dashboardContent').classList.remove('d-none');
            document.getElementById('adminEmailDisplay').innerText = userEmail;
            fetchLogs();
        } else {
            console.warn("Unauthorized access attempt by:", userEmail);
            
            await _db.auth.signOut();
            
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: `The email ${userEmail} does not have access.`,
                confirmButtonColor: '#dc3545',
                allowOutsideClick: false,
                confirmButtonText: 'Back to Login'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'admin.html'; 
                }
            });
        }
    }
};

async function handleLogout() {
    await _db.auth.signOut();
    location.reload();
}

async function fetchLogs() {
    const { data, error } = await _db.from('visitor_logs').select('*').order('created_at', { ascending: false });
    if (!error) {
        allLogs = data;
        applyFilters();
    } else {
        console.error("Error fetching logs:", error.message);
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.remove('d-none');
    document.getElementById(`nav-${tabId}`).classList.add('active');
}

function applyFilters() {
    const now = new Date();
    let filtered = allLogs;

    if (timeFilter === 'today') {
        filtered = filtered.filter(l => new Date(l.created_at).toDateString() === now.toDateString());
    } else if (timeFilter === 'week') {
        const current = new Date();
        current.setHours(0, 0, 0, 0); 
        const firstDayOfWeek = new Date(current.setDate(current.getDate() - current.getDay()));
        filtered = filtered.filter(l => new Date(l.created_at) >= firstDayOfWeek);
    }

    const dateStart = document.getElementById('date-start').value;
    const dateEnd = document.getElementById('date-end').value;
    
    if (dateStart || dateEnd) {
        filtered = allLogs; 
        if (dateStart) {
            const start = new Date(dateStart);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(l => new Date(l.created_at) >= start);
        }
        if (dateEnd) {
            const end = new Date(dateEnd);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(l => new Date(l.created_at) <= end);
        }
    }

    const purpose = document.getElementById('filter-purpose').value;
    if (purpose && purpose !== 'all') {
        filtered = filtered.filter(l => l.reason === purpose);
    }

    const coll = document.getElementById('filter-college').value;
    if (coll && coll !== 'all') {
        filtered = filtered.filter(l => l.college === coll);
    }

    const type = document.getElementById('filter-type').value;
    if (type && type !== 'all') {
        if (type === 'Student') {
            filtered = filtered.filter(l => !['FACULTY', 'Faculty Member', 'Staff'].includes(l.program));
        } else if (type === 'Faculty') {
            filtered = filtered.filter(l => ['FACULTY', 'Faculty Member', 'Staff'].includes(l.program));
        }
    }

    currentFilteredLogs = filtered;
    renderDashboard(filtered);
    renderLogTable(filtered); 
    
    const searchInput = document.getElementById('search-log');
    if(searchInput) searchInput.value = '';
}

function renderDashboard(data) {
    document.getElementById('stat-total').innerText = data.length;
    
    document.getElementById('stat-students').innerText = data.filter(v => !['FACULTY', 'Faculty Member', 'Staff'].includes(v.program)).length;
    document.getElementById('stat-employees').innerText = data.filter(v => ['FACULTY', 'Faculty Member', 'Staff'].includes(v.program)).length;

    const grid = document.getElementById('records-grid');
    grid.innerHTML = '';
    const programs = [...new Set(data.map(v => v.program || 'OTHER'))];
    programs.forEach(p => {
        const count = data.filter(v => v.program === p).length;
        grid.innerHTML += `
            <div class="col-md-3">
                <div class="record-bubble shadow-sm">
                    <strong>${p}</strong><br>
                    <span class="badge bg-primary">${count} Visits</span>
                </div>
            </div>`;
    });
}

function renderLogTable(data) {
    const body = document.getElementById('logTableBody');
    if (!body) return;
    body.innerHTML = '';
    data.forEach(item => {
        const isBlocked = item.status === 'blocked';
        
        const userType = ['FACULTY', 'Faculty Member', 'Staff'].includes(item.program) ? 'Faculty' : 'Student';
        
        body.innerHTML += `
            <tr>
                <td class="fw-bold">${item.full_name}</td>
                <td>${item.college || 'N/A'}</td>
                <td>${item.program}</td>
                <td><span class="badge bg-info text-dark">${userType}</span></td> <td><span class="badge bg-secondary">${item.reason || 'N/A'}</span></td>
                <td class="small text-muted">${new Date(item.created_at).toLocaleString()}</td> <td><span class="status-pill ${isBlocked ? 'status-blocked' : 'status-active'}">${item.status || 'active'}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm ${isBlocked ? 'btn-success' : 'btn-outline-danger'}" onclick="toggleBlock('${item.id}', '${item.status}')">
                        ${isBlocked ? 'Unblock' : 'Block'}
                    </button>
                </td>
            </tr>`;
    });
}

async function toggleBlock(id, current) {
    const next = current === 'blocked' ? 'active' : 'blocked';
    const { error } = await _db.from('visitor_logs').update({ status: next }).eq('id', id);
    if(!error) {
        fetchLogs();
    } else {
        alert("Error updating status: " + error.message);
    }
}

function setFilter(type, btn) {
    timeFilter = type;
    
    document.getElementById('date-start').value = '';
    document.getElementById('date-end').value = '';

    document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

function searchLogs() {
    const query = document.getElementById('search-log').value.toLowerCase();
    const rows = document.getElementById('logTableBody').getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].innerText.toLowerCase();
        if (rowText.includes(query)) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

function exportToCSV() {
    if (currentFilteredLogs.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Data',
            text: 'There are no visitor logs to export.'
        });
        return;
    }

    let csvContent = "Name,College,Program,Type,Purpose,Date & Time,Status\n";

    currentFilteredLogs.forEach(item => {
        const userType = ['FACULTY', 'Faculty Member', 'Staff'].includes(item.program) ? 'Faculty' : 'Student';
        const name = `"${(item.full_name || '').replace(/"/g, '""')}"`;
        const college = `"${(item.college || 'N/A').replace(/"/g, '""')}"`;
        const program = `"${(item.program || '').replace(/"/g, '""')}"`;
        const reason = `"${(item.reason || 'N/A').replace(/"/g, '""')}"`;
        const dateTime = `"${new Date(item.created_at).toLocaleString().replace(/"/g, '""')}"`;
        const status = `"${item.status || 'active'}"`;

        csvContent += `${name},${college},${program},${userType},${reason},${dateTime},${status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "visitor_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}