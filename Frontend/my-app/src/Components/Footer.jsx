import React from "react";

const Footer = () => {
  return (
    <footer className="bg-green-500 text-black py-6">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-4">
        {/* Left Side */}
        <p className="text-sm">
          © 2025 VoteChain Inc. All rights reserved.
        </p>

        {/* Right Side */}
        <div className="flex space-x-6 mt-2 sm:mt-0 text-sm">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
