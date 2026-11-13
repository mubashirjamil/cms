const API = 'http://localhost:3000';
const COURSES = ['Business Administration', 'Computer Science', 'Psychology', 'Biology', 'Economics', 'Graphic Design', 'English Literature', 'Mathematics'];
const COLORS = ['bg-indigo-100 text-indigo-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700'];
let students = [];
const $ = (selector) => document.querySelector(selector);
const initials = (name = '') => name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.add('hidden'), 2800);
}

function studentRow(student, actions = false) {
  const color = COLORS[(Number(student.id) || 1) % COLORS.length];
  const statusColor = student.status === 'On leave' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700';
  return `<tr class="hover:bg-slate-50/70"><td class="px-5 py-3.5"><div class="flex items-center gap-3"><div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-xs font-bold">${escapeHTML(initials(student.name))}</div><div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-800">${escapeHTML(student.name)}</p><p class="truncate text-xs text-slate-400">${escapeHTML(student.email)}</p></div></div></td>${actions ? `<td class="px-4 py-3.5 text-xs font-medium text-slate-500">${escapeHTML(student.studentId || `STU-${String(student.id).padStart(4, '0')}`)}</td>` : ''}<td class="px-4 py-3.5 text-xs text-slate-600">${escapeHTML(student.course)}</td><td class="px-4 py-3.5 text-xs text-slate-600">${escapeHTML(student.year)}</td><td class="px-5 py-3.5"><span class="rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor}">${escapeHTML(student.status || 'Active')}</span></td>${actions ? `<td class="px-5 py-3.5"><div class="flex justify-end gap-1"><button class="icon-button" data-edit="${student.id}" aria-label="Edit ${escapeHTML(student.name)}"><i data-lucide="pencil" class="h-4 w-4"></i></button><button class="icon-button hover:!bg-rose-50 hover:!text-rose-600" data-delete="${student.id}" aria-label="Delete ${escapeHTML(student.name)}"><i data-lucide="trash-2" class="h-4 w-4"></i></button></div></td>` : ''}</tr>`;
}

function renderDashboard() {
  const active = students.filter((student) => student.status !== 'On leave').length;
  $('#stat-students').textContent = students.length.toLocaleString();
  $('#stat-courses').textContent = String(new Set(students.map((s) => s.course)).size || 8);
  $('#stat-faculty').textContent = '42';
  $('#stat-attendance').textContent = '87%';
  $('#nav-student-count').textContent = students.length;
  $('#recent-students').innerHTML = [...students].slice(-5).reverse().map((student) => studentRow(student)).join('') || '<tr><td colspan="4" class="px-5 py-10 text-center text-sm text-slate-400">No students yet. Add your first student to get started.</td></tr>';
  const totals = COURSES.slice(0, 4).map((course) => ({ course, count: students.filter((student) => student.course === course).length }));
  const max = Math.max(...totals.map((item) => item.count), 1);
  $('#department-bars').innerHTML = totals.map((item, index) => `<div><div class="mb-2 flex justify-between gap-2 text-xs"><span class="truncate font-medium text-slate-600">${escapeHTML(item.course)}</span><span class="text-slate-400">${item.count}</span></div><div class="h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full ${['bg-indigo-500','bg-violet-500','bg-emerald-500','bg-amber-500'][index]}" style="width:${Math.max(8, item.count / max * 100)}%"></div></div></div>`).join('');
}

function renderStudents() {
  const query = $('#student-search').value.trim().toLowerCase();
  const course = $('#course-filter').value;
  const status = $('#status-filter').value;
  const filtered = students.filter((student) => `${student.name} ${student.email} ${student.studentId || ''}`.toLowerCase().includes(query) && (!course || student.course === course) && (!status || student.status === status));
  $('#students-table').innerHTML = filtered.map((student) => studentRow(student, true)).join('');
  $('#empty-state').classList.toggle('hidden', filtered.length > 0);
  $('#result-count').textContent = `Showing ${filtered.length} of ${students.length} students`;
  if (window.lucide) lucide.createIcons();
}

async function loadStudents() {
  try {
    const response = await fetch(`${API}/students`);
    if (!response.ok) throw new Error('Could not load students');
    students = await response.json();
    renderDashboard();
    renderStudents();
  } catch (error) {
    $('#result-count').textContent = 'Could not connect to JSON Server. Run npm run dev to start the API.';
    $('#recent-students').innerHTML = '<tr><td colspan="4" class="px-5 py-8 text-center text-sm text-rose-500">Start JSON Server with <code>npm run dev</code>, then refresh this page.</td></tr>';
    toast('Can’t reach JSON Server. Start it with npm run dev.');
  }
}

