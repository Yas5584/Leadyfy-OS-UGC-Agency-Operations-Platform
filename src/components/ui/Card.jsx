export default function Card({ title, children, className = '', onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      {...props}
    >
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
}