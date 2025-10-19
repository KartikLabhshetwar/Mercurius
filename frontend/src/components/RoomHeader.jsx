import { useState } from 'react';
import { Copy, Trash2, Users, Settings } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const RoomHeader = ({ roomId, participantCount, isCreator, onDeleteRoom, onLeaveRoom }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopyLink = async () => {
    const link = window.location.href;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('Room link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteRoom = () => {
    if (onDeleteRoom) {
      onDeleteRoom();
    }
    setShowDeleteConfirm(false);
  };

  const handleLeaveRoom = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Room Info */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Room {roomId}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy room link"
          >
            <Copy className="h-5 w-5" />
          </button>

          {/* Room Actions */}
          <div className="relative">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Room options"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                {isCreator ? (
                  <>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Room
                    </button>
                    <div className="border-t border-gray-100"></div>
                  </>
                ) : null}
                <button
                  onClick={handleLeaveRoom}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Leave Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Room</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this room? This action cannot be undone and will remove all messages and media.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomHeader;
