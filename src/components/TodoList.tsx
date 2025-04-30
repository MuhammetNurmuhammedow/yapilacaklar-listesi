import React from 'react';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';
import { ListFilter } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete, onEdit }) => {
  const [filter, setFilter] = React.useState<'all' | 'active' | 'completed'>('all');

  const filteredTodos = React.useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500">Yapilacak bir sey yok</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Liste <span className="text-gray-500 text-sm">({filteredTodos.length})</span>
        </h2>
        
        <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-1 flex items-center">
            <ListFilter size={16} className="text-gray-500 mr-1" />
            <button 
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-sm rounded ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Hepsi
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-2 py-1 text-sm rounded ${filter === 'active' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Yapilmamis
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-2 py-1 text-sm rounded ${filter === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Yapilanlar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTodos.map(todo => (
          <TodoItem 
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>

      {filteredTodos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Liste {filter} yok
        </div>
      )}
    </div>
  );
};

export default TodoList;