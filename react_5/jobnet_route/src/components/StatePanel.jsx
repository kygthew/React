/** Reusable loading / error / empty state block. */
function StatePanel({ title, text, spinner = false, children }) {
  return (
    <div className="state-panel">
      {spinner && <div className="spinner" />}
      {title && <h3>{title}</h3>}
      {text && <p>{text}</p>}
      {children && <div className="state-actions">{children}</div>}
    </div>
  );
}

export default StatePanel;
