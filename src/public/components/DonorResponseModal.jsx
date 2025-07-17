import React, { useState } from 'react';
import { X, Heart, UserX, MessageSquare } from 'lucide-react';

const DonorResponseModal = ({ isOpen, onClose, onConfirm, action, requestDetails }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(action, message);
    setMessage('');
    onClose();
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const isAccept = action === 'accepted';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${isAccept ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isAccept ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
              )}
              <div>
                <h3 className={`text-lg font-semibold ${isAccept ? 'text-green-900' : 'text-red-900'}`}>
                  {isAccept ? 'Accept Blood Request' : 'Decline Blood Request'}
                </h3>
                <p className={`text-sm ${isAccept ? 'text-green-700' : 'text-red-700'}`}>
                  {isAccept 
                    ? 'You are helping save a life!' 
                    : 'Let them know why you cannot help'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Request Summary */}
        {requestDetails && (
          <div className="p-4 bg-gray-50 border-b">
            <h4 className="font-medium text-gray-900 mb-2">Request Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Patient:</strong> {requestDetails.bloodRequest?.patient_name || 'N/A'}</div>
              <div><strong>Blood Type:</strong> {requestDetails.bloodRequest?.blood_type || 'N/A'}{requestDetails.bloodRequest?.rh_factor || ''}</div>
              <div><strong>Quantity:</strong> {requestDetails.bloodRequest?.quantity || 'N/A'} units</div>
              <div><strong>Hospital:</strong> {requestDetails.bloodRequest?.hospital_name || 'N/A'}</div>
              <div><strong>Urgency:</strong> <span className="capitalize">{requestDetails.bloodRequest?.urgency || 'N/A'}</span></div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              {isAccept ? 'Message to the requester (optional)' : 'Reason for declining (optional)'}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isAccept 
                  ? "e.g., I can help with this blood donation. Please contact me to coordinate the process."
                  : "e.g., Sorry, I'm not available at this time due to personal reasons."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isAccept
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isAccept ? 'Confirm - I Will Help' : 'Confirm - Cannot Help'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            {isAccept ? (
              <>
                <strong>Note:</strong> By accepting, your contact information will be shared with the requester so they can coordinate the blood donation process with you.
              </>
            ) : (
              <>
                <strong>Note:</strong> Your response will help the requester understand your situation and find alternative donors.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorResponseModal;
