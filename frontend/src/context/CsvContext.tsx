import  { createContext, useState, type ReactNode, useContext } from 'react';

interface Transaction {
  date: string;
  narration: string;
  amount: number;
  type: string;
  balance: number;
}

interface BasicDetails {
  accountHolder: string;
  accountNumber: string;
  statementPeriod: string;
  openingBalance: string;
  closingBalance: string;
}

interface CsvContextType {
  parsedData: Transaction[];
  setParsedData: (data: Transaction[]) => void;
  basicDetails: BasicDetails | null;
  setBasicDetails: (data: BasicDetails) => void;
}

const CsvContext = createContext<CsvContextType | undefined>(undefined);

export const CsvProvider = ({ children }: { children: ReactNode }) => {
  const [parsedData, setParsedData] = useState<Transaction[]>([]);
  const [basicDetails, setBasicDetails] = useState<BasicDetails | null>(null);

  return (
    <CsvContext.Provider value={{ parsedData, setParsedData, basicDetails, setBasicDetails }}>
      {children}
    </CsvContext.Provider>
  );
};

export const useCsvData = () => {
  const context = useContext(CsvContext);
  if (!context) {
    throw new Error("useCsvData must be used within CsvProvider");
  }
  return context;
};
