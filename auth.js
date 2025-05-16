// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'login.html';
    }
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store logged in user
            localStorage.setItem('user', JSON.stringify({
                name: user.name,
                email: user.email
            }));
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    });
}

// Handle Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            alert('Email already registered');
            return;
        }
        
        // Add new user
        users.push({
            name,
            email,
            password
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login after registration
        localStorage.setItem('user', JSON.stringify({
            name,
            email
        }));
        
        window.location.href = 'index.html';
    });
}

// Check authentication on page load
checkAuth(); 