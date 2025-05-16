// Get user data
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Update profile info
document.getElementById('userName').textContent = user.name;
document.getElementById('userEmail').textContent = user.email;
document.getElementById('editName').value = user.name;
document.getElementById('editEmail').value = user.email;

// Load avatar if exists
const avatar = localStorage.getItem(`avatar_${user.email}`);
if (avatar) {
    document.getElementById('avatarPreview').src = avatar;
}

// Handle avatar upload
const avatarInput = document.getElementById('avatarInput');
avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarData = e.target.result;
            document.getElementById('avatarPreview').src = avatarData;
            localStorage.setItem(`avatar_${user.email}`, avatarData);
        };
        reader.readAsDataURL(file);
    }
});

// Update task statistics
function updateStats() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

// Handle profile update
const profileForm = document.getElementById('profileForm');
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newName = document.getElementById('editName').value;
    const newEmail = document.getElementById('editEmail').value;
    
    // Update user data
    user.name = newName;
    user.email = newEmail;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update display
    document.getElementById('userName').textContent = newName;
    document.getElementById('userEmail').textContent = newEmail;
    
    alert('Profile updated successfully!');
});

// Handle password change
document.getElementById('changePasswordBtn').addEventListener('click', () => {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        const confirmPassword = prompt('Confirm new password:');
        if (newPassword === confirmPassword) {
            // Update password in users array
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                alert('Password updated successfully!');
            }
        } else {
            alert('Passwords do not match!');
        }
    }
});

// Handle account deletion
document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Remove user data
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(u => u.email !== user.email);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Remove user tasks
        localStorage.removeItem('tasks');
        
        // Remove user avatar
        localStorage.removeItem(`avatar_${user.email}`);
        
        // Remove current user
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
});

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Initial stats update
updateStats(); 