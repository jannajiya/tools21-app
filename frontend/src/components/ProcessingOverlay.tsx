// src/components/ProcessingOverlay.tsx

const ProcessingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center text-lg font-semibold">
      Processing...
    </div>
  </div>
);

export default ProcessingOverlay;
