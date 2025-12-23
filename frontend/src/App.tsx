import { useEffect } from "react";
import useHTTP from "./hooks/useHTTP";

function App() {
  const { http } = useHTTP();

  useEffect(() => {
    http({ url: "/images", method: "GET", handleData: (data) => {
      console.log(data);
    } });
  }, [http]);

  return <div>Hello World</div>
}

export default App
