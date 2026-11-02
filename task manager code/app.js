import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    where, 
    deleteDoc, 
    doc, 
    updateDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCHdWsxT85kYaBMaZQGqyd1sBmZPxs7J44",
    authDomain: "task-gerencia.firebaseapp.com",
    projectId: "task-gerencia",
    storageBucket: "task-gerencia.firebasestorage.app",
    messagingSenderId: "489101009754",
    appId: "1:489101009754:web:13594609ef306cbe39c963",
    measurementId: "G-Z8QF55J50D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let unsubscribeTasks = null;
let unsubscribeFolders = null;
let tasksData = [];
let foldersData = ['Geral'];
let selectedFolder = 'all';
let currentFilter = 'all';
let selectedColor = 'indigo';

const colorStyles = {
    indigo: { border: 'border-l-indigo-500', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    emerald: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    amber: { border: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    rose: { border: 'border-l-rose-500', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    purple: { border: 'border-l-purple-500', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
};

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const userArea = document.getElementById('user-area');
const userEmailDisplay = document.getElementById('user-email-display');

const authTabs = document.getElementById('auth-tabs');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const formResetPassword = document.getElementById('form-reset-password');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const btnForgotPasswordView = document.getElementById('btn-forgot-password-view');
const btnBackToLogin = document.getElementById('btn-back-to-login');

const formTask = document.getElementById('form-task');
const formAddFolder = document.getElementById('form-add-folder');
const taskList = document.getElementById('task-list');
const folderList = document.getElementById('folder-list');
const taskFolderSelect = document.getElementById('task-folder');
const loadingSpinner = document.getElementById('loading-spinner');
const emptyState = document.getElementById('empty-state');

// Seletor de Cores
document.querySelectorAll('.color-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-picker-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedColor = btn.dataset.color;
    });
});

// Alternar entre Telas de Auth (Login, Cadastro e Esqueci a Senha)
tabLogin.addEventListener('click', () => showAuthView('login'));
tabRegister.addEventListener('click', () => showAuthView('register'));
btnForgotPasswordView.addEventListener('click', () => showAuthView('reset'));
btnBackToLogin.addEventListener('click', () => showAuthView('login'));

function showAuthView(view) {
    formLogin.classList.add('hidden');
    formRegister.classList.add('hidden');
    formResetPassword.classList.add('hidden');
    authTabs.classList.remove('hidden');

    if (view === 'login') {
        formLogin.classList.remove('hidden');
        tabLogin.className = "w-1/2 py-2 text-center font-semibold border-b-2 border-indigo-500 text-indigo-400";
        tabRegister.className = "w-1/2 py-2 text-center font-semibold text-gray-400 hover:text-gray-200";
    } else if (view === 'register') {
        formRegister.classList.remove('hidden');
        tabRegister.className = "w-1/2 py-2 text-center font-semibold border-b-2 border-emerald-500 text-emerald-400";
        tabLogin.className = "w-1/2 py-2 text-center font-semibold text-gray-400 hover:text-gray-200";
    } else if (view === 'reset') {
        formResetPassword.classList.remove('hidden');
        authTabs.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');

    msgEl.textContent = message;
    iconEl.className = type === 'error' ? "fa-solid fa-circle-exclamation text-red-400" :
                      type === 'success' ? "fa-solid fa-circle-check text-emerald-400" :
                      "fa-solid fa-circle-info text-indigo-400";

    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
}

// CADASTRO
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await createUserWithEmailAndPassword(auth, document.getElementById('reg-email').value, document.getElementById('reg-password').value);
        showToast("Conta criada com sucesso!", "success");
    } catch (error) {
        showToast(formatAuthError(error.code), "error");
    }
});

// LOGIN
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
        showToast("Login realizado!", "success");
    } catch (error) {
        showToast(formatAuthError(error.code), "error");
    }
});

// ENVIAR E-MAIL DE RECUPERAÇÃO DE SENHA
formResetPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim();

    try {
        await sendPasswordResetEmail(auth, email);
        showToast("E-mail de redefinição enviado! Verifique sua caixa de entrada.", "success");
        showAuthView('login');
    } catch (error) {
        showToast(formatAuthError(error.code), "error");
    }
});

// LOGOUT
document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        userEmailDisplay.textContent = user.email;
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        userArea.classList.remove('hidden');
        listenToFolders(user.uid);
        listenToTasks(user.uid);
    } else {
        if (unsubscribeTasks) unsubscribeTasks();
        if (unsubscribeFolders) unsubscribeFolders();
        appScreen.classList.add('hidden');
        userArea.classList.add('hidden');
        authScreen.classList.remove('hidden');
        tasksData = [];
    }
});

