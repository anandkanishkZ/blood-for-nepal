import React from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ActionableToast = ({ message, action, actionText, onAction }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (action === 'login') {
      navigate('/login');
    } else if (action === 'register') {
      navigate('/register');
    }
    toast.dismiss();
  };

  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="text-sm font-medium">{message}</div>
      <div className="flex gap-2">
        <button
          onClick={handleAction}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200 flex-1"
        >
          {actionText}
        </button>
        <button
          onClick={() => toast.dismiss()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors duration-200"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export const showActionableToast = {
  error: (message, action, actionText, onAction) => {
    toast.error(
      <ActionableToast 
        message={message} 
        action={action} 
        actionText={actionText} 
        onAction={onAction}
      />,
      {
        position: "top-right",
        autoClose: 10000, // Longer duration for actionable toasts
        hideProgressBar: false,
        closeOnClick: false, // Prevent accidental dismissal
        pauseOnHover: true,
        draggable: true,
        className: "!p-2" // Add padding to toast container
      }
    );
  },
  
  info: (message, action, actionText, onAction) => {
    toast.info(
      <ActionableToast 
        message={message} 
        action={action} 
        actionText={actionText} 
        onAction={onAction}
      />,
      {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        className: "!p-2"
      }
    );
  }
};

export default ActionableToast;
