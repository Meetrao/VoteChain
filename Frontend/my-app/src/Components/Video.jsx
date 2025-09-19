import React from 'react';

const WebioInterface = () => {
  return (
    <div className="min-h-screen flex max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden">
      {/* Left Panel - Video Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h1 className="text-5xl font-bold text-black">
                Engagement & Nurture Marketing Strategy
              </h1>
              <p className="text-base pt-4 text-slate-500">
                Social Media Marketing
              </p>
            </div>
          </div>
        </div>

       {/* Video Container */}
<div className="p-6">
  <div className="h-[650px] bg-gray-100 rounded-t-3xl flex items-center justify-center relative overflow-hidden">
    <p className="text-white text-lg"></p>
  </div>

  {/* Paragraph under video */}
  <div className="mt-6">
    <p className="text-slate-600 text-lg leading-relaxed">
     Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae consequuntur quibusdam sint a, neque quidem provident, amet illo placeat fugiat, officiis quisquam delectus incidunt commodi? Dolorum libero aspernatur recusandae molestias sed cum odio blanditiis magni est, tempore quaerat modi aperiam?
    </p>
  </div>
</div>
      </div>
    </div>
  );
};

export default WebioInterface;
