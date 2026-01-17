import FileUpload from "./FileUpload";
import { useState, type FormEvent } from "react";
import type { RateFormData } from "../types/type";
import { Download, Loader2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

const timeDomain = ["DAILY", "MONTHLY"];
const fluidOptions = ["OIL", "WATER", "GAS", "WINJ"];

export default function RateConverter() {
  const [formData, setFormData] = useState<RateFormData>({
    file: null,
    timeDomain: null,
    fluidList: [],
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
    if (!formData.timeDomain) {
      setError("Please select the time domain!");
      return;
    }
    if (formData.fluidList.length === 0) {
      setError("Please select the fluids!");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("file", formData.file);
      data.append("time_domain", formData.timeDomain);
      formData.fluidList.forEach((fluid) => {
        data.append("fluids_list", fluid);
      });

      const response = await fetch(`${API_BASE_URL}/convert/rate`, {
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
      a.download = "converted_rate_data.vol";
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
          Time Domain
        </label>

        <div className="flex gap-4">
          {timeDomain.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setFormData({ ...formData, timeDomain: time })}
              className={`px-6 py-2 rounded-lg font-medium transition cursor-pointer border-2
        ${
          formData.timeDomain === time
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-100 border-gray-300"
        }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Fluid List */}
      <div className="space-y-2">
        <label
          htmlFor="time-domain"
          className="block text-sm font-medium text-gray-700"
        >
          Fluid List
        </label>

        <div className="flex gap-4">
          {fluidOptions.map((fluid) => (
            <button
              key={fluid}
              type="button"
              onClick={() => {
                if (formData.fluidList.includes(fluid)) {
                  // Remove fluid if already selected
                  setFormData({
                    ...formData,
                    fluidList: formData.fluidList.filter((f) => f !== fluid),
                  });
                } else {
                  // Add fluid if not selected
                  setFormData({
                    ...formData,
                    fluidList: [...formData.fluidList, fluid],
                  });
                }
              }}
              className={`px-6 py-2 rounded-lg font-medium transition cursor-pointer border-2
        ${
          formData.fluidList.includes(fluid)
            ? "bg-blue-500 text-white "
            : "text-gray-700 hover:bg-gray-100 border-gray-300"
        }`}
            >
              {fluid}
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
