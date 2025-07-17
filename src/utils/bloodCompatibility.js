/**
 * Blood Type Compatibility Utility
 * Handles blood type compatibility between donors and recipients
 */

/**
 * Get compatible donor blood types for a recipient
 * @param {string} recipientBloodType - The recipient's blood type (e.g., 'A+', 'B-')
 * @returns {string[]} Array of compatible donor blood types
 */
export const getCompatibleDonorTypes = (recipientBloodType) => {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibility[recipientBloodType] || [];
};

/**
 * Get compatible recipient blood types for a donor
 * @param {string} donorBloodType - The donor's blood type (e.g., 'A+', 'B-')
 * @returns {string[]} Array of compatible recipient blood types
 */
export const getCompatibleRecipientTypes = (donorBloodType) => {
  const compatibility = {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] // Universal donor
  };
  
  return compatibility[donorBloodType] || [];
};

/**
 * Check if a donor can donate to a recipient
 * @param {string} donorBloodType - The donor's blood type
 * @param {string} recipientBloodType - The recipient's blood type
 * @returns {boolean} True if donor can donate to recipient
 */
export const canDonateToRecipient = (donorBloodType, recipientBloodType) => {
  const compatibleDonorTypes = getCompatibleDonorTypes(recipientBloodType);
  return compatibleDonorTypes.includes(donorBloodType);
};

/**
 * Check if a recipient can receive from a donor
 * @param {string} recipientBloodType - The recipient's blood type
 * @param {string} donorBloodType - The donor's blood type
 * @returns {boolean} True if recipient can receive from donor
 */
export const canReceiveFromDonor = (recipientBloodType, donorBloodType) => {
  return canDonateToRecipient(donorBloodType, recipientBloodType);
};

/**
 * Get blood type compatibility info for display
 * @param {string} bloodType - The blood type to get info for
 * @returns {object} Object containing donor and recipient compatibility info
 */
export const getBloodTypeCompatibilityInfo = (bloodType) => {
  return {
    canReceiveFrom: getCompatibleDonorTypes(bloodType),
    canDonateTo: getCompatibleRecipientTypes(bloodType)
  };
};
