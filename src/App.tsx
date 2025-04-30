import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { TodoService } from './services/api';
import { Todo } from './types/todo';
import { AlertCircle } from 'lucide-react';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TodoService.getTodos();
      setTodos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks. Please try again later.';
      setError(errorMessage);
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (title: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newTodo = await TodoService.createTodo({ title });
      setTodos(prev => [...prev, newTodo]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task. Please try again.';
      setError(errorMessage);
      console.error('Failed to create todo:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
     
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, completed } : todo
        )
      );
      
      await TodoService.updateTodo(id, { completed });
    } catch (err) {
      console.error('Failed to update todo:', err);
      fetchTodos();
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      setTodos(prev => prev.filter(todo => todo.id !== id));
      
      await TodoService.deleteTodo(id);
    } catch (err) {
      console.error('Failed to delete todo:', err);
      fetchTodos();
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleEditTodo = async (id: number, title: string) => {
    try {
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, title } : todo
        )
      );
      
      await TodoService.updateTodo(id, { title });
    } catch (err) {
      console.error('Failed to update todo:', err);
      fetchTodos();
      setError('Failed to update task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Listem</h1>
          <p className="text-gray-600">Gunluk listeni yonet</p>
        </div>
        
        <TodoForm onSubmit={handleCreateTodo} isLoading={isSubmitting} />
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <TodoList 
            todos={todos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onEdit={handleEditTodo}
          />
        )}
      </main>
      
    </div>
  );
}

export default App;