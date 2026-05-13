const VALID_STATUSES = ['pending', 'completed'];
const VALID_PRIORITIES = ['normal', 'urgent'];
const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'status', 'priority'];
const VALID_SORT_ORDERS = ['asc', 'desc'];
const TASK_FIELDS = ['title', 'description', 'status', 'priority'];

export function parseId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export function validateTaskPayload(payload, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      data,
      errors: ['O corpo da requisição deve ser um objeto JSON válido.']
    };
  }

  const unknownFields = Object.keys(payload).filter((key) => !TASK_FIELDS.includes(key));

  if (unknownFields.length > 0) {
    errors.push(`Campos não permitidos: ${unknownFields.join(', ')}.`);
  }

  if (!partial || Object.hasOwn(payload, 'title')) {
    if (typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      errors.push('O título é obrigatório.');
    } else if (payload.title.trim().length > 120) {
      errors.push('O título deve ter no máximo 120 caracteres.');
    } else {
      data.title = payload.title.trim();
    }
  }

  if (Object.hasOwn(payload, 'description')) {
    if (payload.description === null || payload.description === undefined || payload.description === '') {
      data.description = null;
    } else if (typeof payload.description !== 'string') {
      errors.push('A descrição deve ser um texto.');
    } else if (payload.description.trim().length > 500) {
      errors.push('A descrição deve ter no máximo 500 caracteres.');
    } else {
      data.description = payload.description.trim();
    }
  } else if (!partial) {
    data.description = null;
  }

  if (!partial || Object.hasOwn(payload, 'status')) {
    const status = payload.status ?? 'pending';

    if (!VALID_STATUSES.includes(status)) {
      errors.push('O status deve ser pending ou completed.');
    } else {
      data.status = status;
    }
  }

  if (!partial || Object.hasOwn(payload, 'priority')) {
    const priority = payload.priority ?? 'normal';

    if (!VALID_PRIORITIES.includes(priority)) {
      errors.push('A prioridade deve ser normal ou urgent.');
    } else {
      data.priority = priority;
    }
  }

  return {
    data,
    errors
  };
}

export function validateTaskFilters(query) {
  const errors = [];
  const filters = {
    status: undefined,
    priority: undefined,
    search: undefined,
    sort: 'createdAt',
    order: 'desc'
  };

  if (query.status !== undefined) {
    if (!VALID_STATUSES.includes(query.status)) {
      errors.push('O filtro status deve ser pending ou completed.');
    } else {
      filters.status = query.status;
    }
  }

  if (query.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(query.priority)) {
      errors.push('O filtro priority deve ser normal ou urgent.');
    } else {
      filters.priority = query.priority;
    }
  }

  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      errors.push('O filtro search deve ser um texto.');
    } else if (query.search.trim().length > 80) {
      errors.push('O filtro search deve ter no máximo 80 caracteres.');
    } else if (query.search.trim().length > 0) {
      filters.search = query.search.trim();
    }
  }

  if (query.sort !== undefined) {
    if (!VALID_SORT_FIELDS.includes(query.sort)) {
      errors.push('O filtro sort deve ser createdAt, updatedAt, title, status ou priority.');
    } else {
      filters.sort = query.sort;
    }
  }

  if (query.order !== undefined) {
    const normalizedOrder = String(query.order).toLowerCase();

    if (!VALID_SORT_ORDERS.includes(normalizedOrder)) {
      errors.push('O filtro order deve ser asc ou desc.');
    } else {
      filters.order = normalizedOrder;
    }
  }

  return {
    filters,
    errors
  };
}
