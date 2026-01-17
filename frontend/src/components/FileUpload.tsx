import { Upload } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
}

export default function FileUpload({
  file,
  onFileChange,
  accept = ".csv,.xlsx,.xls",
}: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };
  return (
    <div className="space-y-2">

      <label className="block text-sm font-medium text-gray-700">
        Upload File
      </label>

      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center w-full px-4 py-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-gray-100"
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {file ? file.name : "Click to upload or drag and drop"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              CSV or Excel files only
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
