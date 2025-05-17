// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Task management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Elements
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasks');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const taskChart = document.getElementById('taskChart');

// Initialize Chart
let chart = new Chart(taskChart, {
    type: 'doughnut',
    data: {
        labels: ['Low Priority', 'Medium Priority', 'High Priority'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: [
                'rgba(46, 204, 113, 0.8)',
                'rgba(241, 196, 15, 0.8)',
                'rgba(231, 76, 60, 0.8)'
            ],
            borderColor: [
                'rgba(46, 204, 113, 1)',
                'rgba(241, 196, 15, 1)',
                'rgba(231, 76, 60, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 15,
            hoverBorderWidth: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 2000,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 13,
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        weight: '500'
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#2c3e50',
                bodyColor: '#2c3e50',
                borderColor: '#e0e0e0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    }
});

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const date = document.getElementById('taskDate').value;
    const priority = document.getElementById('taskPriority').value;
    const iconFile = document.getElementById('taskIcon').files[0];
    
    if (iconFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            addTask(title, date, priority, e.target.result);
        };
        reader.readAsDataURL(iconFile);
    } else {
        addTask(title, date, priority);
    }
    
    taskForm.reset();
});

function addTask(title, date, priority, icon = null) {
    const task = {
        id: Date.now(),
        title,
        date,
        priority,
        icon,
        completed: false
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateChart();
}

// Render Tasks
function renderTasks() {
    tasksContainer.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const iconHTML = task.icon 
            ? `<img src="${task.icon}" class="task-icon" alt="Task icon">`
            : '';
            
        taskElement.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <label for="task-${task.id}"></label>
            </div>
            ${iconHTML}
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-date">${new Date(task.date).toLocaleDateString()}</div>
            </div>
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            <button onclick="deleteTask(${task.id})" class="delete-btn">×</button>
        `;
        
        tasksContainer.appendChild(taskElement);
    });
}

// Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateChart();
}

// Save Tasks to Local Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update Chart
function updateChart() {
    const priorityCounts = {
        low: tasks.filter(task => task.priority === 'low').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        high: tasks.filter(task => task.priority === 'high').length
    };
    
    chart.data.datasets[0].data = [
        priorityCounts.low,
        priorityCounts.medium,
        priorityCounts.high
    ];
    chart.update();
}

// Export Tasks
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(tasks);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tasks.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

// Import Tasks
importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                tasks = importedTasks;
                saveTasks();
                renderTasks();
                updateChart();
            } catch (error) {
                alert('Error importing tasks. Please make sure the file is valid.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
});

// Add event listeners for filters
document.getElementById('dateFilter').addEventListener('change', filterTasks);
document.getElementById('priorityFilter').addEventListener('change', filterTasks);

function filterTasks() {
    const dateFilter = document.getElementById('dateFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Date filtering
        let dateMatch = true;
        if (dateFilter !== 'all') {
            switch (dateFilter) {
                case 'today':
                    dateMatch = taskDate.toDateString() === new Date().toDateString();
                    break;
                case 'week':
                    dateMatch = taskDate >= startOfWeek;
                    break;
                case 'month':
                    dateMatch = taskDate >= startOfMonth;
                    break;
            }
        }
        
        // Priority filtering
        const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return dateMatch && priorityMatch;
    });
    
    displayTasks(filteredTasks);
}

// Update the displayTasks function to accept tasks parameter
function displayTasks(tasksToDisplay) {
    const tasksDiv = document.getElementById('tasks');
    tasksDiv.innerHTML = '';
    
    tasksToDisplay.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const iconHTML = task.icon 
            ? `<img src="${task.icon}" class="task-icon" alt="Task icon">`
            : '';
            
        taskElement.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <label for="task-${task.id}"></label>
            </div>
            ${iconHTML}
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-date">${new Date(task.date).toLocaleDateString()}</div>
            </div>
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            <button onclick="deleteTask(${task.id})" class="delete-btn">×</button>
        `;
        
        tasksDiv.appendChild(taskElement);
    });
    
    updateChart(tasksToDisplay);
}

// Update the loadTasks function to use the new displayTasks
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    displayTasks(tasks);
}

// Initial render
renderTasks();
updateChart();

// Task Assistant functionality
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendMessageBtn = document.getElementById('sendMessage');

// Add event listeners for chat
sendMessageBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

function handleUserInput() {
    const input = userInput.value.trim().toLowerCase();
    if (!input) return;

    // Add user message
    addMessage('user', userInput.value);
    userInput.value = '';

    // Process the input and generate response
    const response = generateResponse(input);
    addMessage('assistant', response);
}

function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateResponse(input) {
    // Get current date for today's tasks
    const today = new Date().toISOString().split('T')[0];
    
    // Common response patterns
    if (input.includes('today') || input.includes('do today')) {
        const todayTasks = tasks.filter(task => task.date === today);
        if (todayTasks.length === 0) {
            return "You have no tasks scheduled for today.";
        }
        return "Here are your tasks for today:\n" + 
            todayTasks.map(task => `• ${task.title} (${task.priority} priority)`).join('\n');
    }
    
    if (input.includes('high priority') || input.includes('important')) {
        const highPriorityTasks = tasks.filter(task => task.priority === 'high');
        if (highPriorityTasks.length === 0) {
            return "You don't have any high priority tasks at the moment.";
        }
        return "Here are your high priority tasks:\n" + 
            highPriorityTasks.map(task => `• ${task.title} (due ${task.date})`).join('\n');
    }
    
    if (input.includes('overdue') || input.includes('forgot')) {
        const overdueTasks = tasks.filter(task => {
            return !task.completed && new Date(task.date) < new Date(today);
        });
        if (overdueTasks.length === 0) {
            return "You don't have any overdue tasks. Great job staying on track!";
        }
        return "Here are your overdue tasks:\n" + 
            overdueTasks.map(task => `• ${task.title} (due ${task.date})`).join('\n');
    }
    
    if (input.includes('completed') || input.includes('finished')) {
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
            return "You haven't completed any tasks yet.";
        }
        return "Here are your completed tasks:\n" + 
            completedTasks.map(task => `• ${task.title}`).join('\n');
    }

    if (input.includes('help') || input.includes('can you')) {
        return `I can help you manage your tasks! Try asking me things like:
• What do I need to do today?
• Show me my high priority tasks
• Do I have any overdue tasks?
• What tasks have I completed?`;
    }

    // Default response
    return "I'm here to help you manage your tasks! You can ask me about today's tasks, high priority items, overdue tasks, or completed tasks.";
}