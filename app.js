/* ── Config ──────────────────────────────────────────────────── */
const API    = 'https://uni-tasks-worker.ch-devx.workers.dev';
const COLORS = ['#5b8dd9','#4caf82','#d97b5b','#c96b8a','#7b6dd9','#d9c45b','#5bbcd9','#9b9b9b','#c0392b','#27ae60'];

/* ── State ───────────────────────────────────────────────────── */
let subjects    = [];
let currentView = 'tasks';

/* ── API ─────────────────────────────────────────────────────── */
async function apiFetch(path, opts = {}) {
	const res = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
	if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Error'); }
	return res.json();
}

/* ── Toast ───────────────────────────────────────────────────── */
function showToast(msg) {
	const t = document.createElement('div');
	t.className = 'toast';
	t.textContent = msg;
	document.getElementById('toastContainer').appendChild(t);
	setTimeout(() => t.remove(), 2800);
}

/* ── Sidebar ─────────────────────────────────────────────────── */
const sidebar     = document.getElementById('sidebar');
const menuOverlay = document.getElementById('menuOverlay');

document.getElementById('hamburgerBtn').onclick = () => {
	sidebar.classList.add('open');
	menuOverlay.classList.add('active');
	document.body.style.overflow = 'hidden';
};

function closeSidebar() {
	sidebar.classList.remove('open');
	menuOverlay.classList.remove('active');
	document.body.style.overflow = '';
}

document.getElementById('sidebarClose').onclick = closeSidebar;
menuOverlay.onclick = closeSidebar;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });

/* ── Navigation ──────────────────────────────────────────────── */
const viewTitles = { tasks: 'Tasks', subjects: 'Subjects', done: 'Completed' };

document.querySelectorAll('.nav-link[data-view]').forEach(link => {
	link.onclick = () => { switchView(link.dataset.view); closeSidebar(); };
});

function switchView(view) {
	currentView = view;
	document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
	document.getElementById('view-' + view).classList.add('active');
	document.querySelectorAll('.nav-link[data-view]').forEach(l => l.classList.toggle('active', l.dataset.view === view));
	document.getElementById('topbarTitle').textContent = viewTitles[view];

	const fab = document.getElementById('fabBtn');
	const btn = document.getElementById('topbarAddBtn');

	if (view === 'done') {
		fab.style.display = 'none';
		btn.style.display = 'none';
	} else {
		fab.style.display = 'flex';
		btn.style.display = 'inline-flex';
	}

	if (view === 'subjects') {
		fab.onclick = () => openSubjectModal();
		btn.onclick = () => openSubjectModal();
	} else {
		fab.onclick = () => openTaskModal();
		btn.onclick = () => openTaskModal();
	}

	loadView(view);
}

async function loadView(v) {
	if (v === 'tasks')    loadTasks();
	if (v === 'subjects') loadSubjects();
	if (v === 'done')     loadDone();
}

