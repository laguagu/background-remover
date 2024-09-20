/**
 * Component that allows users to search and replace elements in an image using the Stability AI API.
 * Esimerkki prompt: husky standing on a beach with ocean waves
 * Esimerkki search_prompt: background
 * Toinen: golden retriever standing on a beach with ocean waves
 */

"use client";

import axios from "axios";
import React, { useState } from "react";

const StabilityAISearchReplace: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [desiredOutput, setDesiredOutput] = useState("");
  const [replaceElement, setReplaceElement] = useState("");
  const [outputFormat, setOutputFormat] = useState("webp");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => prev + info + "\n");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setDebugInfo("");

    if (!image || !desiredOutput || !replaceElement) {
      setError(
        "Please provide an image, desired output description, and element to replace.",
      );
      setLoading(false);
      return;
    }

    addDebugInfo(`Image size: ${image.size} bytes`);
    addDebugInfo(`Desired Output (prompt): ${desiredOutput}`);
    addDebugInfo(`Replace Element (search_prompt): ${replaceElement}`);
    addDebugInfo(`Output format: ${outputFormat}`);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", desiredOutput);
    formData.append("search_prompt", replaceElement);
    formData.append("output_format", outputFormat);

    try {
      addDebugInfo("Sending request to API...");
      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/edit/search-and-replace",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
            Accept: "image/*",
            "Content-Type": "multipart/form-data",
          },
          responseType: "arraybuffer",
        },
      );

      addDebugInfo(`Response status: ${response.status}`);
      addDebugInfo(`Response size: ${response.data.byteLength} bytes`);

      if (response.status === 200) {
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        setResult(`data:image/${outputFormat};base64,${base64}`);
        addDebugInfo("Image successfully processed and displayed");
      } else {
        throw new Error(
          `${response.status}: ${Buffer.from(response.data).toString()}`,
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
      addDebugInfo(`Error occurred: ${error.message}`);
      if (error.response) {
        addDebugInfo(`Error status: ${error.response.status}`);
        addDebugInfo(
          `Error data: ${Buffer.from(error.response.data).toString()}`,
        );
        setError(
          `Error ${error.response.status}: ${Buffer.from(error.response.data).toString()}`,
        );
      } else {
        setError(
          error.message || "An error occurred while processing the image.",
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">
        Stability AI Search and Replace
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Image to Edit
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full"
            required
          />
        </div>
        <div>
          <label
            htmlFor="desiredOutput"
            className="block text-sm font-medium text-gray-700"
          >
            Desired Output Description (prompt)
          </label>
          <input
            type="text"
            id="desiredOutput"
            value={desiredOutput}
            onChange={(e) => setDesiredOutput(e.target.value)}
            placeholder="e.g., Golden retriever standing in a field"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Describe what you want to see in the final image.
          </p>
        </div>
        <div>
          <label
            htmlFor="replaceElement"
            className="block text-sm font-medium text-gray-700"
          >
            Element to Replace (search_prompt)
          </label>
          <input
            type="text"
            id="replaceElement"
            value={replaceElement}
            onChange={(e) => setReplaceElement(e.target.value)}
            placeholder="e.g., dog"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Describe what you want to replace in the original image.
          </p>
        </div>
        <div>
          <label
            htmlFor="outputFormat"
            className="block text-sm font-medium text-gray-700"
          >
            Output Format
          </label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Replace Element"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <img
            src={result}
            alt="Edited image"
            className="max-w-full rounded-md shadow-lg"
          />
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {debugInfo}
        </pre>
      </div>
    </div>
  );
};

export default StabilityAISearchReplace;
