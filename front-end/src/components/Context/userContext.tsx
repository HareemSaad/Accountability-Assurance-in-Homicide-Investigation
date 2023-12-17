import React, { createContext, useContext, useState } from "react";

type UserContextProviderProps = {
  children: React.ReactNode;
};

type User = "Captain" | "Detective" | "Officer" | "Moderator" | "";

type UserContext  = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

export const UserContext = createContext<UserContext | null>(null);

export function useUserContext() {
  const user = useContext(UserContext);

  if (user === undefined) {
    throw new Error('useUserContext must be used with a UserContext');
  }

  return user;
}

export const UserProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<User>("");

  // const updateUser = (newUser) => {
  //   setUser(newUser);
  // };

  return (
    // <UserContext.Provider >value={{ user, setUser }}>
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  )
};
