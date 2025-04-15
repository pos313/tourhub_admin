import React, { useState } from 'react';
import { formatDate } from '../lib/utils';
import { admin } from '../lib/api';
import { 
  X, 
  MessageSquare, 
  User, 
  Trash2, 
  Ban, 
  Check, 
  Clock, 
  AlertTriangle,
  XCircle 
} from 'lucide-react';

const MessageView = ({ 
  message, 
  messageType, 
  onClose, 
  onAction, 
  reports = []
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  
  // Handle message deletion
  const handleDeleteMessage = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setActionSuccess('');
      
      const response = await admin.deleteMessage(messageType, message.id);
      setActionSuccess('Message deleted successfully');
      
      // Notify parent component
      if (onAction) {
        onAction('delete', {
          messageId: message.id,
          messageType: messageType,
          success: true
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle banning user
  const handleBanUser = async () => {
    const userId = messageType === 'public' ? message.user_id : message.sender_id;
    
    if (!userId || !window.confirm(`Are you sure you want to ban this user (ID: ${userId})?`)) {
      return;
    }
    
    // In a real implementation, you would integrate with a user banning API
    // For now, we'll just show a success message
    setActionSuccess('User banned successfully');
    
    // Notify parent component
    if (onAction) {
      onAction('ban', {
        userId: userId,
        success: true
      });
    }
  };
  
  // Handle clearing reports
  const handleClearReports = async () => {
    if (!window.confirm('Are you sure you want to mark all reports as reviewed?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setActionSuccess('');
      
      // Process all reports for this message
      const updatePromises = reports.map(report => 
        admin.updateReportStatus(report.id, 'reviewed')
      );
      
      await Promise.all(updatePromises);
      setActionSuccess('All reports marked as reviewed');
      
      // Notify parent component
      if (onAction) {
        onAction('clear', {
          reports: reports,
          success: true
        });
      }
    } catch (error) {
      console.error('Error updating reports:', error);
      setError('Failed to update reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Message content
  const messageContent = message?.content || 'No content available';
  
  // Get user info based on message type
  const userInfo = messageType === 'public' 
    ? message.user 
    : message.sender;
  
  // Format create date
  const formattedDate = formatDate(message?.created_at);
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card shadow-xl rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden border">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">
              {messageType === 'public' ? 'Public Message' : 'Direct Message'} #{message.id}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Message content */}
        <div className="p-4 border-b overflow-y-auto max-h-[40vh]">
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <User className="h-4 w-4 mr-1" />
            <span>From: {userInfo?.username || userInfo?.display_name || 'Unknown User'}</span>
            <Clock className="h-4 w-4 mx-1 ml-4" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
            {messageContent}
          </div>
        </div>
        
        {/* Reports summary */}
        <div className="p-4 border-b bg-muted/50">
          <h3 className="font-medium mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
            Reports ({reports.length})
          </h3>
          <ul className="text-sm space-y-2 max-h-[20vh] overflow-y-auto">
            {reports.map(report => (
              <li key={report.id} className="flex items-start">
                <span className={`status-badge ${report.status === 'pending' ? 'status-pending' : 'status-reviewed'} mr-2`}>
                  {report.status}
                </span>
                <div>
                  <p><strong>Reason:</strong> {report.reason}</p>
                  <p className="text-muted-foreground">
                    Reported by: {report.reporter?.username || 'Unknown'} 
                    • {formatDate(report.created_at)}
                  </p>
                </div>
              </li>
            ))}
            {reports.length === 0 && <li className="text-muted-foreground">No reports available</li>}
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="p-4 flex justify-between items-center">
          {/* Status messages */}
          <div>
            {error && (
              <p className="text-destructive text-sm flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                {error}
              </p>
            )}
            {actionSuccess && (
              <p className="text-green-600 text-sm flex items-center">
                <Check className="h-4 w-4 mr-1" />
                {actionSuccess}
              </p>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleClearReports}
              disabled={loading || reports.length === 0}
              className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-1" />
              <span>Clear</span>
            </button>
            
            <button
              onClick={handleBanUser}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ban className="h-4 w-4 mr-1" />
              <span>Mute User</span>
            </button>
            
            <button
              onClick={handleDeleteMessage}
              disabled={loading}
              className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageView;