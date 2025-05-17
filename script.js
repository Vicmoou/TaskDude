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

// AI Assistant functionality
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

async function handleUserInput() {
    const query = userInput.value.trim();
    if (!query) return;

    // Add user message to chat
    addUserMessage(query);
    userInput.value = '';

    try {
        const response = await processUserQuery(query);
        addAssistantMessage(response);
    } catch (error) {
        addAssistantMessage("I'm sorry, I encountered an error. Please try again.");
        console.error('Error processing query:', error);
    }
}

function addMessage(message, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAssistantMessage(message) {
    addMessage(message, false);
}

function addUserMessage(message) {
    addMessage(message, true);
}

async function processUserQuery(query) {
    try {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskContext = {
            totalTasks: tasks.length,
            todayTasks: tasks.filter(task => task.date === new Date().toISOString().split('T')[0]).length,
            highPriorityTasks: tasks.filter(task => task.priority === 'high' && !task.completed).length,
            mediumPriorityTasks: tasks.filter(task => task.priority === 'medium' && !task.completed).length,
            lowPriorityTasks: tasks.filter(task => task.priority === 'low' && !task.completed).length,
            completedTasks: tasks.filter(task => task.completed).length
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'HTTP-Referer': 'http://localhost:5501',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-7b-instruct',
                messages: [
                    {
                        role: 'system',
                        content: `You are a task management assistant. Current task context: ${JSON.stringify(taskContext)}`
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return "I'm having trouble processing your request. Please try again.";
    }
}

// Update the welcome message to be more dynamic
window.addEventListener('load', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: "Hello!",
                taskContext: {}
            })
        });

        const data = await response.json();
        if (data.response) {
            addAssistantMessage(data.response);
        } else {
            throw new Error('Invalid welcome message response');
        }
    } catch (error) {
        console.error('Welcome message error:', error);
        addAssistantMessage("Hey there! 👋 I'm Tasky, your friendly task assistant! I'm excited to help you manage your tasks and make your day more productive. What's on your mind?");
    }
});