import { useState } from 'react';
function AddTodo({ onAdd, inputId }) {
  const [text, setText] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };
  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input id={inputId || 'task-input'} value={text} onChange={e => setText(e.target.value)} placeholder="Type a task and press Enter or click Add..." />
      <button type="submit">+ Add</button>
    </form>
  );
}
export default AddTodo;