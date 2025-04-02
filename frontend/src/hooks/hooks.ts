import { useCallback, useState } from "react";

export const useInput = (initialValue: string) => {
  const [input, setInput] = useState(() => initialValue);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return { input, onChange };
};
