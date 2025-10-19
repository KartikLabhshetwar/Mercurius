import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom.js';
import { generateRandomUsername, extractRoomIdFromUrl, isValidUrl } from '../utils/helpers.js';
import toast from 'react-hot-toast';
import { Copy, MessageCircle, Plus } from 'lucide-react';

const Home = () => {
  console.log('🏠 Home component loaded');
  
  const [roomInput, setRoomInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useRoom();

  const handleCreateRoom = async () => {
    console.log('🏠 Creating new room...');
    setIsCreating(true);
    try {
      const generatedUsername = generateRandomUsername();
      console.log('🎲 Generated username:', generatedUsername);
      const result = await createRoom(generatedUsername);
      console.log('✅ Room created successfully:', result);
      toast.success(`Room created successfully! Joined as ${generatedUsername}`);
      navigate(`/room/${result.roomId}`);
    } catch (error) {
      console.error('❌ Failed to create room:', error);
      toast.error(error.message || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomInput.trim()) {
      toast.error('Please enter a room ID or link');
      return;
    }

    console.log('🚪 Joining existing room...');
    setIsJoining(true);
    try {
      let roomId = roomInput.trim();
      console.log('🔍 Processing room input:', roomId);
      
      // Extract room ID from URL if it's a full URL
      if (isValidUrl(roomId)) {
        const extractedId = extractRoomIdFromUrl(roomId);
        if (extractedId) {
          roomId = extractedId;
          console.log('🔗 Extracted room ID from URL:', roomId);
        } else {
          throw new Error('Invalid room link');
        }
      }

      const generatedUsername = generateRandomUsername();
      console.log('🎲 Generated username for joining:', generatedUsername);
      await joinRoom(roomId, generatedUsername);
      console.log('✅ Successfully joined room');
      toast.success(`Joined room successfully! Joined as ${generatedUsername}`);
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('❌ Failed to join room:', error);
      toast.error(error.message || 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mercurius</h1>
          <p className="text-gray-600">Secure, disposable chat rooms with auto-generated usernames</p>
        </div>

        <div className="space-y-6">
          {/* Create Room Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-600" />
              Create New Room
            </h2>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating || isJoining}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          {/* Join Room Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Copy className="h-5 w-5 mr-2 text-blue-600" />
              Join Existing Room
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
                placeholder="Enter room ID or paste room link"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleJoinRoom}
                disabled={isCreating || isJoining}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Features</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Real-time chat
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Media sharing
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Emoji support
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Auto usernames
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Disposable rooms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
