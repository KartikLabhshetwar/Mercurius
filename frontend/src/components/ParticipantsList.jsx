import { useState } from 'react';
import { Users, ChevronDown, ChevronUp, User } from 'lucide-react';

const ParticipantsList = ({ participants, currentUsername }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white border-l border-gray-200 w-64 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <span className="font-medium text-gray-900">Participants</span>
            <span className="ml-2 text-sm text-gray-500">({participants.length})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Participants List */}
      {isExpanded && (
        <div className="p-4">
          {participants.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No participants</p>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.socketId}
                  className={`flex items-center p-2 rounded-lg ${
                    participant.username === currentUsername
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      participant.username === currentUsername
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      participant.username === currentUsername
                        ? 'text-indigo-900'
                        : 'text-gray-900'
                    }`}>
                      {participant.username}
                      {participant.username === currentUsername && (
                        <span className="ml-1 text-xs text-indigo-600">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(participant.joinedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;
