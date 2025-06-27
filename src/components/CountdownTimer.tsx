import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface CountdownTimerProps {
  expiresAt?: string;
  className?: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  className = '',
  onExpire,
}) => {
  const { timeLeft, isExpired, hasExpiration } = useCountdown({ expiresAt, onExpire });

  if (!hasExpiration) {
    return null;
  }

  if (isExpired) {
    return (
      <div className={`flex items-center space-x-2 text-red-400 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Orden expirada</span>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  const getTimeColor = () => {
    const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
    if (totalMinutes <= 5) return 'text-red-400';
    if (totalMinutes <= 15) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Clock className="h-4 w-4 text-gray-400" />
      <span className="text-gray-400 text-sm">Tiempo restante:</span>
      <div className={`font-mono font-medium ${getTimeColor()}`}>
        {timeLeft.hours > 0 && (
          <>
            <span>{formatTime(timeLeft.hours)}</span>
            <span className="text-gray-500">h</span>
            <span className="mx-1">:</span>
          </>
        )}
        <span>{formatTime(timeLeft.minutes)}</span>
        <span className="text-gray-500">m</span>
        <span className="mx-1">:</span>
        <span>{formatTime(timeLeft.seconds)}</span>
        <span className="text-gray-500">s</span>
      </div>
    </div>
  );
}; 