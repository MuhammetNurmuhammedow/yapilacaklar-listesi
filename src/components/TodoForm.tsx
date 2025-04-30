import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface TodoFormProps {
  onSubmit: (title: string) => void;
  isLoading: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title);
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex items-center bg-white rounded-lg overflow-hidden shadow transition-all hover:shadow-md border border-gray-100">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow px-4 py-3 text-gray-700 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 transition-colors duration-200 flex items-center justify-center"
          disabled={isLoading || !title.trim()}
        >
          <Plus size={20} />
        </button>
      </div>
    </form>
  );
};

export default TodoForm;