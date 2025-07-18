import React, { useState } from 'react';
import { bloodRequestAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  Calendar,
  FileText
} from 'lucide-react';

const DonationConfirmationModal = ({ isOpen, onClose, connectionRequest, onConfirmationUpdate, initialConfirmed = null }) => {
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setConfirmed(initialConfirmed);
      setNotes('');
    }
  }, [isOpen, initialConfirmed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmed === null) {
      toast.error('Please select whether you received the blood donation');
      return;
    }

    setSubmitting(true);
    try {
      const response = await bloodRequestAPI.confirmDonationReceipt(
        connectionRequest.id, 
        confirmed, 
        notes.trim()
      );
      
      if (response.success) {
        toast.success(`Donation receipt ${confirmed ? 'confirmed' : 'denied'} successfully`);
        if (onConfirmationUpdate) {
          onConfirmationUpdate();
        }
        // Reset form and close modal
        setConfirmed(null);
        setNotes('');
        onClose();
      } else {
        toast.error('Failed to update donation confirmation');
      }
    } catch (error) {
      console.error('Error updating donation confirmation:', error);
      toast.error('Failed to update donation confirmation');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !connectionRequest) return null;

  const donorName = connectionRequest.donor?.full_name || 'Unknown Donor';
  const patientName = connectionRequest.bloodRequest?.patient_name || 'Unknown Patient';
  const bloodType = `${connectionRequest.bloodRequest?.blood_type || ''}${connectionRequest.bloodRequest?.rh_factor || ''}`;
  const quantity = connectionRequest.bloodRequest?.quantity || 'Unknown';
  const donationDate = connectionRequest.donation_completed_at 
    ? new Date(connectionRequest.donation_completed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Confirm Blood Donation Receipt</h2>
              <p className="text-blue-100 mt-1">
                Donor: {donorName} | Patient: {patientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 pb-8">
          {/* Donation Details */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Donation Completed</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span><strong>Donor:</strong> {donorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span><strong>Date:</strong> {donationDate}</span>
              </div>
              <div>
                <strong>Blood Type:</strong> {bloodType}
              </div>
              <div>
                <strong>Quantity:</strong> {quantity} units
              </div>
            </div>
            
            {connectionRequest.donation_notes && (
              <div className="mt-3 p-3 bg-white rounded border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Donor's Notes:</span>
                </div>
                <p className="text-sm text-green-700">{connectionRequest.donation_notes}</p>
              </div>
            )}
          </div>

          {/* Confirmation Question */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Did you receive the blood donation as described? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors">
                <input
                  type="radio"
                  name="confirmed"
                  value="true"
                  checked={confirmed === true}
                  onChange={() => setConfirmed(true)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="ml-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <div className="font-medium text-green-800">Yes, I received the blood donation</div>
                    <div className="text-sm text-green-600">The donor successfully provided the blood as requested</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors">
                <input
                  type="radio"
                  name="confirmed"
                  value="false"
                  checked={confirmed === false}
                  onChange={() => setConfirmed(false)}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <div className="ml-3 flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <div className="font-medium text-red-800">No, I did not receive the blood donation</div>
                    <div className="text-sm text-red-600">There were issues with the donation process</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                confirmed === true 
                  ? "Thank you message or additional feedback about the donation process..." 
                  : confirmed === false
                  ? "Please explain what went wrong or why you didn't receive the donation..."
                  : "Your comments about the donation process..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={submitting}
            />
          </div>

          {/* Important Notice */}
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">Important Notice</span>
            </div>
            <p className="text-sm text-amber-700">
              Your confirmation helps maintain the integrity of our blood donation network. 
              This information will be logged for transparency and to help improve the donation process.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || confirmed === null}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                confirmed === true 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : confirmed === false
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-400'
              }`}
            >
              {submitting ? 'Submitting...' : confirmed === true ? 'Confirm Receipt' : confirmed === false ? 'Report Issue' : 'Submit'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationConfirmationModal;
