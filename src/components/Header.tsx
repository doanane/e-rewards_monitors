// src/components/Header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [hasNotification, setHasNotification] = useState(false);
  const dotColor = hasNotification ? '#87CEEB' : 'gray';
  
  return (
    <header className="header">
      <Link href="/" className="logo-link">
        <div className="logo-container">
          <Image 
            src="/reward_icon.png"
            alt="reward_icon logo"
            width={40}
            height={38}
            priority
            className="logo-image"
          />
          <span className="logo-text">Rewards</span>
        </div>
      </Link>

      <div className="search-container">
        <Image
          src="/search_icon.png"
          alt="Search Icon"
          width={20}
          height={20}
          className="search-icon"
        />
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />
      </div>

      <div className="notification-container">
        <button 
          onClick={() => setHasNotification(!hasNotification)}
          className="notification-button"
        >
          <Image
            src="/notification_icon.png"
            alt="Notification Icon"
            width={24}
            height={24}
            className="notification-icon"
          />
          <span 
            className="notification-dot"
            style={{ backgroundColor: dotColor }}
          />
        </button>
      </div>

      <style jsx>{`
        .header {
          background-color: #fff;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          font-weight: bold;
          font-size: 1.5rem;
          color: inherit;
          min-width: fit-content;
        }

         .logo-container {
          display: flex;
          align-items: center;  /* Vertical alignment */
          gap: 0.75rem;        /* Space between icon and text */
        }

        .logo-image {
          /* Remove any margin that might be pushing things apart */
          margin: 0;
          /* Ensure consistent sizing */
          width: 40px;
          height: 38px;
          flex-shrink: 0; /* Prevent icon from shrinking */
        }

         .logo-text {
          font-weight: bold;
          font-size: 1.5rem;
          white-space: nowrap; /* Prevent text from wrapping */
        }
        
        .search-container {
          display: flex;
          align-items: center;
          border: 1px solid #ADD8E6;
          border-radius: 20px;
          padding: 0.5rem;
          flex-grow: 1;
          max-width: 500px;
          min-width: 150px;
        }
        
        .search-icon {
          margin-right: 0.5rem;
        }
        
        .search-input {
          border: none;
          outline: none;
          width: 100%;
          background: transparent;
        }
        
        .notification-container {
          display: flex;
          align-items: center;
          position: relative;
          min-width: fit-content;
        }
        
        .notification-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          position: relative;
        }
        
        .notification-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          right: 2px;
        }
        
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .search-container {
            max-width: 100%;
            order: 3;
          }
          
          .logo-link {
            justify-content: center;
            display: flex;
          }
          
          .notification-container {
            position: absolute;
            right: 1rem;
            top: 1rem;
          }
        }

         .logo-text {
            font-size: 1.25rem;
          }
          
          .logo-container {
            gap: 0.5rem;
          }
          
          .logo-image {
            width: 32px;
            height: 30px;
          }
        }
        
        @media (max-width: 480px) {
          .header {
            padding: 0.75rem;
          }
          
          .logo-text {
            font-size: 1.25rem;
          }
          
          .logo-image {
            margin-right: 0.75rem;
            width: 32px;
            height: 30px;
          }
        }
      `}</style>
    </header>
  );
}