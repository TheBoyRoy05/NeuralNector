import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

interface HTTPProps {
  url: string;
  method: string;
  body?: object;
  handleData?: (data: unknown) => void;
  handleSuccess?: () => void;
  handleError?: (error: unknown) => void;
}

const useHTTP = () => {
  const [loading, setLoading] = useState(false);

  const http = useCallback(async ({ url, method, body, handleData, handleSuccess, handleError }: HTTPProps) => {
    setLoading(true);

    try {
      const { data } = await axios({
        method,
        headers: { "Content-Type": "application/json" },
        url: `http://localhost:8000/api/v1${url}`,
        data: body,
      });

      if (data.error) throw new Error(data.error);
      if (handleData) handleData(data);
      if (handleSuccess) handleSuccess();

      return true;
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : "An unexpected error occurred";
      toast.error(message);
      if (handleError) handleError(error);

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { http, loading };
};

export default useHTTP;
