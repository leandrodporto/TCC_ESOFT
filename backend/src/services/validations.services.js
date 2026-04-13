const userTypes = ['ROOT', 'ADMIN', 'NOTARYBOSS', 'TECHNICAL', 'LOGISTICS', 'DRIVER', 'TRAINEE']

export const validateUserData = async (data) => {
  const { name, email, phone, userType } = data;
  if (!name || !email || !phone || !userType) {
    throw new Error("All fields are required");
  }
  if (typeof name !== "string" || typeof email !== "string" || typeof phone !== "string" || typeof userType !== "string") {
    throw new Error("All fields must be of type string");
  } 
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email format");
  }
  if (!/^\d{10,15}$/.test(phone)) {
    throw new Error("Invalid phone number format");
  }
  if (!userTypes.includes(userType)) {
    throw new Error("Invalid user type");
  }
};

export const validateUserId = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }
  if (typeof id !== "string") {
    throw new Error("User ID must be of type string");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error("Invalid User ID format");   
  }
};

