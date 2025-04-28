"use client";

import Image from "next/image";
import Header from '@/components/Header';
import Link from "next/link";
import { JSX, useState } from 'react';
import ReportsPage from "@/pages/reports";
import RegionsPage from "@/pages/region";
import DepartmentsPage from "@/pages/department";
import NominationsPage from "@/pages/nominations";
import EmployeesPage from "@/pages/employees";
import CertificateGenerator from "@/pages/certificates";
import RewardsCatalog from "@/pages/rewardCatalog";
import RewardHero from "@/components/rewardHero";
import EmployeeRewardNomination from "@/pages/customer";

export default function Home() {
  const [middleContent, setMiddleContent] = useState<JSX.Element | null>(null);

  const handleLinkClick = (content: JSX.Element) => {
    setMiddleContent(content);
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <div className="sidebar">
          <div className="user-card">
            <div className="user-info">
              <Image src="/3d-user_icon.png" alt="user Icon" width={24} height={24} />
              <div className="user-name">Administrator</div>
            </div>
          </div>

          <div className="nav-container">
            <nav className="navigation">
              <div className="nav-item">
                <Image src="/region_icon.png" alt="region Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><RegionsPage/></div>)}>Region</Link>
              </div>
              <div className="nav-item">
                <Image src="/department_icon.png" alt="department Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><DepartmentsPage/></div>)}>Departments</Link>
              </div>
              <div className="nav-item">
                <Image src="/report_icon.png" alt="report Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><ReportsPage/></div>)}>Reports</Link>
              </div>
              <div className="nav-item">
                <Image src="/nomination_icon.png" alt="nomination Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><NominationsPage/></div>)}>Nominations</Link>
              </div>
              <div className="nav-item">
                <Image src="/employee_icon.png" alt="employees Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><EmployeesPage/></div>)}>Employees</Link>
              </div>
              <div className="nav-item">
                <Image src="/certificate_icon.png" alt="certificate Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><CertificateGenerator/></div>)}>Gen. Cert</Link>
              </div>
              <div className="nav-item">
                <Image src="/rewardleft_icon.png" alt="rewards left Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><RewardsCatalog/></div>)}>Rewards</Link>
              </div>
              <div className="nav-item">
                <Image src="/customer.png" alt="customer Icon" width={24} height={24} />
                <Link href="#" onClick={() => handleLinkClick(<div><EmployeeRewardNomination/></div>)}>Customer</Link>
              </div>
            </nav>

            <div className="settings">
              <Image src="/settings_icon.png" alt="settings Icon" width={24} height={24} />
              Settings
            </div>
          </div>
        </div>
        
        <div className="content-area">
          <div className="content-header">
            {middleContent || <div><RewardHero/></div>}
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 1rem;
          margin-top: 30px;
          padding: 1rem;
          flex: 1;
        }
        
        .sidebar {
          background-color: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .user-card {
          background-color: #fff;
          width: 100%;
          border-radius: 10px;
          margin-bottom: 1rem;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          border-bottom: 2px solid #ccc;
          padding: 1.25rem;
          gap: 15px;
        }
        
        .user-name {
          font-weight: bold;
          font-size: 1rem;
        }
        
        .nav-container {
          background-color: #fff;
          padding: 1.5rem 1rem;
          height: calc(100% - 70px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .navigation {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .nav-item a {
          text-decoration: none;
          color: inherit;
          font-size: 1rem;
        }
        
        .settings {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-top: 1rem;
          margin-top: auto;
        }
        
        .content-area {
          background-color: #fff;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .content-header {
          border-bottom: 2px solid #ccc;
          padding: 1.25rem;
          width: 100%;
          min-height: 100%;
        }
        
        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            width: 100%;
          }
          
          .nav-container {
            height: auto;
          }
        }
        
        @media (max-width: 480px) {
          .main-content {
            padding: 0.5rem;
            gap: 0.5rem;
          }
          
          .user-info, .content-header {
            padding: 1rem;
          }
          
          .nav-container {
            padding: 1rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}