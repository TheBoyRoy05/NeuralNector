import { useState, useCallback } from "react";
import axios, { type AxiosRequestConfig } from "axios";
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = supabaseUrl ? `${supabaseUrl}/functions/v1` : "/api/v1";
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

      const config: AxiosRequestConfig = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(anonKey && {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          }),
        },
        url: `${apiUrl}${url}`,
      };

      if (method.toUpperCase() === "GET" && body) {
        const params = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        config.url += `?${params.toString()}`;
      } else if (body) {
        config.data = body;
      }

      const { data } = await axios(config);

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
