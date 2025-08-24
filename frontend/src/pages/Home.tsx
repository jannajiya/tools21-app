// src/pages/Home.tsx
import { FiUpload, FiSettings, FiShield } from 'react-icons/fi';
import ToolCard from '../components/ToolCard';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCsvData } from '../context/CsvContext';
import Footer from '../components/Footer';

// Different animations
const spinAnimation = {
  rotate: 360,
  transition: { repeat: Infinity, duration: 1, ease: 'linear' }
};

const bounceAnimation = {
  y: [0, -10, 0],
  transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' }
};

const flipAnimation = {
  rotateY: 360,
  transition: { repeat: Infinity, duration: 1.5, ease: 'linear' }
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { setParsedData, setBasicDetails } = useCsvData();

  const handleToolCardClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('http://localhost:5000/parse-csv', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success && result.parsedData && result.basicDetails) {
        setParsedData(result.parsedData);
        setBasicDetails(result.basicDetails);
        toast.success('File parsed successfully!');
        navigate('/csv-parser');
      } else {
        toast.error(result.error || 'Parsing failed');
      }
    } catch {
      toast.error('Something went wrong while parsing.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Convert Your JK Bank Statements to Tally XML
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          A powerful toolset to parse bank CSVs, apply custom mappings, and generate secure XMLs for Tally import.
        </p>
      </section>

      <section className="flex flex-wrap justify-center gap-6 mb-12">
        <ToolCard
          title="Upload JK Bank CSV"
          description="Click to upload and auto-parse your bank statement."
          icon={FiUpload}
          hoverAnimation={bounceAnimation}
          onClick={handleToolCardClick}
        />
        <ToolCard
          title="Custom Mapping"
          description="Define and manage your own field mappings."
          icon={FiSettings}
          hoverAnimation={spinAnimation}
          to="/mapping"
        />
        <ToolCard
          title="Secure Processing"
          description="Encrypt, validate, and export secure XMLs."
          icon={FiShield}
          hoverAnimation={flipAnimation}
          to="/GSTR2A"
        />
      </section>
      {/* 🌐 Footer */}
      <Footer />

    </main>
  );
}