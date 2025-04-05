import { useCallback, useEffect, useMemo, useState } from "react";
import { Checkbox } from 'antd'

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

export const useDarkMode = () => {
  //控制深色与浅色模式
  const [isDark, setIsDark] = useState(localStorage.isDark ? true : false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-prefers-color-scheme', 'dark')
      localStorage.isDark = 'true'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.removeAttribute('data-prefers-color-scheme')
      localStorage.isDark = ''
    }
  }, [isDark])

  const toggleMode = useCallback(() => {
    setIsDark(it => !it)
  }, [])

  const el = useMemo(() => {
    return (
      <span>
        <Checkbox onChange={toggleMode} checked={isDark}></Checkbox>
      </span>
    );
  }, [isDark, toggleMode])
  return [isDark, toggleMode, el] as const
}