function listenToFolders(userId) {
    const q = query(collection(db, "folders"), where("userId", "==", userId));
    unsubscribeFolders = onSnapshot(q, (snapshot) => {
        const customFolders = snapshot.docs.map(doc => doc.data().name);
        foldersData = ['Geral', ...new Set(customFolders)];
        renderFolderSidebar();
    });
}

formAddFolder.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('new-folder-name');
    const folderName = input.value.trim();
    if (!folderName) return;

    try {
        await addDoc(collection(db, "folders"), { name: folderName, userId: currentUser.uid, createdAt: serverTimestamp() });
        input.value = '';
        showToast("Pasta criada!", "success");
    } catch (error) {
        showToast("Erro ao criar pasta.", "error");
    }
});

function listenToTasks(userId) {
    loadingSpinner.classList.remove('hidden');

    const q = query(collection(db, "tasks"), where("userId", "==", userId));

    unsubscribeTasks = onSnapshot(q, (snapshot) => {
        tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        tasksData.sort((a, b) => {
            const timeA = a.createdAt?.seconds || a.clientTimestamp || Date.now() / 1000;
            const timeB = b.createdAt?.seconds || b.clientTimestamp || Date.now() / 1000;
            return timeB - timeA;
        });

        loadingSpinner.classList.add('hidden');
        renderFolderSidebar();
        renderTasks();
    }, (error) => {
        console.error("Erro no listener:", error);
        loadingSpinner.classList.add('hidden');
    });
}

// ADICIONAR TAREFA
formTask.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('task-title');
    const dateInput = document.getElementById('task-date');
    const timeInput = document.getElementById('task-time');
    
    const title = titleInput.value.trim();
    const folder = document.getElementById('task-folder').value;
    const dueDate = dateInput.value;
    const dueTime = timeInput.value;
    const priority = document.getElementById('task-priority').value;

    if (!title) return;

    const isDuplicate = tasksData.some(task => {
        const sameTitle = task.title.toLowerCase() === title.toLowerCase();
        const sameDate = (task.dueDate || '') === (dueDate || '');
        const sameTime = (task.dueTime || '') === (dueTime || '');
        return sameTitle && sameDate && sameTime;
    });

    if (isDuplicate) {
        showToast("Já existe uma tarefa com este nome, data e horário! Escolha outro nome.", "error");
        return;
    }

    const tempId = 'temp-' + Date.now();
    const clientTime = Date.now() / 1000;

    const newTaskObj = {
        id: tempId,
        title,
        folder: folder || 'Geral',
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        priority,
        color: selectedColor,
        completed: false,
        userId: currentUser.uid,
        clientTimestamp: clientTime
    };

    tasksData.unshift(newTaskObj);
    renderFolderSidebar();
    renderTasks();

    titleInput.value = '';
    dateInput.value = '';
    timeInput.value = '';

    try {
        const docRef = await addDoc(collection(db, "tasks"), {
            title,
            folder: folder || 'Geral',
            dueDate: dueDate || null,
            dueTime: dueTime || null,
            priority,
            color: selectedColor,
            completed: false,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
        });

        newTaskObj.id = docRef.id;
        showToast("Tarefa adicionada!", "success");
    } catch (error) {
        console.error("Erro ao adicionar:", error);
        showToast("Erro ao salvar tarefa.", "error");
        tasksData = tasksData.filter(t => t.id !== tempId);
        renderFolderSidebar();
        renderTasks();
    }
});

// MARCAR CONCLUÍDA / ATIVAR
window.toggleTask = async (id, currentStatus) => {
    const taskIndex = tasksData.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasksData[taskIndex].completed = !currentStatus;
        renderTasks();
    }

    try {
        await updateDoc(doc(db, "tasks", id), { completed: !currentStatus });
    } catch (error) { 
        showToast("Erro ao atualizar status.", "error");
        if (taskIndex !== -1) {
            tasksData[taskIndex].completed = currentStatus;
            renderTasks();
        }
    }
};

// DELETAR TAREFA
window.deleteTask = async (id) => {
    const backupTasks = [...tasksData];
    tasksData = tasksData.filter(t => t.id !== id);
    renderFolderSidebar();
    renderTasks();

    try {
        await deleteDoc(doc(db, "tasks", id));
        showToast("Tarefa removida.", "info");
    } catch (error) { 
        showToast("Erro ao remover tarefa.", "error"); 
        tasksData = backupTasks;
        renderFolderSidebar();
        renderTasks();
    }
};

