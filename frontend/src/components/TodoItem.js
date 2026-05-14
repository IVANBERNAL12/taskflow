function TodoItem({ todo, priority, onToggle, onDelete }) {
  const date = new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <button className="todo-check" onClick={() => onToggle(todo._id)}>
        {todo.completed ? '✓' : ''}
      </button>
      <div className="todo-content">
        <div className="todo-text">{todo.text}</div>
        <div className="todo-meta-row">
          <span className="todo-date">{date}</span>
          {priority && <span className={`todo-priority ${priority}`}>{priority}</span>}
        </div>
      </div>
      <div className="todo-actions">
        <button className="todo-action-btn delete" onClick={() => onDelete(todo._id)} title="Delete">✕</button>
      </div>
    </div>
  );
}
export default TodoItem;