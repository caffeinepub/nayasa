import { type ReactNode, createContext, useContext, useState } from "react";

export interface SellFormData {
  brand: string;
  model: string;
  storage: string;
  condition: string;
}

export interface DiagnosticResult {
  name: string;
  result: "Pass" | "Fail";
}

export interface SellContextType {
  formData: SellFormData | null;
  diagnosticResults: DiagnosticResult[];
  quotedPrice: bigint;
  setFormData: (data: SellFormData) => void;
  setDiagnosticResults: (results: DiagnosticResult[]) => void;
  setQuotedPrice: (price: bigint) => void;
}

const SellContext = createContext<SellContextType | null>(null);

export function SellProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<SellFormData | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<
    DiagnosticResult[]
  >([]);
  const [quotedPrice, setQuotedPrice] = useState<bigint>(0n);

  return (
    <SellContext.Provider
      value={{
        formData,
        diagnosticResults,
        quotedPrice,
        setFormData,
        setDiagnosticResults,
        setQuotedPrice,
      }}
    >
      {children}
    </SellContext.Provider>
  );
}

export function useSell() {
  const ctx = useContext(SellContext);
  if (!ctx) throw new Error("useSell must be used within SellProvider");
  return ctx;
}
