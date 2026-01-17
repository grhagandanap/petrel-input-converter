import FileUpload from "./FileUpload";
import { useState, type FormEvent } from "react";
import type { PressureFormData } from "../types/type";
import { Download, Loader2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

const methodOptions = ["average", "max", "min"];

export default function PressureConverter() {
  const [formData, setFormData] = useState<PressureFormData>({
    file: null,
    methodAggregate: null,
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
    if (!formData.methodAggregate) {
      setError("Please select the method!");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("file", formData.file);
      data.append("method", formData.methodAggregate);

      const response = await fetch(`${API_BASE_URL}/convert/pressure`, {
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
      a.download = "converted_pressure_data.vol";
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

      {/* Time Domain */}
      <div className="space-y-2">
        <label
          htmlFor="time-domain"
          className="block text-sm font-medium text-gray-700"
        >
          Aggregate Method
        </label>

        <div className="flex gap-4">
          {methodOptions.map((methodItem) => (
            <button
              key={methodItem}
              type="button"
              onClick={() => setFormData({ ...formData, methodAggregate: methodItem })}
              className={`px-6 py-2 rounded-lg font-medium transition cursor-pointer border-2
            ${
              formData.methodAggregate === methodItem
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100 border-gray-300"
            }`}
            >
              {methodItem}
            </button>
          ))}
        </div>
      </div>

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
