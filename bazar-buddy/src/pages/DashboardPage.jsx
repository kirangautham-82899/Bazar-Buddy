import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ShopProvider } from '../context/ShopContext';
import TopNavbar from '../components/layout/TopNavbar';
import BottomNav from '../components/layout/BottomNav';
import Loader from '../components/common/Loader';
import './DashboardPage.css';

const DashboardPage = () => (
  <ShopProvider>
    <div className="dashboard">
      <TopNavbar />
      <main className="dashboard-main" id="main-content">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  </ShopProvider>
);

export default DashboardPage;
