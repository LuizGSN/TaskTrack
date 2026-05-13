import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  createTask,
  deleteTask,
  findTaskById,
  listTasks,
  updateTask
} from './tasksRepository.js';
import { parseId, validateTaskFilters, validateTaskPayload } from './validation.js';

const app = express();
const port = process.env.PORT ?? 3333;

app.use(cors());
app.use(express.json());

app.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.post('/tasks', async (request, response, next) => {
  try {
    const { data, errors } = validateTaskPayload(request.body);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    const task = await createTask(data);
    return response.status(201).json(task);
  } catch (error) {
    return next(error);
  }
});

app.get('/tasks', async (request, response, next) => {
  try {
    const { filters, errors } = validateTaskFilters(request.query);

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    const tasks = await listTasks(filters);
    return response.json(tasks);
  } catch (error) {
    return next(error);
  }
});

app.get('/tasks/:id', async (request, response, next) => {
  try {
    const id = parseId(request.params.id);

    if (!id) {
      return response.status(400).json({ errors: ['ID inválido.'] });
    }

    const task = await findTaskById(id);

    if (!task) {
      return response.status(404).json({ errors: ['Tarefa não encontrada.'] });
    }

    return response.json(task);
  } catch (error) {
    return next(error);
  }
});

async function handleUpdate(request, response, next, partial) {
  try {
    const id = parseId(request.params.id);

    if (!id) {
      return response.status(400).json({ errors: ['ID inválido.'] });
    }

    const { data, errors } = validateTaskPayload(request.body, { partial });

    if (errors.length > 0) {
      return response.status(400).json({ errors });
    }

    const task = await updateTask(id, data);

    if (!task) {
      return response.status(404).json({ errors: ['Tarefa não encontrada.'] });
    }

    return response.json(task);
  } catch (error) {
    return next(error);
  }
}

app.put('/tasks/:id', (request, response, next) => {
  return handleUpdate(request, response, next, false);
});

app.patch('/tasks/:id', (request, response, next) => {
  return handleUpdate(request, response, next, true);
});

app.delete('/tasks/:id', async (request, response, next) => {
  try {
    const id = parseId(request.params.id);

    if (!id) {
      return response.status(400).json({ errors: ['ID inválido.'] });
    }

    const deleted = await deleteTask(id);

    if (!deleted) {
      return response.status(404).json({ errors: ['Tarefa não encontrada.'] });
    }

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, request, response, next) => {
  console.error(error);
  return response.status(500).json({ errors: ['Erro interno do servidor.'] });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
