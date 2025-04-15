import React from 'react';
import { formatRelativeTime, truncate, getStatusClass } from '../lib/utils';
import { MessageSquare, User, Flag, ChevronRight } from 'lucide-react';

const ReportItem = ({ report, onClick }) => {
  const {
    id,
    reporter,
    reported_user,
    reason,
    status,
    created_at,
    message,
    message_type,
    message_id
  } = report;

  // Prepare message content truncation
  const messageContent = message?.content ? truncate(message.content, 100) : 'Message content unavailable';
  
  // Get CSS class for status badge
  const statusClass = getStatusClass(status);

  return (
    <div
      onClick={() => onClick(report)}
      className="bg-card hover:bg-accent/50 border rounded-lg p-4 mb-4 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <Flag className="h-5 w-5 text-destructive mr-2" />
          <h3 className="font-medium">
            Report #{id}
          </h3>
        </div>
        <span className={statusClass}>
          {status || 'unknown'}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-card-foreground/80 mb-2">
          <strong>Reason:</strong> {reason}
        </p>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>
            {message_type === 'public' ? 'Public message' : 'Direct message'} #{message_id}
          </span>
        </div>
        <p className="bg-muted p-3 rounded-md text-sm italic">
          "{messageContent}"
        </p>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center text-muted-foreground">
          <User className="h-4 w-4 mr-1" />
          <span>
            Reported by {reporter?.username || 'Unknown'} 
            {reported_user && ` • Against ${reported_user.username || 'Unknown'}`}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground mr-1">{formatRelativeTime(created_at)}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default ReportItem;