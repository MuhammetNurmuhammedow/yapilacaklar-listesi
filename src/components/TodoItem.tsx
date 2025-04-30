import React from 'react';
import { Check, Trash2, Edit2 } from 'lucide-react';
import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(todo.title);

  const handleToggle = () => {
    onToggle(todo.id, !todo.completed);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(todo.id, editValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(todo.title);
      setIsEditing(false);
    }
  };

  return (
    <div className={`group bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition-all hover:shadow mb-3 
                   ${todo.completed ? 'bg-gray-50 border-gray-200' : ''}`}>
      <div className="flex items-center">
        <button 
          onClick={handleToggle}
          className={`w-6 h-6 mr-3 rounded-full border flex items-center justify-center transition-colors
                    ${todo.completed 
                      ? 'bg-teal-500 border-teal-500 text-white' 
                      : 'border-gray-300 hover:border-teal-500'}`}
        >
          {todo.completed && <Check size={14} />}
        </button>

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-grow px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span 
            className={`flex-grow ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
          >
            {todo.title}
          </span>
        )}

        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <button 
              onClick={handleEdit}
              className="text-gray-500 hover:text-amber-500 p-1 rounded transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
          <button 
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-500 p-1 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-2">
        {new Date(todo.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default TodoItem;