function openModal(student = null) {
  $('#student-form').reset();
  $('#student-id').value = student?.id || '';
  $('#modal-title').textContent = student ? 'Edit student' : 'Add student';
  $('#submit-label').textContent = student ? 'Save changes' : 'Save student';
  if (student) {
    $('#student-name').value = student.name;
    $('#student-email').value = student.email;
    $('#student-course').value = student.course;
    $('#student-year').value = student.year;
    $('#student-status').value = student.status || 'Active';
  }
  $('#student-modal').classList.remove('hidden');
  $('#student-modal').classList.add('flex');
  $('#student-name').focus();
}

function closeModal() {
  $('#student-modal').classList.add('hidden');
  $('#student-modal').classList.remove('flex');
}

function navigate(page) {
  const title = page.charAt(0).toUpperCase() + page.slice(1);
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.page === page));
  $('#dashboard-page').classList.toggle('hidden', page !== 'dashboard');
  $('#students-page').classList.toggle('hidden', page !== 'students');
  $('#placeholder-page').classList.toggle('hidden', ['dashboard', 'students'].includes(page));
  $('#page-title').textContent = page === 'dashboard' ? 'Overview' : title;
  $('#placeholder-title').textContent = title;
  closeSidebar();
}

function closeSidebar() {
  $('#sidebar').classList.add('-translate-x-full');
  $('#sidebar-backdrop').classList.add('hidden');
}

function init() {
  const user = JSON.parse(sessionStorage.getItem('campusflowUser') || 'null');
  if (!user) {
    window.location.replace('./signin.html');
    return;
  }
  $('#account-name').textContent = user.name;
  $('#account-role').textContent = user.role;
  $('#header-avatar').textContent = initials(user.name);
  $('#logout-button').addEventListener('click', () => {
    sessionStorage.removeItem('campusflowUser');
    window.location.replace('./signin.html');
  });
  $('#student-course').innerHTML = COURSES.map((course) => `<option>${escapeHTML(course)}</option>`).join('');
  $('#course-filter').innerHTML += COURSES.map((course) => `<option>${escapeHTML(course)}</option>`).join('');
  document.querySelectorAll('[data-page]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); const page = link.dataset.page; location.hash = page; navigate(page); }));
  window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'dashboard'));
  $('#add-student').addEventListener('click', () => openModal());
  $('#add-student-top').addEventListener('click', () => openModal());
  $('#close-modal').addEventListener('click', closeModal);
  $('#cancel-modal').addEventListener('click', closeModal);
  $('#student-modal').addEventListener('click', (event) => { if (event.target === $('#student-modal')) closeModal(); });
  $('#student-search').addEventListener('input', renderStudents);
  $('#course-filter').addEventListener('change', renderStudents);
  $('#status-filter').addEventListener('change', renderStudents);
  $('#refresh-students').addEventListener('click', loadStudents);
  $('#menu-button').addEventListener('click', () => { $('#sidebar').classList.remove('-translate-x-full'); $('#sidebar-backdrop').classList.remove('hidden'); });
  $('#sidebar-backdrop').addEventListener('click', closeSidebar);
  $('#students-table').addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');
    if (edit) { const student = students.find((item) => String(item.id) === edit.dataset.edit); if (student) openModal(student); }
    if (remove) {
      const student = students.find((item) => String(item.id) === remove.dataset.delete);
      if (!student || !window.confirm(`Delete ${student.name} from the student directory?`)) return;
      try { const response = await fetch(`${API}/students/${student.id}`, { method: 'DELETE' }); if (!response.ok) throw new Error(); await loadStudents(); toast('Student deleted.'); } catch { toast('Could not delete student. Check that JSON Server is running.'); }
    }
  });
  $('#student-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = $('#student-id').value;
    const existing = students.find((student) => String(student.id) === id);
    const data = { name: $('#student-name').value.trim(), email: $('#student-email').value.trim(), course: $('#student-course').value, year: $('#student-year').value, status: $('#student-status').value, studentId: existing?.studentId || `STU-${String(Date.now()).slice(-5)}` };
    try {
      const response = await fetch(`${API}/students${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error();
      await loadStudents(); closeModal(); toast(id ? 'Student details updated.' : 'Student added successfully.');
    } catch { toast('Could not save student. Check that JSON Server is running.'); }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  if (window.lucide) lucide.createIcons();
  navigate(location.hash.slice(1) || 'dashboard');
  loadStudents();
}

document.addEventListener('DOMContentLoaded', init);
