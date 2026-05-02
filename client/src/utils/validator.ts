/**
 * Validates and sanitizes an email address.
 * @param {string} email - The email address to validate.
 * @returns {object} - Returns an object with success status and payload.
 */
export function validateEmail(email: string): {
  success: boolean;
  payload: string;
} {
  const emailRegex = /^[^\s@]+@iiitkottayam.ac.in$/;
  if (emailRegex.test(email)) {
    return { success: true, payload: email.trim().toLowerCase() };
  }
  return { success: false, payload: "Use Institute Email address" };
}

/**
 * Validates and sanitizes a phone number.
 * @param {string} phone - The phone number to validate.
 * @returns {object} - Returns an object with success status and payload.
 */
export function validatePhone(phone: string): {
  success: boolean;
  payload: string;
} {
  const phoneRegex = /^[0-9]{10}$/;
  if (phoneRegex.test(phone)) {
    return { success: true, payload: phone.trim() };
  }
  return { success: false, payload: "Invalid phone number" };
}

/**
 * Validates and sanitizes a name.
 * @param {string} name - The name to validate.
 * @returns {object} - Returns an object with success status and payload.
 */
export function validateName(name: string): {
  success: boolean;
  payload: string;
} {
  const nameRegex = /^[a-zA-Z.\s]+$/;
  if (nameRegex.test(name)) {
    return { success: true, payload: name.trim() };
  }
  return { success: false, payload: "Invalid name" };
}

/**
 * Validates a password.
 * @param {string} password - The password to validate.
 * @returns {object} - Returns an object with success status and payload.
 */
export function validatePassword(password: string): {
  success: boolean;
  payload: string;
} {
  if (password.length >= 6) {
    return { success: true, payload: password };
  }
  return {
    success: false,
    payload: "Password must be at least 6 characters long",
  };
}
