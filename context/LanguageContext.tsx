"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language } from "@/lib/types";
import { dictionary, Dictionary } from "@/lib/dictionary";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "az",
  setLanguage: () => {},
  t: dictionary.az,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("az");

  useEffect(() => {
    const saved = localStorage.getItem("hf_language") as Language | null;
    if (saved && (saved === "az" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("hf_language", lang);
  };

  const t = dictionary[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
