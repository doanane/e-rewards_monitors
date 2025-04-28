import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash, faPlus, faPalette, faFont } from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import Select from 'react-select';

const CertificateGenerator = () => {
  // Certificate templates
  const templateOptions = [
    { value: 'excellence', label: 'Excellence Award' },
    { value: 'achievement', label: 'Achievement Award' },
    { value: 'service', label: 'Service Recognition' },
    { value: 'innovation', label: 'Innovation Award' },
  ];

  // State for certificate data
  const [certificate, setCertificate] = useState({
    template: templateOptions[0],
    recipientName: '',
    achievement: '',
    date: new Date().toISOString().split('T')[0],
    issuerName: 'Company Leadership Team',
    backgroundColor: '#ffffff',
    textColor: '#2c3e50',
    borderColor: '#3498db',
  });

  const certificateRef = useRef<HTMLDivElement>(null);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCertificate(prev => ({ ...prev, [name]: value }));
  };

  // Handle template selection
  const handleTemplateChange = (selectedOption: any) => {
    setCertificate(prev => ({ ...prev, template: selectedOption }));
  };

  // Generate and download certificate
  const downloadCertificate = () => {
    if (certificateRef.current) {
      html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      }).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) {
            saveAs(blob, `${certificate.recipientName}_Certificate.png`);
          }
        });
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setCertificate({
      template: templateOptions[0],
      recipientName: '',
      achievement: '',
      date: new Date().toISOString().split('T')[0],
      issuerName: 'Company Leadership Team',
      backgroundColor: '#ffffff',
      textColor: '#2c3e50',
      borderColor: '#3498db',
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Certificate Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Certificate Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Certificate Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Certificate Template</label>
              <Select
                options={templateOptions}
                value={certificate.template}
                onChange={handleTemplateChange}
                isSearchable={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Recipient Name</label>
              <input
                type="text"
                name="recipientName"
                value={certificate.recipientName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Enter recipient's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Achievement</label>
              <textarea
                name="achievement"
                value={certificate.achievement}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                rows={3}
                placeholder="Describe the achievement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={certificate.date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Issuer Name</label>
              <input
                type="text"
                name="issuerName"
                value={certificate.issuerName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <FontAwesomeIcon icon={faPalette} className="mr-2" />
                  Background
                </label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={certificate.backgroundColor}
                  onChange={handleChange}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <FontAwesomeIcon icon={faFont} className="mr-2" />
                  Text Color
                </label>
                <input
                  type="color"
                  name="textColor"
                  value={certificate.textColor}
                  onChange={handleChange}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <FontAwesomeIcon icon={faPalette} className="mr-2" />
                  Border Color
                </label>
                <input
                  type="color"
                  name="borderColor"
                  value={certificate.borderColor}
                  onChange={handleChange}
                  className="w-full h-10"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={downloadCertificate}
                disabled={!certificate.recipientName}
                className={`flex items-center px-4 py-2 rounded ${certificate.recipientName ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download Certificate
              </button>
              <button
                onClick={resetForm}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Certificate Preview</h2>
          <div className="flex justify-center">
            <div 
              ref={certificateRef}
              className="w-full max-w-md border-4 p-8 text-center"
              style={{
                backgroundColor: certificate.backgroundColor,
                color: certificate.textColor,
                borderColor: certificate.borderColor,
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <h2 className="text-3xl font-bold mb-6">Certificate of {certificate.template.label}</h2>
              <div className="mb-8 text-lg">
                This certificate is proudly presented to
              </div>
              <div className="text-4xl font-bold mb-8 border-b-2 pb-4 mx-auto px-8" style={{ borderColor: certificate.borderColor }}>
                {certificate.recipientName || 'Recipient Name'}
              </div>
              <div className="mb-8 text-lg">
                in recognition of:
              </div>
              <div className="text-xl italic mb-8">
                {certificate.achievement || 'Outstanding achievement and dedication'}
              </div>
              <div className="mt-auto">
                <div className="mb-4">
                  <span className="font-medium">Date: </span>
                  {certificate.date}
                </div>
                <div className="border-t-2 pt-4 mx-auto w-48" style={{ borderColor: certificate.borderColor }}>
                  <div>{certificate.issuerName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Certificates */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">Recently Generated Certificates</h2>
        <div className="flex items-center justify-center p-8 border-2 border-dashed rounded">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            View Certificate History
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;