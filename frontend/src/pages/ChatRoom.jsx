import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom.js';
import { useMessages } from '../hooks/useMessages.js';
import { useSocket } from '../hooks/useSocket.js';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';
import RoomHeader from '../components/RoomHeader.jsx';
import ParticipantsList from '../components/ParticipantsList.jsx';
import { generateRandomUsername } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const { socket, isConnected } = useSocket();
  const { 

    username, 
    isCreator, 
    joinRoom, 
    leaveRoom, 
    deleteRoom 
  } = useRoom();
  
  const { 
    messages, 
    participants, 
    sendMessage, 
    sendMedia, 
    sendEmoji 
  } = useMessages(roomId);

  // Auto-join room with generated username
  useEffect(() => {
    if (!username && roomId && isConnected) {
      const generatedUsername = generateRandomUsername();
      console.log('Auto-joining room with username:', generatedUsername);
      handleAutoJoin(generatedUsername);
    }
  }, [username, roomId, isConnected]);

  // Handle room deletion
  const handleDeleteRoom = async () => {
    try {
      await deleteRoom();
      toast.success('Room deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to delete room');
    }
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  // Auto-join room with generated username
  const handleAutoJoin = async (generatedUsername) => {
    try {
      console.log('Attempting to auto-join room:', roomId, 'with username:', generatedUsername);
      await joinRoom(roomId, generatedUsername);
      toast.success(`Joined room as ${generatedUsername}!`);
    } catch (error) {
      console.error('Auto-join failed:', error);
      toast.error(error.message || 'Failed to join room');
    }
  };


  // Handle room deletion from server
  useEffect(() => {
    if (socket) {
      const handleRoomDeleted = () => {
        toast.error('Room has been deleted by the creator');
        navigate('/');
      };

      socket.on('room-deleted', handleRoomDeleted);

      return () => {
        socket.off('room-deleted', handleRoomDeleted);
      };
    }
  }, [socket, navigate]);

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Room</h1>
          <p className="text-gray-600 mb-4">Room ID is missing</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Loading State */}
      {!username && isConnected && (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Joining Room...</h2>
            <p className="text-gray-600">Please wait while we connect you to the chat</p>
          </div>
        </div>
      )}

      {/* Connection Error */}
      {!isConnected && (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">Unable to connect to the chat server</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      {username && (
        <>
          {/* Header */}
          <RoomHeader
            roomId={roomId}
            participantCount={participants.length}
            isCreator={isCreator}
            onDeleteRoom={handleDeleteRoom}
            onLeaveRoom={handleLeaveRoom}
          />

          {/* Chat Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 flex flex-col">
              <MessageList 
                messages={messages} 
                currentUsername={username}
              />
              <MessageInput
                onSendMessage={(message) => sendMessage(message, username)}
                onSendMedia={(mediaUrl, mediaType) => sendMedia(mediaUrl, mediaType, username)}
                onSendEmoji={(emoji) => sendEmoji(emoji, username)}
                roomId={roomId}
                username={username}
                isConnected={isConnected}
              />
            </div>

            {/* Participants Sidebar */}
            <ParticipantsList 
              participants={participants}
              currentUsername={username}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatRoom;
