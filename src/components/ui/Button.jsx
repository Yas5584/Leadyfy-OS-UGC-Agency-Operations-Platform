export default function Button({ children, variant='primary', className='', ...props }) {
    const base = 'px-4 py-2 rounded-md font-medium transition-colors';
    const variants = {
      primary: 'bg-amber-500 hover:bg-amber-600 text-white',
      outline: 'border border-gray-300 hover:bg-gray-50'
    };
    return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
  }