import axios from 'axios';
import { Todo, TodoFormData } from '../types/todo';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNREFUSED' || !error.response) {
      throw new Error('Cannot connect to the server. Please make sure the Go backend is running on port 8080');
    }
    throw error;
  }
);

export const TodoService = {
  async getTodos(): Promise<Todo[]> {
    try {
      const response = await api.get<Todo[]>('/todos');
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  async getTodo(id: number): Promise<Todo> {
    const response = await api.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  async createTodo(todo: TodoFormData): Promise<Todo> {
    const response = await api.post<Todo>('/todos', todo);
    return response.data;
  },

  async updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
    const response = await api.put<Todo>(`/todos/${id}`, todo);
    return response.data;
  },

  async deleteTodo(id: number): Promise<void> {
    await api.delete(`/todos/${id}`);
  }
};