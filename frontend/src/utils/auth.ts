// utils/auth.ts

export const getToken = (): string | null => {
    return localStorage.getItem("token");
  };
  
  export const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };
  
  export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };
  
  export const setUser = (user: any) => {
    localStorage.setItem("user", JSON.stringify(user));
  };
  

  export const isAuthenticated = () => {
    return !!getToken();
  };

  
  export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };

  export const getUserName = () => {
    const username = localStorage.getItem("username");
    return username;
  };
  
  