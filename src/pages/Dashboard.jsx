import React, { useState, useEffect } from 'react';
import { admin } from '../lib/api';
import { groupReportsByMessage } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import ReportItem from '../components/ReportItem';
import MessageView from '../components/MessageView';
import StatsCard from '../components/StatsCard';
import { 
  AlertTriangle, 
  AlertCircle, 
  Filter, 
  RefreshCw,
  CheckCircle2,
  Users,
  ShieldAlert,
  MessageSquare,
  Info
} from 'lucide-react';

// Mock data for development when backend is unavailable
const MOCK_REPORTS = [
  {
    id: 1,
    reporter_id: 4,
    reported_user_id: 7,
    message_id: 120,
    message_type: 'public',
    reason: 'Inappropriate content',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    reporter: { id: 4, username: 'johndoe', display_name: 'John Doe' },
    reported_user: { id: 7, username: 'problematicuser', display_name: 'Problem User' },
    message: {
      id: 120,
      content: 'This is a sample reported message with inappropriate content that would be flagged by users.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user_id: 7
    }
  },
  {
    id: 2,
    reporter_id: 5,
    reported_user_id: 7,
    message_id: 120,
    message_type: 'public',
    reason: 'Harassment',
    status: 'pending',
    created_at: new Date(Date.now() - 4800000).toISOString(),
    reporter: { id: 5, username: 'janedoe', display_name: 'Jane Doe' },
    reported_user: { id: 7, username: 'problematicuser', display_name: 'Problem User' },
    message: {
      id: 120,
      content: 'This is a sample reported message with inappropriate content that would be flagged by users.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user_id: 7
    }
  },
  {
    id: 3,
    reporter_id: 6,
    reported_user_id: 8,
    message_id: 121,
    message_type: 'direct',
    reason: 'Spam content',
    status: 'reviewed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    reporter: { id: 6, username: 'alexsmith', display_name: 'Alex Smith' },
    reported_user: { id: 8, username: 'spammer', display_name: 'Spam Account' },
    message: {
      id: 121,
      content: 'This is a direct message containing spam content that would be reported by users.',
      created_at: new Date(Date.now() - 90000000).toISOString(),
      sender_id: 8,
      recipient_id: 6
    }
  }
];

const MOCK_STATS = {
  pending_reports: 2,
  total_reports: 3,
  blocked_users: 1,
  total_users: 150,
  moderators: 3,
  public_messages: 842,
  direct_messages: 1258
};

