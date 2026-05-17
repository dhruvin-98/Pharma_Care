// frontend/src/components/Messages.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Send, Paperclip, Search, MoreVertical, Phone,
  Video, Smile, Image, File, Check, CheckCheck,
  ArrowLeft, Users, X, HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [availablePharmacists, setAvailablePharmacists] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [imageSending, setImageSending] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const conversationsRef = useRef(conversations);
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversations/rooms from backend
  const fetchRooms = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingRooms(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const roomsData = await res.json();
      
      // Check if there is an active redirection setup from FindMedicineView
      const activeSetup = sessionStorage.getItem('active_chat_room');
      let finalRooms = [...roomsData];

      if (activeSetup) {
        const config = JSON.parse(activeSetup);
        // If room is not yet in lists (no message sent), inject it manually
        const exists = roomsData.some(r => r.id === config.chatRoomId);
        if (!exists) {
          finalRooms = [
            {
              id: config.chatRoomId,
              name: config.name,
              pharmacistName: config.pharmacistName,
              avatar: config.avatar,
              lastMessage: 'Tap to start a new chat...',
              time: 'New',
              online: true,
              role: config.role,
              otherUserId: config.receiverId
            },
            ...roomsData
          ];
        }
        
        // Auto select
        setSelectedChat(config.chatRoomId);
        sessionStorage.removeItem('active_chat_room');
      } else if (selectedChatRef.current) {
        // If there's an active selected chat that is not in the fetched roomsData,
        // it means it's a new unsaved chat. We must keep it at the top of the list!
        const exists = roomsData.some(r => r.id === selectedChatRef.current);
        if (!exists) {
          const unsavedRoom = conversationsRef.current.find(c => c.id === selectedChatRef.current);
          if (unsavedRoom) {
            finalRooms = [unsavedRoom, ...roomsData];
          }
        }
      }

      setConversations(finalRooms);
    } catch (err) {
      console.error('[Messages] Room Fetch Error:', err);
    } finally {
      if (showLoading) setLoadingRooms(false);
    }
  };

  // 2. Fetch all pharmacists in case the customer wants to start a new chat directly
  const fetchPharmacists = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/pharmacists`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailablePharmacists(data || []);
      }
    } catch (err) {
      console.error('[Messages] Pharmacist Fetch Error:', err);
    }
  };

  // 3. Fetch messages in active chat
  const fetchMessages = async (chatId, showLoading = false) => {
    if (!chatId) return;
    try {
      if (showLoading) setLoadingMessages(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const msgsData = await res.json();
      setMessages(msgsData);
    } catch (err) {
      console.error('[Messages] Msg Fetch Error:', err);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchRooms(true);
    const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('user_auth')) || {};
    const role = userInfo.userType || 'customer';
    if (role === 'customer') {
      fetchPharmacists();
    }
  }, []);

  // Poll for rooms every 6 seconds to capture new unread counters / rooms
  useEffect(() => {
    const roomsInterval = setInterval(() => {
      fetchRooms(false);
    }, 6000);
    return () => clearInterval(roomsInterval);
  }, []);

  // Fetch messages on room change
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat, true);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  // Dynamic message sync polling every 3 seconds for active chats
  useEffect(() => {
    if (!selectedChat) return;
    const msgInterval = setInterval(() => {
      fetchMessages(selectedChat, false);
    }, 3000);
    return () => clearInterval(msgInterval);
  }, [selectedChat]);

  // Scroll to bottom on message load
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentChat = conversations.find(c => c.id === selectedChat);

  // 4. Send text message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !currentChat) return;

    const textToSend = messageInput;
    setMessageInput('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatRoomId: selectedChat,
          receiverId: currentChat.otherUserId,
          text: textToSend
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send message');
      }
      
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      
      // Update local room lastMessage immediately
      setConversations(prev => 
        prev.map(c => c.id === selectedChat ? { ...c, lastMessage: textToSend } : c)
      );
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error sending message.');
    }
  };

  // 5. Send photo (Base64 encoding)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat || !currentChat) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      
      try {
        setImageSending(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            chatRoomId: selectedChat,
            receiverId: currentChat.otherUserId,
            text: '',
            image: base64String
          })
        });

        if (!res.ok) throw new Error('Failed to send image');
        
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        
        setConversations(prev => 
          prev.map(c => c.id === selectedChat ? { ...c, lastMessage: '📷 Photo' } : c)
        );
      } catch (err) {
        console.error(err);
        alert('Error uploading image.');
      } finally {
        setImageSending(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            
            {/* Sidebar - Conversations List */}
            <div className={`border-r border-gray-200 dark:border-gray-700 flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'} h-full bg-white dark:bg-gray-800`}>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-md">
                <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm font-semibold shadow-inner"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {loadingRooms ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="text-xs text-gray-500 font-semibold">Synchronizing chat channels...</p>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedChat(conv.id)}
                      className={`p-4 border-b border-gray-150 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedChat === conv.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl shadow-md">
                            {conv.avatar}
                          </div>
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{conv.name}</h3>
                            <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0 ml-2">{conv.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">{conv.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 space-y-4">
                    <div className="text-center py-6">
                      <Mail className="h-10 w-10 text-gray-300 dark:text-gray-655 mx-auto mb-2 animate-pulse" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">No active chats found</p>
                      {(() => {
                        const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('user_auth')) || {};
                        const activeRole = userInfo.userType || 'customer';
                        if (activeRole === 'pharmacist') {
                          return (
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 max-w-[200px] mx-auto leading-relaxed font-semibold">
                              Incoming patient consult inquiries and direct purchase orders will appear here automatically.
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    
                    {(() => {
                      const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('user_auth')) || {};
                      const activeRole = userInfo.userType || 'customer';
                      if (activeRole === 'customer' && availablePharmacists.length > 0) {
                        return (
                          <div className="space-y-2 border-t border-gray-150 dark:border-gray-700 pt-4">
                            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Start a New Chat</p>
                            {availablePharmacists.map(ph => {
                              const currentUserId = userInfo.userId || userInfo._id || userInfo.id || 'customer';
                              const chatRoomId = [currentUserId, ph._id].sort().join('_');
                              
                              return (
                                <div
                                  key={ph._id}
                                  onClick={() => {
                                    const newConv = {
                                      id: chatRoomId,
                                      name: ph.pharmacyName || ph.name,
                                      pharmacistName: ph.name,
                                      avatar: '🏥',
                                      lastMessage: 'Tap to start a new chat...',
                                      time: 'New',
                                      online: true,
                                      role: 'pharmacist',
                                      otherUserId: ph._id
                                    };
                                    setConversations([newConv]);
                                    setSelectedChat(chatRoomId);
                                  }}
                                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition border border-gray-100 dark:border-gray-750"
                                >
                                  <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-base shadow-sm">
                                    🏥
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{ph.pharmacyName || ph.name}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-semibold">Pharmacist: {ph.name}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-2 flex flex-col ${selectedChat ? 'flex' : 'hidden lg:flex'} h-full bg-gray-50 dark:bg-gray-900`}>
              {selectedChat && currentChat ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition cursor-pointer"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl shadow-inner">
                          {currentChat.avatar}
                        </div>
                        {currentChat.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      <div className="leading-tight">
                        <h3 className="font-extrabold text-white text-base">{currentChat.name}</h3>
                        <p className="text-[10px] text-blue-100 font-medium">
                          {currentChat.role === 'pharmacist' ? `Pharmacist: ${currentChat.pharmacistName}` : 'Customer Partner'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message bubbles list */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-25rem)]">
                    {loadingMessages ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
                        <p className="text-xs text-gray-500 font-semibold">Decrypting history ledger...</p>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-2xl p-4 shadow-md ${
                                msg.sender === 'user'
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-150 dark:border-gray-700'
                              }`}
                            >
                              {msg.text && <p className="text-sm font-medium leading-relaxed break-words">{msg.text}</p>}
                              {msg.image && (
                                <img 
                                  src={msg.image} 
                                  alt="Attachment" 
                                  onClick={() => setZoomedImage(msg.image)}
                                  className="max-w-full max-h-48 rounded-xl shadow-md cursor-zoom-in hover:brightness-95 transition-all mt-1"
                                />
                              )}
                            </div>
                            <div className={`flex items-center space-x-1 mt-1 text-[10px] font-semibold text-gray-405 ${
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
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full w-fit mx-auto shadow-sm">
                          Secure P2P Encrypted Session Initiated
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message composition Input */}
                  <div className="bg-white dark:bg-gray-800 border-t border-gray-250 dark:border-gray-700 p-4">
                    <div className="flex items-center space-x-2">
                      {/* Photo Attachment Trigger */}
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={imageSending}
                        className="text-gray-450 hover:text-blue-600 dark:hover:text-blue-400 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
                      >
                        {imageSending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
                        ) : (
                          <Image className="h-5 w-5" />
                        )}
                      </button>
                      
                      {/* Hidden Image Input */}
                      <input 
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      <div className="flex-1">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type your message securely..."
                          className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-semibold"
                        />
                      </div>

                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white p-3.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/25">
                      <Mail className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Secure Channels
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                      Select a conversation channel in the sidebar to review prescription logs or chat with pharmacy partners.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded photo attachment modal zoom */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/80 p-2.5 rounded-full transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={zoomedImage} alt="Expanded Attachment" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;