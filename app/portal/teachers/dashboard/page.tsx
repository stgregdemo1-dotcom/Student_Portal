"use client"; 

import { useState, useEffect } from 'react';

// Helper function to get a cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Dashboard() {
  const [enrolledStudents, setEnrolledStudents] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = useState<number>(0);

  useEffect(() => {
    const getAnalytics = async () => {
      try {
        const loggedInTeacherId = getCookie("username");

        const res = await fetch(
          loggedInTeacherId 
            ? `/api/teachers?teacher_id=${loggedInTeacherId}`
            : `/api/teachers`
        );

        if (res.ok) {
          const data = await res.json();
          setEnrolledStudents(data.totalEnrolledStudents || 0);
          setClassCount(data.totalClasses || 0);
          setUpcomingEvents(data.upcomingEvents || 0);
        }
      } catch (err) {
        console.error("Could not fetch dashboard metrics:", err);
      }
    };
    getAnalytics();
  }, []);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here is what is happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Enrolled Students" value={enrolledStudents} icon="fa-users" color="blue" />
        <StatCard title="Classes" value={classCount} icon="fa-chalkboard-teacher" color="green" />
        <StatCard title="Upcoming Events" value={upcomingEvents} icon="fa-calendar-check" color="purple" />
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorMapping = {
    blue: { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-500" },
    green: { border: "border-green-500", bg: "bg-green-100", text: "text-green-500" },
    yellow: { border: "border-yellow-500", bg: "bg-yellow-100", text: "text-yellow-500" },
    purple: { border: "border-purple-500", bg: "bg-purple-100", text: "text-purple-500" }
  };

  const selectedColor = colorMapping[color];

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${selectedColor.border}`}>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${selectedColor.bg} ${selectedColor.text}`}>
          <i className={`fas ${icon} text-2xl`}></i>
        </div>
      </div>
    </div>
  );
}