const Dashboard = () => {
  // State for reports
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for dashboard stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // State for filtering
  const [statusFilter, setStatusFilter] = useState('');
  
  // State for selected message
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedMessageType, setSelectedMessageType] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  
  // Get auth context
  const { useMockData } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Load reports from the API
  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use real or mock data
      if (useMockData || isDevelopment) {
        try {
          // Try to get real data first
          const response = await admin.getReports(statusFilter || null);
          
          if (response && response.reports) {
            setReports(response.reports);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.warn('Using mock reports data:', error);
          
          // Filter mock data if needed
          let filteredReports = MOCK_REPORTS;
          if (statusFilter) {
            filteredReports = MOCK_REPORTS.filter(report => report.status === statusFilter);
          }
          
          setReports(filteredReports);
        }
      } else {
        // Normal flow - get real data
        const response = await admin.getReports(statusFilter || null);
        
        if (response && response.reports) {
          setReports(response.reports);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setError('Failed to load reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load dashboard stats
  const loadStats = async () => {
    try {
      setStatsLoading(true);
      
      // Use real or mock data
      if (useMockData || isDevelopment) {
        try {
          // Try to get real data first
          const response = await admin.getDashboardStats();
          
          if (response && response.stats) {
            setStats(response.stats);
          } else {
            throw new Error('Invalid stats response');
          }
        } catch (error) {
          console.warn('Using mock stats data:', error);
          setStats(MOCK_STATS);
        }
      } else {
        // Normal flow - get real data
        const response = await admin.getDashboardStats();
        
        if (response && response.stats) {
          setStats(response.stats);
        } else {
          throw new Error('Invalid stats response');
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  
  // Load data on component mount and when status filter changes
  useEffect(() => {
    loadReports();
  }, [statusFilter, useMockData]);
  
  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, [useMockData]);
  
  // Handle click on a report item
  const handleReportClick = async (report) => {
    try {
      const messageId = report.message_id;
      const messageType = report.message_type;
      
      // For mock data, just use the message from the report
      if (useMockData || isDevelopment) {
        try {
          // Try to get real data first
          const response = await admin.getMessageDetails(messageType, messageId);
          
          if (response && response.message) {
            const message = response.message;
            
            // Find all reports for this message
            const relatedReports = reports.filter(
              r => r.message_id === messageId && r.message_type === messageType
            );
            
            setSelectedMessage(message);
            setSelectedMessageType(messageType);
            setSelectedReports(relatedReports);
          } else {
            throw new Error('Message not found');
          }
        } catch (error) {
          console.warn('Using mock message data:', error);
          
          // Use the message from the report
          setSelectedMessage(report.message);
          
          // Construct the full message object
          if (messageType === 'direct') {
            setSelectedMessage({
              ...report.message,
              sender: report.reported_user,
              recipient: report.reporter
            });
          } else {
            setSelectedMessage({
              ...report.message,
              user: report.reported_user
            });
          }
          
          setSelectedMessageType(messageType);
          
          // Find all reports for this message
          const relatedReports = reports.filter(
            r => r.message_id === messageId && r.message_type === messageType
          );
          
          setSelectedReports(relatedReports);
        }
      } else {
        // Get message details from API
        const response = await admin.getMessageDetails(messageType, messageId);
        
        if (response && response.message) {
          // Find all reports for this message
          const relatedReports = reports.filter(
            r => r.message_id === messageId && r.message_type === messageType
          );
          
          setSelectedMessage(response.message);
          setSelectedMessageType(messageType);
          setSelectedReports(relatedReports);
        } else {
          throw new Error('Message not found');
        }
      }
    } catch (error) {
      console.error('Error getting message details:', error);
      setError('Failed to load message details: ' + error.message);
    }
  };
  
  // Handle closing the message view
  const handleCloseMessageView = () => {
    setSelectedMessage(null);
    setSelectedMessageType(null);
    setSelectedReports([]);
  };
  
  // Handle action from message view
  const handleMessageAction = (action, data) => {
    if (action === 'delete') {
      // Remove all reports for this message
      setReports(prevReports => 
        prevReports.filter(
          r => !(r.message_id === data.messageId && r.message_type === data.messageType)
        )
      );
      handleCloseMessageView();
    } else if (action === 'clear') {
      // Update status of reports
      setReports(prevReports => 
        prevReports.map(report => {
          const isUpdated = data.reports.some(r => r.id === report.id);
          if (isUpdated) {
            return { ...report, status: 'reviewed' };
          }
          return report;
        })
      );
    }
    
    // Refresh stats after action
    loadStats();
  };
  
  // Group reports by message ID for displaying
  const groupedReports = groupReportsByMessage(reports);
  const reportGroups = Object.entries(groupedReports).map(([key, reports]) => {
    // Use the first report in each group for display
    return reports[0];
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        <button 
          onClick={() => {
            loadReports();
            loadStats();
          }}
          className="flex items-center text-primary hover:text-primary/80"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
      {/* Development mode notice */}
      {(isDevelopment || useMockData) && (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-4 rounded-md flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Development Mode</p>
            <p>Using {useMockData ? 'mock data' : 'real API data with mock fallback'}. The system will attempt to connect to the backend, but will use mock data if the connection fails.</p>
          </div>
        </div>
      )}
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Pending Reports" 
          value={stats?.pending_reports || 0} 
          icon={AlertTriangle} 
          color="yellow"
          isLoading={statsLoading}
        />
        <StatsCard 
          title="Total Reports" 
          value={stats?.total_reports || 0} 
          icon={AlertCircle} 
          color="red"
          isLoading={statsLoading}
        />
        <StatsCard 
          title="Blocked Users" 
          value={stats?.blocked_users || 0} 
          icon={Users} 
          color="indigo"
          isLoading={statsLoading}
        />
        <StatsCard 
          title="Total Messages" 
          value={(stats?.public_messages || 0) + (stats?.direct_messages || 0)} 
          icon={MessageSquare} 
          color="green"
          isLoading={statsLoading}
        />
      </div>
      
      {/* Filter controls */}
      <div className="flex items-center bg-muted p-4 rounded-lg">
        <Filter className="h-5 w-5 text-muted-foreground mr-2" />
        <span className="text-muted-foreground mr-3">Filter:</span>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1 rounded-full text-sm ${
              statusFilter === '' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm flex items-center ${
              statusFilter === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </button>
          
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-1 rounded-full text-sm flex items-center ${
              statusFilter === 'reviewed' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Reviewed
          </button>
          
          <button
            onClick={() => setStatusFilter('dismissed')}
            className={`px-3 py-1 rounded-full text-sm flex items-center ${
              statusFilter === 'dismissed' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <ShieldAlert className="h-3 w-3 mr-1" />
            Dismissed
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Reports list */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Reported Messages ({loading ? '...' : reportGroups.length})
          </h2>
        </div>
        
        {loading ? (
          // Loading state
          <div className="py-8 text-center">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : reportGroups.length > 0 ? (
          // Reports list
          <div className="space-y-4">
            {reportGroups.map(report => (
              <ReportItem 
                key={`${report.message_type}-${report.message_id}`}
                report={report}
                onClick={handleReportClick}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="py-12 text-center border rounded-lg">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="text-lg font-medium mb-1">All Clear!</h3>
            <p className="text-muted-foreground">
              {statusFilter 
                ? `No ${statusFilter} reports found.` 
                : 'No reported messages found.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Message view modal */}
      {selectedMessage && (
        <MessageView
          message={selectedMessage}
          messageType={selectedMessageType}
          reports={selectedReports}
          onClose={handleCloseMessageView}
          onAction={handleMessageAction}
        />
      )}
    </div>
  );
};

export default Dashboard;