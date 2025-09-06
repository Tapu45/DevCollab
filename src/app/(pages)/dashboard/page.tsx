"use client";

import React, { useEffect } from 'react';
import { usePage } from '@/context/PageContext';

const page = () => {
   const { setPageInfo } = usePage();

    useEffect(() => {
    setPageInfo('Dashboard', 'Manage your projects, track progress, and collaborate with your team in one central hub.');
  }, [setPageInfo]);
  return (
    <div className="space-y-6">
    
      
      {/* Dummy Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Total Projects</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">+2 from last month</p>
        </div>
        
        {/* Recent Activity Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Recent Activity</h3>
          <ul className="space-y-2">
            <li className="text-sm text-gray-600 dark:text-gray-400">Updated project "DevCollab"</li>
            <li className="text-sm text-gray-600 dark:text-gray-400">Added new team member</li>
            <li className="text-sm text-gray-600 dark:text-gray-400">Completed task "UI Design"</li>
          </ul>
        </div>
        
        {/* Upcoming Tasks Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upcoming Tasks</h3>
          <ul className="space-y-2">
            <li className="text-sm text-gray-600 dark:text-gray-400">Review code changes</li>
            <li className="text-sm text-gray-600 dark:text-gray-400">Team meeting at 3 PM</li>
            <li className="text-sm text-gray-600 dark:text-gray-400">Deploy to production</li>
          </ul>
        </div>
      </div>
      
      {/* Additional Dummy Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Create Project</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Invite Team</button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">View Reports</button>
        </div>
      </div>
    </div>
  );
};

export default page;