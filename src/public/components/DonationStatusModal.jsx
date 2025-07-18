import React, { useState } from 'react';
import { bloodRequestAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText
} from 'lucide-react';

const DonationStatusModal = ({ isOpen, onClose, connectionRequest, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error('Please select a donation status');
      return;
    }

    setSubmitting(true);
    try {
      const response = await bloodRequestAPI.markDonationCompleted(
        connectionRequest.id, 
        selectedStatus, 
        notes.trim()
      );
      
      if (response.success) {
        toast.success(`Donation marked as ${selectedStatus} successfully`);
        if (onStatusUpdate) {
          onStatusUpdate();
        }
        onClose();
        setSelectedStatus('');
        setNotes('');
      } else {
        toast.error('Failed to update donation status');
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      toast.error('Failed to update donation status');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !connectionRequest) return null;

  const patientName = connectionRequest.bloodRequest?.patient_name || 'Unknown Patient';
  const bloodType = `${connectionRequest.bloodRequest?.blood_type || ''}${connectionRequest.bloodRequest?.rh_factor || ''}`;
  const quantity = connectionRequest.bloodRequest?.quantity || 'Unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Update Donation Status</h2>
              <p className="text-red-100 mt-1">
                Patient: {patientName} | Blood Type: {bloodType} | {quantity} units
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 pb-8">
          {/* Current Status Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Blood Request Details</h3>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Hospital:</strong> {connectionRequest.bloodRequest?.hospital_name || 'Unknown'}</p>
              <p><strong>Contact:</strong> {connectionRequest.bloodRequest?.contact_name || 'N/A'} 
                {connectionRequest.bloodRequest?.contact_phone && (
                  <span> - {connectionRequest.bloodRequest.contact_phone}</span>
                )}
              </p>
              <p><strong>Purpose:</strong> {connectionRequest.bloodRequest?.purpose || 'General'}</p>
              {connectionRequest.bloodRequest?.urgency && (
                <p><strong>Urgency:</strong> <span className="capitalize">{connectionRequest.bloodRequest.urgency}</span></p>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Donation Status <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors">
                <input
                  type="radio"
                  name="donationStatus"
                  value="completed"
                  checked={selectedStatus === 'completed'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="ml-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <div className="font-medium text-green-800">Donation Completed Successfully</div>
                    <div className="text-sm text-green-600">I have successfully donated blood as requested</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors">
                <input
                  type="radio"
                  name="donationStatus"
                  value="failed"
                  checked={selectedStatus === 'failed'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <div className="ml-3 flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <div className="font-medium text-red-800">Donation Failed/Cancelled</div>
                    <div className="text-sm text-red-600">Donation could not be completed due to various reasons</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                selectedStatus === 'completed' 
                  ? "Any additional information about the donation process..." 
                  : selectedStatus === 'failed'
                  ? "Please explain why the donation could not be completed..."
                  : "Please provide additional details..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              disabled={submitting}
            />
          </div>

          {/* Warning for Failed Donations */}
          {selectedStatus === 'failed' && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Important Notice</span>
              </div>
              <p className="text-sm text-amber-700">
                If the donation could not be completed, please provide a reason so the requester can find alternative donors. 
                This helps maintain transparency in our blood donation network.
              </p>
            </div>
          )}

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
              disabled={submitting || !selectedStatus}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedStatus === 'completed' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : selectedStatus === 'failed'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-400'
              }`}
            >
              {submitting ? 'Updating...' : `Mark as ${selectedStatus || 'Selected'}`}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default DonationStatusModal;
