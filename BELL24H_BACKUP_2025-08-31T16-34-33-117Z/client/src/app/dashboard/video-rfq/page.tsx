'use client';

export default function VideoRFQPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
              <span>🎥</span>
              Video-Based RFQ Submission
            </h2>
            <p className='text-gray-600'>
              Submit RFQs using video with privacy masking and AI analysis
            </p>
          </div>
          <div className='bg-purple-50 rounded-lg p-4'>
            <div className='text-2xl font-bold text-purple-600'>24</div>
            <div className='text-sm text-purple-700'>Video RFQs</div>
          </div>
        </div>
      </div>
      {/* Video Upload Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <span>📷</span>
            Record Video RFQ
          </h3>
          <div className='bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4'>
            <div className='text-center'>
              <span>🎥</span>
              <p className='text-gray-500'>Click to start recording</p>
            </div>
          </div>
          <button className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center'>
            <span>📷</span>
            Start Recording
          </button>
        </div>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <span>⬆️</span>
            Upload Video RFQ
          </h3>
          <div className='border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center mb-4'>
            <div className='text-center'>
              <span>📄</span>
              <p className='text-gray-500'>Drop video file here or click to browse</p>
              <p className='text-xs text-gray-400 mt-1'>MP4, MOV, AVI up to 100MB</p>
            </div>
          </div>
          <button className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center'>
            <span>⬆️</span>
            Upload Video
          </button>
        </div>
      </div>
      {/* Privacy & Security Features */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <span>🛡️</span>
          Privacy & Security Features
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-green-50 rounded-lg p-4'>
            <span>🛡️</span>
            <h4 className='font-medium text-gray-900 mb-1'>Privacy Masking</h4>
            <p className='text-sm text-gray-600'>Automatic face and sensitive data blurring</p>
          </div>
          <div className='bg-blue-50 rounded-lg p-4'>
            <span>🎥</span>
            <h4 className='font-medium text-gray-900 mb-1'>AI Analysis</h4>
            <p className='text-sm text-gray-600'>Automatic RFQ extraction from video content</p>
          </div>
          <div className='bg-purple-50 rounded-lg p-4'>
            <span>📄</span>
            <h4 className='font-medium text-gray-900 mb-1'>Secure Storage</h4>
            <p className='text-sm text-gray-600'>Encrypted video storage with access controls</p>
          </div>
        </div>
      </div>
      {/* Recent Video RFQs */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recent Video RFQs</h3>
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-3'>
                  <div className='w-16 h-12 bg-gray-200 rounded flex items-center justify-center'>
                    <span>▶️</span>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900'>Manufacturing Equipment RFQ #{i}</h4>
                    <p className='text-sm text-gray-500'>Uploaded 2 hours ago • 2:34 duration</p>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <button className='text-blue-600 hover:text-blue-800 text-sm'>View</button>
                  <button className='text-green-600 hover:text-green-800 text-sm'>Process</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
