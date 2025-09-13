import { createContext, useState, ReactNode } from 'react';
import { IUser } from '../@types/interface';

export type Globals = {
  userLogin: IUser;
};

export type SpecificGlobals = {
  userLogin: IUser;
};

export type GlobalsContextValue = {
  globals: Globals;
  saveGlobals: (updateGlobals: Globals) => void;
};

interface GlobalsProviderProps {
  children: ReactNode;
  // pageGlobals?: SpecificGlobals | void
}

const initialGlobals: Globals = {
  userLogin: {} as IUser,
};

export const GlobalsContext = createContext<GlobalsContextValue>({
  saveGlobals: () => null,
  globals: initialGlobals,
});

export const GlobalsProvider = ({ children }: GlobalsProviderProps) => {
  const [globals, setGlobals] = useState<Globals>({ ...initialGlobals });

  const saveGlobals = (updatedGlobals: Globals) => {
    // console.log(updatedGlobals)
    setGlobals(updatedGlobals);
  };

  return (
    <GlobalsContext.Provider value={{ globals, saveGlobals }}>
      {children}
    </GlobalsContext.Provider>
  );
};

export const GlobalsConsumer = GlobalsContext.Consumer;
