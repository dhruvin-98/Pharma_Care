// frontend/src/components/Messages.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Send, Paperclip, Search, MoreVertical, Phone,
  Video, Info, Smile, Image, File, Clock, Check, CheckCheck,
  ArrowLeft, Star, Archive, Trash2, User
} from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const [conversations] = useState([
    {
      id: 1,
      name: 'PharmaCare Support',
      avatar: '💊',
      lastMessage: 'How can we help you today?',
      time: '2:30 PM',
      unread: 2,
      online: true,
      role: 'support'
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      avatar: '👩‍⚕️',
      lastMessage: 'Your prescription has been reviewed',
      time: '1:15 PM',
      unread: 0,
      online: true,
      role: 'doctor'
    },
    {
      id: 3,
      name: 'Pharmacy Team',
      avatar: '🏥',
      lastMessage: 'Your order is ready for pickup',
      time: 'Yesterday',
      unread: 0,
      online: false,
      role: 'pharmacy'
    }
  ]);

  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        sender: 'support',
        text: 'Hello! Welcome to PharmaCare Support. How can we assist you today?',
        time: '2:25 PM',
        status: 'read'
      },
      {
        id: 2,
        sender: 'user',
        text: 'Hi! I need help with my prescription order.',
        time: '2:28 PM',
        status: 'read'
      },
      {
        id: 3,
        sender: 'support',
        text: 'Of course! I\'d be happy to help. Can you provide your order number?',
        time: '2:30 PM',
        status: 'delivered'
      }
    ],
    2: [
      {
        id: 1,
        sender: 'doctor',
        text: 'Your prescription has been reviewed and approved.',
        time: '1:15 PM',
        status: 'read'
      }
    ],
    3: [
      {
        id: 1,
        sender: 'pharmacy',
        text: 'Your order #12345 is ready for pickup at our store.',
        time: 'Yesterday',
        status: 'read'
      }
    ]
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: messages[selectedChat].length + 1,
      sender: 'user',
      text: messageInput,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...prev[selectedChat], newMessage]
    }));

    setMessageInput('');

    // Simulate response after 2 seconds
    setTimeout(() => {
      const response = {
        id: messages[selectedChat].length + 2,
        sender: conversations.find(c => c.id === selectedChat)?.role || 'support',
        text: 'Thank you for your message. We\'ll get back to you shortly!',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        status: 'delivered'
      };

      setMessages(prev => ({
        ...prev,
        [selectedChat]: [...prev[selectedChat], response]
      }));
    }, 2000);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChat = conversations.find(c => c.id === selectedChat);
  const currentMessages = selectedChat ? messages[selectedChat] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            
            {/* Sidebar - Conversations List */}
            <div className={`border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 bg-white/90 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedChat === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
                          {conv.avatar}
                        </div>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conv.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                          {conv.unread > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2 ml-2">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-2 flex flex-col ${selectedChat ? 'flex' : 'hidden lg:flex'}`}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl">
                          {currentChat?.avatar}
                        </div>
                        {currentChat?.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{currentChat?.name}</h3>
                        <p className="text-xs text-blue-100">
                          {currentChat?.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-white hover:bg-white/10 p-2 rounded-lg transition">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="text-white hover:bg-white/10 p-2 rounded-lg transition">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="text-white hover:bg-white/10 p-2 rounded-lg transition">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl p-4 shadow-md ${
                              msg.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{msg.time}</span>
                            {msg.sender === 'user' && (
                              <span>
                                {msg.status === 'sent' && <Check className="h-3 w-3" />}
                                {msg.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                                {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-600" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end space-x-2">
                      <button className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition">
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <button className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition">
                        <Image className="h-5 w-5" />
                      </button>
                      <div className="flex-1">
                        <textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                          rows="1"
                        />
                      </div>
                      <button className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition">
                        <Smile className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                      <Mail className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600">
                      Choose a conversation from the sidebar to start messaging
                    </p>
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

export default Messages;