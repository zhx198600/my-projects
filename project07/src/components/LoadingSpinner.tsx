interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const strokeWidths = {
  sm: '3',
  md: '4',
  lg: '5',
};

export default function LoadingSpinner({
  size = 'md',
  color,
  className = '',
}: LoadingSpinnerProps) {
  const circleColor = color || 'rgba(255, 255, 255, 0.2)';
  const strokeColor = color || '#646cff';

  return (
    <div className={`inline-flex items-center justify-center ${className} animate-pulseEnhanced`}>
      <svg
        className={`${sizeClasses[size]} animate-spinSmooth`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={circleColor}
          strokeWidth={strokeWidths[size]}
          strokeLinecap="round"
        />
        <path
          d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.04 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7363 6.96003 21.2388 8.17317C21.7413 9.38632 22 10.6868 22 12"
          stroke={strokeColor}
          strokeWidth={strokeWidths[size]}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
