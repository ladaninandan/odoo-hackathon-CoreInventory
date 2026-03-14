const variantClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  destructive: 'badge-danger',
  info: 'badge-info',
  brand: 'badge-info',
};

export default function Badge({ children, variant = 'info', className = '' }) {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
