import React from 'react';
import { ExternalLink } from 'lucide-react';

interface RegistrationButtonProps {
  eventId?: string;
  eventTitle?: string;
  registrationLink?: string;
  registrationDeadline?: string | Date;
  className?: string;
}

export function RegistrationButton({ 
  registrationLink, 
  registrationDeadline,
  className = "" 
}: RegistrationButtonProps) {
  // If no registration link is provided, do not render any button
  if (!registrationLink || typeof registrationLink !== 'string' || registrationLink.trim() === '') {
    return null;
  }

  // If a registration deadline was set and has passed, automatically disappear
  if (registrationDeadline) {
    const deadlineDate = new Date(registrationDeadline);
    if (!isNaN(deadlineDate.getTime())) {
      // Allow registration until end of the deadline day (23:59:59)
      deadlineDate.setHours(23, 59, 59, 999);
      if (deadlineDate.getTime() < Date.now()) {
        return null;
      }
    }
  }

  const rawLink = registrationLink.trim();
  const formattedUrl = rawLink.startsWith('http://') || rawLink.startsWith('https://')
    ? rawLink
    : `https://${rawLink}`;

  return (
    <a
      href={formattedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${className}`}
    >
      <span>Register Now</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
