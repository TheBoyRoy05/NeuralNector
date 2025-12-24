import { useEffect, useState } from "react";

export default function useResponsive() {
  const [size, setSize] = useState(0);

  useEffect(() => {
    const checkSize = () => {
      setSize(window.innerWidth);
    };
    
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return { size };
}