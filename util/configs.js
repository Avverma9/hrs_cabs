const userData = localStorage.getItem("userData");
export const userId = userData ? JSON.parse(userData).loggedUserId : null;
