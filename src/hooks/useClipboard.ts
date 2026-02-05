import { useState, useCallback, useRef } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

interface UseClipboardReturn {
  isCopied: boolean;
  copy: (text: string) => Promise<boolean>;
}

export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}): UseClipboardReturn {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
        timeoutRef.current = null;
      }, timeout);

      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setIsCopied(false);
      return false;
    }
  }, [timeout]);

  return { isCopied, copy };
}
