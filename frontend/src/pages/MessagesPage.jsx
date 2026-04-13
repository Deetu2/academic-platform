import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../api/client';
import useAuthStore from '../store/authStore';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadMessages(selectedCourse.id);
      
      // Gentle auto-refresh - only if not typing
      const interval = setInterval(() => {
        if (document.activeElement !== messageInputRef.current) {
          loadMessages(selectedCourse.id, true); // Silent refresh
        }
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [selectedCourse]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user.role === 'STUDENT') {
        response = await apiClient.get('/courses');
      } else if (user.role === 'LECTURER') {
        response = await apiClient.get('/lecturers/me/courses');
      }
      
      const allCourses = response.data.data || [];
      setCourses(allCourses);
      
      if (allCourses.length > 0) {
        setSelectedCourse(allCourses[0]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (courseId, silent = false) => {
    try {
      if (!silent) {
        setLoadingMessages(true);
      }
      
      const response = await apiClient.get(`/courses/${courseId}/messages`);
      const courseMessages = response.data.data || [];
      
      // Only update if there are changes
      if (JSON.stringify(courseMessages) !== JSON.stringify(messages)) {
        setMessages(courseMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (!silent) {
        setMessages([]);
      }
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedCourse) return;

    try {
      setSending(true);
      
      const response = await apiClient.post(`/courses/${selectedCourse.id}/messages`, {
        content: newMessage.trim()
      });

      const sentMessage = response.data.data;
      
      // Add message to list
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Refocus input
      messageInputRef.current?.focus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ' at ' + 
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Course List (Left Sidebar) */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <h2 className="text-xl font-bold">Course Chats</h2>
                <p className="text-sm text-purple-100">{courses.length} courses</p>
              </div>

              {/* Courses */}
              <div className="flex-1 overflow-y-auto">
                {courses.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <p className="text-gray-500">No courses yet</p>
                  </div>
                ) : (
                  courses.map((course) => {
                    const isSelected = selectedCourse?.id === course.id;

                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className={`px-6 py-4 border-b border-gray-100 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-l-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-3`}>
                            {course.code?.substring(0, 2) || 'CO'}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {course.code}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {course.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Window (Right Side) */}
            <div className="flex-1 flex flex-col">
              {selectedCourse ? (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {selectedCourse.code} - {selectedCourse.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Course discussion • Everyone can see messages
                        </p>
                      </div>
                      <button
                        onClick={() => loadMessages(selectedCourse.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Refresh messages"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                    {loadingMessages && messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading messages...</p>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                          <div className="text-6xl mb-4">💬</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                          <p className="text-gray-600">Be the first to start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMe = message.sender.id === user.userId;
                        const isLecturer = message.sender.role === 'LECTURER';

                        return (
                          <div key={message.id} className="flex flex-col">
                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-lg ${isMe ? 'order-2' : 'order-1'}`}>
                                {/* Sender name */}
                                <div className={`flex items-center mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-xs font-medium ${isLecturer ? 'text-purple-600' : 'text-gray-600'}`}>
                                    {message.sender.name}
                                    {isLecturer && ' (Lecturer)'}
                                  </span>
                                </div>

                                {/* Message bubble */}
                                <div
                                  className={`rounded-2xl px-4 py-3 ${
                                    isMe
                                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                      : isLecturer
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                      : 'bg-white text-gray-900 shadow-md'
                                  }`}
                                >
                                  <p className="text-sm break-words">{message.content}</p>
                                </div>

                                {/* Time */}
                                <div className={`flex items-center mt-1 text-xs text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span>{formatMessageTime(message.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex items-end space-x-3">
                      <div className="flex-1">
                        <textarea
                          ref={messageInputRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(e);
                            }
                          }}
                          placeholder="Type a message to the class..."
                          rows={1}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          disabled={sending}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a course</h3>
                    <p className="text-gray-600">Choose a course from the left to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
