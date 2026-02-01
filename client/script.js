// Task Manager - Professional JavaScript Implementation
const API_URL = 'http://localhost:5000/api/tasks';
let currentFilter = 'all';
let tasks = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadTasks();
    setupEventListeners();
    setupCharacterCounters();
}

function setupEventListeners() {
    // Form submission
    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addTask();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveFilter(this.dataset.filter);
        });
    });

    // Clear form button
    document.querySelector('.btn-secondary').addEventListener('click', function() {
        clearCharacterCounters();
    });
}

function setupCharacterCounters() {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    
    titleInput.addEventListener('input', function() {
        updateCharCount('title', this.value.length, 100);
    });
    
    descriptionInput.addEventListener('input', function() {
        updateCharCount('description', this.value.length, 500);
    });
}

function updateCharCount(field, current, max) {
    const counter = document.querySelector(`#${field}`).nextElementSibling;
    if (counter && counter.classList.contains('char-count')) {
        counter.textContent = `${current}/${max}`;
        counter.style.color = current > max * 0.9 ? '#ef4444' : '#6b7280';
    }
}

function clearCharacterCounters() {
    updateCharCount('title', 0, 100);
    updateCharCount('description', 0, 500);
}

function setActiveFilter(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Filter tasks
    displayTasks();
}

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format received');
        }
        
        tasks = data;
        displayTasks();
        updateStats();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showMessage('Failed to load tasks', 'error');
    }
}

function displayTasks() {
    const taskList = document.getElementById('taskList');
    
    // Filter tasks based on current filter
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        return task.status === currentFilter;
    });

    // Show empty state if no tasks
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No tasks found</h3>
                <p>${currentFilter === 'all' ? 'Start by adding your first task above!' : `No ${currentFilter} tasks found`}</p>
            </div>
        `;
        return;
    }

    // Display tasks
    taskList.innerHTML = filteredTasks.map(task => createTaskElement(task)).join('');
}

function createTaskElement(task) {
    const statusBadge = getStatusBadge(task.status);
    const taskClass = `task-item status-${task.status}`;
    
    return `
        <div class="${taskClass}">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                </div>
                ${statusBadge}
            </div>
            <div class="task-footer">
                <div class="task-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editTask('${task._id}')">
                        <span>✏️</span> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')">
                        <span>🗑️</span> Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="status-badge pending">🔵 Pending</span>',
        'in-progress': '<span class="status-badge in-progress">🟡 In Progress</span>',
        'completed': '<span class="status-badge completed">🟢 Completed</span>'
    };
    return badges[status] || badges['pending'];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function addTask() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;

    // Validation
    if (!title) {
        showMessage('Task title is required', 'error');
        return;
    }

    if (title.length > 100) {
        showMessage('Title must be less than 100 characters', 'error');
        return;
    }

    if (description.length > 500) {
        showMessage('Description must be less than 500 characters', 'error');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, status })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create task');
        }

        const newTask = await response.json();
        tasks.push(newTask);
        
        // Reset form and UI
        document.getElementById('taskForm').reset();
        clearCharacterCounters();
        displayTasks();
        updateStats();
        
        showMessage('Task added successfully!', 'success');
    } catch (error) {
        console.error('Error adding task:', error);
        showMessage(error.message || 'Failed to add task', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || 'Failed to delete task');
        }

        tasks = tasks.filter(task => task._id !== taskId);
        displayTasks();
        updateStats();
        
        showMessage('Task deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        console.error('Task ID being deleted:', taskId);
        console.error('Current tasks:', tasks);
        showMessage(`Failed to delete task: ${error.message}`, 'error');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Populate form with task data
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description || '';
    document.getElementById('status').value = task.status;
    
    // Update character counters
    updateCharCount('title', task.title.length, 100);
    updateCharCount('description', (task.description || '').length, 500);
    
    // Scroll to form
    document.querySelector('.task-form-section').scrollIntoView({ behavior: 'smooth' });
    
    // Change submit button to update mode
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.innerHTML = '<span>✏️</span> Update Task';
    submitBtn.onclick = function(e) {
        e.preventDefault();
        updateTask(taskId);
    };
}

async function updateTask(taskId) {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;

    // Validation
    if (!title) {
        showMessage('Task title is required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, status })
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        const updatedTask = await response.json();
        const taskIndex = tasks.findIndex(t => t._id === taskId);
        tasks[taskIndex] = updatedTask;
        
        // Reset form and UI
        resetForm();
        displayTasks();
        updateStats();
        
        showMessage('Task updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating task:', error);
        showMessage('Failed to update task', 'error');
    }
}

function resetForm() {
    document.getElementById('taskForm').reset();
    clearCharacterCounters();
    
    // Reset submit button
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.innerHTML = '<span>➕</span> Add Task';
    submitBtn.onclick = null;
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
}

function showMessage(message, type = 'success') {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}