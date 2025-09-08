import { createContext, useState } from 'react';

const InvestorsDataContext = createContext();

const InvestorsDataContextProvider = ({ children }) => {
  const [investorsData, setInvestorsData] = useState();

  return (
    <InvestorsDataContext.Provider value={{ investorsData, setInvestorsData }}>
      {children}
    </InvestorsDataContext.Provider>
  );
};

export { InvestorsDataContext, InvestorsDataContextProvider };