function renderFolderSidebar() {
    taskFolderSelect.innerHTML = foldersData.map(f => `<option value="${f}">Pasta: ${f}</option>`).join('');

    const countAll = tasksData.length;
    document.getElementById('count-all').textContent = countAll;

    let html = `
        <button onclick="selectFolder('all')" class="folder-btn w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition ${selectedFolder === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}">
            <span><i class="fa-solid fa-layer-group mr-2"></i>Todas</span>
            <span class="text-xs ${selectedFolder === 'all' ? 'bg-indigo-800' : 'bg-gray-700'} px-2 py-0.5 rounded-full">${countAll}</span>
        </button>
    `;

    foldersData.forEach(folder => {
        const count = tasksData.filter(t => t.folder === folder).length;
        const isSelected = selectedFolder === folder;
        html += `
            <button onclick="selectFolder('${folder}')" class="folder-btn w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition ${isSelected ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}">
                <span class="truncate flex items-center"><i class="fa-solid fa-folder text-xs mr-2 opacity-70"></i>${folder}</span>
                <span class="text-xs ${isSelected ? 'bg-indigo-800' : 'bg-gray-700'} px-2 py-0.5 rounded-full">${count}</span>
            </button>
        `;
    });

    folderList.innerHTML = html;
}

window.selectFolder = (folder) => {
    selectedFolder = folder;
    document.getElementById('current-folder-title').innerHTML = `
        <i class="fa-solid fa-folder-open text-indigo-400"></i> ${folder === 'all' ? 'Todas as Tarefas' : 'Pasta: ' + folder}
    `;
    renderFolderSidebar();
    renderTasks();
};

function renderTasks() {
    taskList.innerHTML = '';

    let filtered = tasksData.filter(t => {
        if (selectedFolder !== 'all' && t.folder !== selectedFolder) return false;
        if (currentFilter === 'pending') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    const fragment = document.createDocumentFragment();

    filtered.forEach(t => {
        const li = document.createElement('li');
        const style = colorStyles[t.color || 'indigo'];

        let dateTimeBadge = '';
        if (t.dueDate || t.dueTime) {
            let formattedDate = '';
            if (t.dueDate) {
                const [year, month, day] = t.dueDate.split('-');
                formattedDate = `${day}/${month}/${year}`;
            }
            const timeStr = t.dueTime ? ` às ${t.dueTime}` : '';

            dateTimeBadge = `
                <span class="text-[10px] sm:text-[11px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                    <i class="fa-regular fa-calendar text-indigo-400"></i> ${formattedDate}${timeStr}
                </span>
            `;
        }

        li.className = `flex items-start justify-between p-3.5 rounded-lg border-l-4 border-y border-r border-gray-700 bg-gray-900 gap-3 transition ${style.border} ${
            t.completed ? 'opacity-50' : ''
        }`;

        li.innerHTML = `
            <div class="flex items-start gap-3 min-w-0 flex-1">
                <button onclick="toggleTask('${t.id}', ${t.completed})" class="text-lg hover:scale-110 transition mt-0.5 flex-shrink-0">
                    <i class="${t.completed ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-regular fa-circle text-gray-500'}"></i>
                </button>
                <div class="min-w-0 flex-1">
                    <span class="text-xs sm:text-sm font-medium ${t.completed ? 'line-through text-gray-500' : 'text-gray-200'} block break-words">${t.title}</span>
                    <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
                        <span class="text-[9px] sm:text-[10px] px-2 py-0.5 rounded border ${style.badge}">${t.priority}</span>
                        <span class="text-[9px] sm:text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                            <i class="fa-solid fa-folder text-[8px]"></i> ${t.folder || 'Geral'}
                        </span>
                        ${dateTimeBadge}
                    </div>
                </div>
            </div>

            <button onclick="deleteTask('${t.id}')" class="text-gray-500 hover:text-red-400 p-1 flex-shrink-0 transition">
                <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
        `;

        fragment.appendChild(li);
    });

    taskList.appendChild(fragment);
}

const btnAll = document.getElementById('filter-all');
const btnPending = document.getElementById('filter-pending');
const btnCompleted = document.getElementById('filter-completed');

function setActiveFilter(activeBtn, filter) {
    [btnAll, btnPending, btnCompleted].forEach(btn => btn.className = "flex-1 sm:flex-none px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300");
    activeBtn.className = "flex-1 sm:flex-none px-3 py-1.5 rounded bg-indigo-600 text-white";
    currentFilter = filter;
    renderTasks();
}

btnAll.addEventListener('click', () => setActiveFilter(btnAll, 'all'));
btnPending.addEventListener('click', () => setActiveFilter(btnPending, 'pending'));
btnCompleted.addEventListener('click', () => setActiveFilter(btnCompleted, 'completed'));

function formatAuthError(code) {
    switch (code) {
        case 'auth/invalid-email': return 'Formato de e-mail inválido.';
        case 'auth/user-not-found': return 'E-mail não encontrado no sistema.';
        case 'auth/wrong-password': return 'Senha incorreta.';
        case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
        case 'auth/email-already-in-use': return 'E-mail já está em uso.';
        case 'auth/weak-password': return 'Senha fraca. Mínimo 6 caracteres.';
        default: return 'Erro no serviço de autenticação. Tente novamente.';
    }
}