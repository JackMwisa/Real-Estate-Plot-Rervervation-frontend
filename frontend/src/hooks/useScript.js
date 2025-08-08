// src/hooks/useScript.js
import { useEffect, useState } from "react";

export default function useScript(src) {
  const [status, setStatus] = useState(src ? "loading" : "idle");
  useEffect(() => {
    if (!src) return;

    let script = document.querySelector(`script[src="${src}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => setStatus("ready");
      script.onerror = () => setStatus("error");
      document.body.appendChild(script);
    } else {
      setStatus("ready");
    }
    return () => {};
  }, [src]);

  return status;
}
