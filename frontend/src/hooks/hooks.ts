import { useCallback, useEffect, useState } from "react";

export const useInput = (initialValue: string) => {
  const [value, setValue] = useState(() => initialValue);
  useEffect(() => {
    setValue(() => initialValue)
  }, [initialValue])

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return { value, onChange };
};
