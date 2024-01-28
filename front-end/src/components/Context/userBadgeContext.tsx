import React, { createContext, useContext, useState } from "react";

type UserContextProviderProps = {
  children: React.ReactNode;
};

type UserBadgeContext  = {
    userBadge: Number;
    setUserBadge: React.Dispatch<React.SetStateAction<number>>;
};

export const UserBadgeContext = createContext<UserBadgeContext | null>(null);

export function useUserBadgeContext() {
  const userBadge = useContext(UserBadgeContext);

  if (userBadge === undefined) {
    throw new Error('useUserBadgeContext must be used with a UserBadgeContext');
  }

  return userBadge;
}

export const UserBadgeProvider = ({ children }: UserContextProviderProps) => {
  const [userBadge, setUserBadge] = useState(0);

  return (
    <UserBadgeContext.Provider value={{userBadge, setUserBadge}}>
      {children}
    </UserBadgeContext.Provider>
  )
};