/* ── Date helpers ────────────────────────────────────────────── */
function formatDeadline(d) {
	const today    = new Date(); today.setHours(0, 0, 0, 0);
	const parts    = String(d).split('T')[0].split('-');
	const deadline = new Date(parts[0], parts[1] - 1, parts[2]);
	const diff     = Math.round((deadline - today) / 86400000);
	if (diff < 0)   return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`;
	if (diff === 0) return 'Due today';
	if (diff === 1) return 'Tomorrow';
	return deadline.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

function urgencyClass(d, status) {
	if (status === 'done') return 'done';
	const today    = new Date(); today.setHours(0, 0, 0, 0);
	const parts    = String(d).split('T')[0].split('-');
	const deadline = new Date(parts[0], parts[1] - 1, parts[2]);
	const diff     = Math.round((deadline - today) / 86400000);
	return diff <= 0 ? 'urgent' : diff <= 3 ? 'soon' : 'ok';
}

function esc(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/* ── Tasks ───────────────────────────────────────────────────── */
async function loadTasks() {
	const el = document.getElementById('tasks-list');
	el.innerHTML = loading();
	try {
		const tasks = await apiFetch('/tasks');
		document.getElementById('tasks-count').textContent = tasks.length;
		if (!tasks.length) { el.innerHTML = emptyState('◈', 'No pending tasks', 'Press "+ New" to add one'); return; }
		el.innerHTML = '';
		const list = document.createElement('div');
		list.className = 'task-list';
		tasks.forEach(t => list.appendChild(buildTaskCard(t)));
		el.appendChild(list);
	} catch (e) { el.innerHTML = emptyState('⚠', 'Failed to load', e.message); }
}

async function loadDone() {
	const el = document.getElementById('done-list');
	el.innerHTML = loading();
	try {
		const tasks = await apiFetch('/tasks/done');
		document.getElementById('done-count').textContent = tasks.length;
		if (!tasks.length) { el.innerHTML = emptyState('◉', 'Nothing here yet', 'Completed tasks will show up here'); return; }
		el.innerHTML = '';
		const list = document.createElement('div');
		list.className = 'task-list';
		tasks.forEach(t => list.appendChild(buildTaskCard(t, true)));
		el.appendChild(list);
	} catch (e) { el.innerHTML = emptyState('⚠', 'Failed to load', e.message); }
}

function buildTaskCard(task, isDone = false) {
	const card = document.createElement('div');
	card.className = 'task-card' + (isDone ? ' done' : '');
	card.dataset.taskId = task.id;
	card.style.setProperty('--subject-color', task.subject_color || '#36363f');

	const u = urgencyClass(task.deadline, task.status);
	const subHtml = task.subject_name
		? `<span class="task-subject" style="color:${task.subject_color}">${esc(task.subject_name)}</span><span class="task-date">·</span>`
		: '';

	card.innerHTML = `
		<div class="task-check"></div>
		<div class="task-body">
			<div class="task-title">${esc(task.title)}</div>
			<div class="task-meta">${subHtml}<span class="task-date">${formatDeadline(task.deadline)}</span></div>
		</div>
		<div class="urgency-dot ${u}"></div>`;

	card.querySelector('.task-check').onclick = () => toggleTask(task.id, card);
	card.querySelector('.task-body').onclick   = () => openTaskModal(task);
	return card;
}

async function toggleTask(id, card) {
	try {
		const task = await apiFetch(`/tasks/${id}/toggle`, { method: 'PATCH' });
		if (task.status === 'done') {
			card.classList.add('done');
			showToast('Task completed ✓');
			setTimeout(() => {
				card.style.cssText += 'opacity:0;transform:translateX(8px);transition:all 300ms ease';
				setTimeout(() => { card.remove(); loadTasks(); }, 300);
			}, 600);
		} else {
			card.classList.remove('done');
			loadDone();
		}
	} catch { showToast('Failed to update'); }
}

/* ── Subjects ────────────────────────────────────────────────── */
async function loadSubjects() {
	const el = document.getElementById('subjects-list');
	el.innerHTML = loading();
	try {
		subjects = await apiFetch('/subjects');
		document.getElementById('subjects-count').textContent = subjects.length;
		populateSubjectSelect();
		if (!subjects.length) { el.innerHTML = emptyState('◇', 'No subjects yet', 'Add your subjects for the semester'); return; }
		el.innerHTML = '';
		const list = document.createElement('div');
		list.className = 'subject-list';
		subjects.forEach(s => {
			const card = document.createElement('div');
			card.className = 'subject-card';
			card.innerHTML = `
				<div class="subject-color-bar" style="background:${s.color}"></div>
				<span class="subject-name">${esc(s.name)}</span>
				<div class="subject-actions">
					<button class="btn btn-ghost btn-icon">✎</button>
					<button class="btn btn-danger btn-icon">✕</button>
				</div>`;
			card.querySelectorAll('button')[0].onclick = () => openSubjectModal(s);
			card.querySelectorAll('button')[1].onclick = () => deleteSubject(s.id, card);
			list.appendChild(card);
		});
		el.appendChild(list);
	} catch (e) { el.innerHTML = emptyState('⚠', 'Failed to load', e.message); }
}

function populateSubjectSelect() {
	const sel = document.getElementById('taskSubject');
	const cur = sel.value;
	sel.innerHTML = '<option value="">No subject</option>';
	subjects.forEach(s => {
		const o = document.createElement('option');
		o.value = s.id;
		o.textContent = s.name;
		sel.appendChild(o);
	});
	sel.value = cur;
}

async function deleteSubject(id, card) {
	if (!confirm('Delete this subject?')) return;
	try {
		await apiFetch(`/subjects/${id}`, { method: 'DELETE' });
		card.style.cssText += 'opacity:0;transition:opacity 200ms ease';
		setTimeout(() => { card.remove(); loadSubjects(); }, 200);
		showToast('Subject deleted');
	} catch { showToast('Failed to delete'); }
}

/* ── Modals ──────────────────────────────────────────────────── */
function openModal(id) {
	const m = document.getElementById(id);
	m.classList.add('active');
	document.body.style.overflow = 'hidden';
	setTimeout(() => m.querySelector('input,select,textarea')?.focus(), 100);
}

function closeModal(id) {
	document.getElementById(id).classList.remove('active');
	document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(o => {
	o.onclick = e => { if (e.target === o) closeModal(o.id); };
});

/* ── Task modal ──────────────────────────────────────────────── */
function openTaskModal(task = null) {
	document.getElementById('editTaskId').value           = task ? task.id : '';
	document.getElementById('taskTitle').value            = task ? task.title : '';
	document.getElementById('taskDesc').value             = task ? (task.description || '') : '';
	document.getElementById('taskDeadline').value         = task ? task.deadline : '';
	document.getElementById('taskModalTitle').textContent = task ? 'Edit task' : 'New task';
	document.getElementById('taskSubmitBtn').textContent  = task ? 'Save changes' : 'Create task';
	document.getElementById('deleteTaskBtn').style.display = task ? 'inline-flex' : 'none';
	populateSubjectSelect();
	document.getElementById('taskSubject').value = task ? (task.subject_id || '') : '';
	openModal('taskModal');
}

document.getElementById('cancelTaskBtn').onclick = () => closeModal('taskModal');

document.getElementById('deleteTaskBtn').onclick = async () => {
	const id = document.getElementById('editTaskId').value;
	if (!id || !confirm('Delete this task?')) return;
	try {
		await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
		closeModal('taskModal');
		showToast('Task deleted');
		loadTasks();
	} catch { showToast('Failed to delete'); }
};

document.getElementById('taskForm').onsubmit = async e => {
	e.preventDefault();
	const id  = document.getElementById('editTaskId').value;
	const sub = document.getElementById('taskSubject').value;
	const payload = {
		title:       document.getElementById('taskTitle').value.trim(),
		description: document.getElementById('taskDesc').value.trim() || null,
		subject_id:  sub ? parseInt(sub) : null,
		deadline:    document.getElementById('taskDeadline').value,
		status:      'pending',
	};
	try {
		if (id) {
			await apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
			showToast('Task updated');
		} else {
			await apiFetch('/tasks', { method: 'POST', body: JSON.stringify(payload) });
			showToast('Task created');
		}
		closeModal('taskModal');
		loadTasks();
	} catch (err) { showToast(err.message); }
};

/* ── Subject modal ───────────────────────────────────────────── */
function openSubjectModal(subject = null) {
	document.getElementById('editSubjectId').value           = subject ? subject.id : '';
	document.getElementById('subjectName').value             = subject ? subject.name : '';
	document.getElementById('subjectColor').value            = subject ? subject.color : COLORS[0];
	document.getElementById('subjectModalTitle').textContent = subject ? 'Edit subject' : 'New subject';
	document.getElementById('subjectSubmitBtn').textContent  = subject ? 'Save changes' : 'Create subject';
	renderSwatches(subject ? subject.color : COLORS[0]);
	openModal('subjectModal');
}

function renderSwatches(selected) {
	const c = document.getElementById('colorSwatches');
	c.innerHTML = '';
	COLORS.forEach(color => {
		const s = document.createElement('div');
		s.className = 'color-swatch' + (color === selected ? ' selected' : '');
		s.style.background = color;
		s.dataset.color = color;
		s.onclick = () => {
			c.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
			s.classList.add('selected');
			document.getElementById('subjectColor').value = color;
		};
		c.appendChild(s);
	});
}

document.getElementById('cancelSubjectBtn').onclick = () => closeModal('subjectModal');

document.getElementById('subjectForm').onsubmit = async e => {
	e.preventDefault();
	const id = document.getElementById('editSubjectId').value;
	const payload = {
		name:  document.getElementById('subjectName').value.trim(),
		color: document.getElementById('subjectColor').value,
	};
	try {
		if (id) {
			await apiFetch(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
			showToast('Subject updated');
		} else {
			await apiFetch('/subjects', { method: 'POST', body: JSON.stringify(payload) });
			showToast('Subject created');
		}
		closeModal('subjectModal');
		loadSubjects();
	} catch (err) { showToast(err.message); }
};

/* ── Helpers ─────────────────────────────────────────────────── */
function loading() {
	return '<div class="loading"><div class="spinner"></div>Loading...</div>';
}

function emptyState(icon, title, sub = '') {
	return `<div class="empty-state">
		<div class="empty-icon">${icon}</div>
		<div class="empty-title">${title}</div>
		${sub ? `<div class="empty-sub">${sub}</div>` : ''}
	</div>`;
}

/* ── Demo banner ─────────────────────────────────────────────── */
// This demo is intentionally read-only — the banner is always shown.
document.getElementById('demoBanner').style.display = 'flex';

/* ── Init ────────────────────────────────────────────────────── */
document.getElementById('fabBtn').onclick       = () => openTaskModal();
document.getElementById('topbarAddBtn').onclick = () => openTaskModal();
loadSubjects().then(() => loadTasks());