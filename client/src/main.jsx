import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Check,
  ClipboardList,
  Circle,
  Clock3,
  Filter,
  Flame,
  Moon,
  Pencil,
  Plus,
  Save,
  Search,
  Sun,
  Trash2,
  X
} from 'lucide-react';
import { tasksApi } from './api.js';
import './styles.css';

const emptyForm = {
  title: '',
  description: '',
  priority: 'normal'
};

const defaultFilters = {
  status: '',
  priority: '',
  search: '',
  sort: 'createdAt',
  order: 'desc'
};

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(emptyForm);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === 'completed').length,
    [tasks]
  );
  const urgentCount = useMemo(
    () => tasks.filter((task) => task.priority === 'urgent').length,
    [tasks]
  );
  const pendingCount = tasks.length - completedCount;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function loadTasks(nextFilters = filters) {
    try {
      setError('');
      setLoading(true);
      const data = await tasksApi.list(nextFilters);
      setTasks(data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTasks(filters);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  async function handleCreate(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }

    if (form.description.trim().length > 500) {
      setError('A descrição deve ter no máximo 500 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await tasksApi.create({
        ...form,
        status: 'pending'
      });
      setForm(emptyForm);
      await loadTasks(filters);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditingForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority ?? 'normal'
    });
  }

  async function saveEditing(id) {
    if (!editingForm.title.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }

    if (editingForm.description.trim().length > 500) {
      setError('A descrição deve ter no máximo 500 caracteres.');
      return;
    }

    try {
      setError('');
      await tasksApi.update(id, editingForm);
      setEditingId(null);
      await loadTasks(filters);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function toggleStatus(task) {
    const status = task.status === 'completed' ? 'pending' : 'completed';

    try {
      setError('');
      await tasksApi.update(task.id, { status });
      await loadTasks(filters);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function removeTask(id) {
    try {
      setError('');
      await tasksApi.remove(id);
      await loadTasks(filters);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  function updateFilter(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value
    }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="page-header">
          <div>
            <span className="eyebrow">TO-DO LIST (TESTE-TECNICO)</span>
            <h1>Gerenciador de tarefas</h1>
            <p className="header-copy">
              Uma lista objetiva, com modo escuro, foco visual e destaque só para o que realmente
              precisa de atenção.
            </p>
          </div>

          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </header>

        <section className="stats-grid" aria-label="Resumo das tarefas">
          <div className="stat-card">
            <ClipboardList size={21} aria-hidden="true" />
            <span>Total</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-card">
            <Clock3 size={21} aria-hidden="true" />
            <span>Pendentes</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="stat-card">
            <Check size={21} aria-hidden="true" />
            <span>Concluídas</span>
            <strong>{completedCount}</strong>
          </div>
          <div className="stat-card urgent-stat">
            <Flame size={21} aria-hidden="true" />
            <span>Urgentes</span>
            <strong>{urgentCount}</strong>
          </div>
        </section>

        <section className="control-grid">
          <form className="task-form" onSubmit={handleCreate}>
            <div className="form-heading">
              <h2>Nova tarefa</h2>
              <span>{form.description.length}/500</span>
            </div>
            <div className="field-group">
              <label htmlFor="title">Título</label>
              <input
                id="title"
                type="text"
                value={form.title}
                maxLength={120}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Ex.: Revisar documentação"
              />
            </div>
            <div className="field-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                value={form.description}
                maxLength={500}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Detalhes opcionais"
                rows="3"
              />
            </div>
            <label className="urgent-toggle">
              <input
                type="checkbox"
                checked={form.priority === 'urgent'}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.checked ? 'urgent' : 'normal' })
                }
              />
              <span>
                <Flame size={17} aria-hidden="true" />
                Marcar como urgente
              </span>
            </label>
            <button className="primary-button" type="submit" disabled={submitting}>
              <Plus size={18} aria-hidden="true" />
              {submitting ? 'Criando...' : 'Criar tarefa'}
            </button>
          </form>

          <section className="filters-panel" aria-label="Filtros de tarefas">
            <div className="form-heading">
              <h2>Filtros</h2>
              <button className="text-button" type="button" onClick={clearFilters}>
                Limpar
              </button>
            </div>
            <div className="field-group search-field">
              <label htmlFor="search">Buscar</label>
              <div className="input-with-icon">
                <Search size={17} aria-hidden="true" />
                <input
                  id="search"
                  type="search"
                  value={filters.search}
                  maxLength={80}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Título ou descrição"
                />
              </div>
            </div>

            <div className="field-group two-columns">
              <div>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(event) => updateFilter('status', event.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="completed">Concluídas</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority">Prioridade</label>
                <select
                  id="priority"
                  value={filters.priority}
                  onChange={(event) => updateFilter('priority', event.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div className="field-group two-columns">
              <div>
                <label htmlFor="sort">Ordenar por</label>
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(event) => updateFilter('sort', event.target.value)}
                >
                  <option value="createdAt">Criação</option>
                  <option value="updatedAt">Atualização</option>
                  <option value="title">Título</option>
                  <option value="status">Status</option>
                  <option value="priority">Prioridade</option>
                </select>
              </div>

              <div>
                <label htmlFor="order">Direção</label>
                <select
                  id="order"
                  value={filters.order}
                  onChange={(event) => updateFilter('order', event.target.value)}
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
            <div className="filter-chip">
              <Filter size={16} aria-hidden="true" />
              <span>{loading ? 'Atualizando lista' : `${tasks.length} resultado(s)`}</span>
            </div>
          </section>
        </section>

        {error && <p className="message error">{error}</p>}

        <section className="tasks-area" aria-label="Lista de tarefas">
          {loading ? (
            <p className="message">Carregando tarefas...</p>
          ) : tasks.length === 0 ? (
            <p className="message">Nenhuma tarefa encontrada.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => {
                const isEditing = editingId === task.id;
                const isCompleted = task.status === 'completed';
                const isUrgent = task.priority === 'urgent';

                return (
                  <li
                    className={[
                      'task-item',
                      isCompleted ? 'completed' : '',
                      isUrgent ? 'urgent' : ''
                    ].join(' ')}
                    key={task.id}
                  >
                    <button
                      className="icon-button status-button"
                      type="button"
                      onClick={() => toggleStatus(task)}
                      title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                      aria-label={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                    >
                      {isCompleted ? <Check size={19} /> : <Circle size={19} />}
                    </button>

                    <div className="task-content">
                      {isEditing ? (
                        <div className="edit-fields">
                          <input
                            value={editingForm.title}
                            maxLength={120}
                            onChange={(event) =>
                              setEditingForm({ ...editingForm, title: event.target.value })
                            }
                          />
                          <textarea
                            value={editingForm.description}
                            maxLength={500}
                            rows="2"
                            onChange={(event) =>
                              setEditingForm({ ...editingForm, description: event.target.value })
                            }
                          />
                          <label className="urgent-toggle compact">
                            <input
                              type="checkbox"
                              checked={editingForm.priority === 'urgent'}
                              onChange={(event) =>
                                setEditingForm({
                                  ...editingForm,
                                  priority: event.target.checked ? 'urgent' : 'normal'
                                })
                              }
                            />
                            <span>
                              <Flame size={16} aria-hidden="true" />
                              Urgente
                            </span>
                          </label>
                        </div>
                      ) : (
                        <>
                          <div className="task-title-row">
                            <h2>{task.title}</h2>
                            {isUrgent && (
                              <span className="urgent-badge">
                                <Flame size={14} aria-hidden="true" />
                                Urgente
                              </span>
                            )}
                          </div>
                          {task.description && <p>{task.description}</p>}
                          <div className="task-meta">
                            <span className={isCompleted ? 'status-badge done' : 'status-badge'}>
                              {isCompleted ? 'Concluída' : 'Pendente'}
                            </span>
                            <span>Atualizada em {formatDate(task.updatedAt)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="task-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => saveEditing(task.id)}
                            title="Salvar edição"
                            aria-label="Salvar edição"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => setEditingId(null)}
                            title="Cancelar edição"
                            aria-label="Cancelar edição"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => startEditing(task)}
                            title="Editar tarefa"
                            aria-label="Editar tarefa"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="icon-button danger"
                            type="button"
                            onClick={() => removeTask(task.id)}
                            title="Excluir tarefa"
                            aria-label="Excluir tarefa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
