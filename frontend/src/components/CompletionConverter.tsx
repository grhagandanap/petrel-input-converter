import FileUpload from "./FileUpload";
import { useState, type FormEvent } from "react";
import type { CompletionFormData } from "../types/type";
import { Download, Loader2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

export default function CompletionConverter() {
  const [formData, setFormData] = useState<CompletionFormData>({
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.file) {
      setError("Please upload a correct file!");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("file", formData.file);

      const response = await fetch(`${API_BASE_URL}/convert/completion`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Conversion failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted_completion_data.ev";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error occured during conversion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FileUpload
        file={formData.file}
        onFileChange={(file) => {
          setFormData({ ...formData, file });
        }}
      />

      {error && (
        <div className="p-4 bg-red-50 border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.file}
        className="w-full flex justify-center items-center gap-2 px-6 py-3 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Converting...
          </>
        ) : (
          <>
            <Download className="mr-2" />
            Convert & Download
          </>
        )}
      </button>
    </form>
  );
}
