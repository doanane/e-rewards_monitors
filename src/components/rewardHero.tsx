import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const RewardHero = () => {
  const rewardCategories = [
    { name: "Gift Cards", icon: "🎁" },
    { name: "Travel Vouchers", icon: "✈️" },
    { name: "Tech Gadgets", icon: "📱" },
    { name: "Fashion", icon: "👕" },
    { name: "Experiences", icon: "🎭" },
  ];

  const [currentCategory, setCurrentCategory] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategory((prev) => (prev + 1) % rewardCategories.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-indigo-700 to-purple-800 text-white py-20 md:py-28">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 right-20 w-40 h-40 bg-teal-400 rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-pink-500 rounded-full mix-blend-screen"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Discover Your <span className="text-yellow-300">Perfect Reward</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Explore our exclusive collection of gifts, experiences, and vouchers - 
            all available for redemption with your loyalty.
          </p>
          
          {/* Rotating reward categories */}
          <div className="inline-block bg-white bg-opacity-10 backdrop-blur-sm rounded-xl px-6 py-4 mb-8 border border-white border-opacity-20">
            <div className="flex items-center justify-center space-x-3 min-h-[60px]">
              <span className="text-3xl">
                {rewardCategories[currentCategory].icon}
              </span>
              <span className="text-xl font-medium">
                {rewardCategories[currentCategory].name}
              </span>
            </div>
          </div>
          
          {/* Simple arrow indicator */}
          {/* <div className="animate-bounce">
            <svg 
              className="w-8 h-8 mx-auto text-yellow-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
            <p className="text-sm mt-2 opacity-80">Scroll to explore</p>
          </div> */}
        </div>
      </div>
      
      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden transform rotate-180">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="fill-current text-white"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default RewardHero;