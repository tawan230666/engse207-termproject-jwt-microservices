const API_URL = '/api';

window.onload = () => {
    if (localStorage.getItem('token')) showTaskBoard();
};

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.user.email);
            errorEl.innerText = '';
            showTaskBoard();
        } else {
            errorEl.innerText = data.error || 'Login failed';
        }
    } catch (err) {
        errorEl.innerText = 'ไม่สามารถเชื่อมต่อ Server ได้';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('task-section').style.display = 'none';
}

function showTaskBoard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';
    document.getElementById('user-email').innerText = localStorage.getItem('email');
    fetchTasks();
}

async function fetchTasks() {
    const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (res.status === 401) return logout(); // Token Expired หรือไม่ถูกต้อง
    
    const data = await res.json();
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    data.tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${task.title}</strong><br><small>Status: ${task.status} | Priority: ${task.priority}</small></span>`;
        list.appendChild(li);
    });
}

async function createTask() {
    const titleInput = document.getElementById('new-task-title');
    if (!titleInput.value) return;
    
    await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: titleInput.value, priority: 'medium' })
    });
    
    titleInput.value = '';
    fetchTasks();
}
