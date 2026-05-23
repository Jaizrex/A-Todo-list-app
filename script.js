const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('input');
const rowsContainer = document.getElementById('todo-rows-container');
const itemsCountEl = document.getElementById('items-count');
const filterButtons = document.querySelectorAll('.filters button');
const clearCompletedBtn = document.getElementById('clear-completed');
const themeToggleBtn = document.getElementById('moon-icon');
const heroImage = document.getElementById('hero-image');

let todos = JSON.parse(localStorage.getItem('todos')) || [
    { id: 1, text: "Complete online JavaScript course", completed: true },
    { id: 2, text: "Jog around the park 3x", completed: false },
    { id: 3, text: "10 minutes meditation", completed: false },
    { id: 4, text: "Read for 1 hour", completed: false },
    { id: 5, text: "Pick up groceries", completed: false },
    { id: 6, text: "Complete Todo App on Frontend Mentor", completed: false }
];

let currentFilter = 'all';

function renderTodos() {
    rowsContainer.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    filteredTodos.forEach(todo => {
        const row = document.createElement('div');
        row.classList.add('todo-row');
        if (todo.completed) row.classList.add('completed');
        row.setAttribute('draggable', 'true');
        row.setAttribute('data-id', todo.id);

        row.innerHTML = `
            <button class="circle-btn ${todo.completed ? 'checked' : ''}" aria-label="Toggle todo status"></button>
            <p>${todo.text}</p>
            <img src="images/icon-cross.svg" alt="cross icon" class="cross-icon">
        `;

        row.querySelector('.circle-btn').addEventListener('click', () => toggleTodoComplete(todo.id));
        row.querySelector('.cross-icon').addEventListener('click', () => deleteTodo(todo.id));

        rowsContainer.appendChild(row);
    });

    updateActiveCount();
    initDragAndDrop();
    localStorage.setItem('todos', JSON.stringify(todos));
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    if (!taskText) return;

    todos.push({
        id: Date.now(),
        text: taskText,
        completed: false
    });
    todoInput.value = '';
    renderTodos();
});

function toggleTodoComplete(id) {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    renderTodos();
}

clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    renderTodos();
});

function updateActiveCount() {
    itemsCountEl.textContent = todos.filter(todo => !todo.completed).length;
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetFilter = btn.getAttribute('data-filter');
        currentFilter = targetFilter;

        filterButtons.forEach(button => {
            if (button.getAttribute('data-filter') === targetFilter) {
                button.classList.add('filter-btn--active');
            } else {
                button.classList.remove('filter-btn--active');
            }
        });

        renderTodos();
    });
});

function initDragAndDrop() {
    const rows = document.querySelectorAll('.todo-row');
    rows.forEach(row => {
        row.addEventListener('dragstart', () => row.classList.add('dragging'));
        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            saveDraggedOrder();
        });
    });
}

rowsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    if (!draggingItem) return;

    const afterElement = getDragAfterElement(rowsContainer, e.clientY);
    if (afterElement == null) {
        rowsContainer.appendChild(draggingItem);
    } else {
        rowsContainer.insertBefore(draggingItem, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-row:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveDraggedOrder() {
    const currentRows = [...rowsContainer.querySelectorAll('.todo-row')];
    todos = currentRows.map(row => {
        const id = parseInt(row.getAttribute('data-id'));
        return todos.find(t => t.id === id);
    }).filter(Boolean);
    localStorage.setItem('todos', JSON.stringify(todos));
}

let savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeUI(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
});

function updateThemeUI(theme) {
    if (theme === 'dark') {
        themeToggleBtn.src = 'images/icon-sun.svg';
        themeToggleBtn.alt = 'sun icon';
        heroImage.src = window.innerWidth <= 599 ? 'images/bg-mobile-dark.jpg' : 'images/bg-desktop-dark.jpg';
    } else {
        themeToggleBtn.src = 'images/icon-moon.svg';
        themeToggleBtn.alt = 'moon icon';
        heroImage.src = window.innerWidth <= 599 ? 'images/bg-mobile-light.jpg' : 'images/bg-desktop-light.jpg';
    }
}

window.addEventListener('resize', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateThemeUI(currentTheme);
});

renderTodos();