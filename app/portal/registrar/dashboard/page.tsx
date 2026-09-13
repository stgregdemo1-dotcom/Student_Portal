// components/DashboardPage.tsx
"use client";

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [admissionCount, setAdmissionCount] = useState<number>(0);
  const [pendingStudentCount, setPendingStudentCount] = useState<number>(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // 🚀 UPDATED: Added '&status=Enrolled' onto the API route query string
        const res = await fetch("/api/portal/registrar?table=students&count=true&status=Enrolled");
        if (res.ok) {
          const data = await res.json();
          setStudentCount(data.count); 
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // 🚀 UPDATED: Added '&status=Pending' filter parameter onto the endpoint string
        const res = await fetch("/api/portal/registrar?table=admissions_applications&count=true&status=Pending");
        if (res.ok) {
          const data = await res.json();
          setAdmissionCount(data.count); 
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/portal/registrar?table=students&count=true&status=Pending");
        if (res.ok) {
          const data = await res.json();
          setPendingStudentCount(data.count); 
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      }
    };
    fetchMetrics();
  }, []);

  const stats = [
    { 
      label: 'Enrolled Students', 
      value: studentCount, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100', 
      trend: '', 
      up: true,
      svg: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    },
    { 
      label: 'Pending Admissions', 
      value: admissionCount, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100', 
      trend: 'Action needed', 
      up: false,
      svg: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    },
    { 
      label: 'Pending Enrollment', 
      value: pendingStudentCount, 
      color: 'text-rose-600', 
      bg: 'bg-rose-100', 
      trend: 'Review needed', 
      up: false,
      svg: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.656-5.64 9.094 9.094 0 00-3.741.479m1.112 5.64M12 12a5 5 0 100-10 5 5 0 000 10zm0 0c-2.67 0-5 1.33-6.16 3.35A4.922 4.922 0 0012 21a4.922 4.922 0 006.16-5.65C17 13.33 14.67 12 12 12z" />
    },
    { 
      label: 'Class Sections', 
      value: '32', 
      color: 'text-purple-600', 
      bg: 'bg-purple-100', 
      trend: 'Updated', 
      up: true,
      svg: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  {stat.svg}
                </svg>
              </div>
            </div>
            <div className={`mt-4 flex items-center text-xs font-semibold ${stat.up ? 'text-emerald-500' : 'text-amber-500'}`}>
              {stat.up && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-1 size-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              )}
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800">Recent System Activity</h3>
        <div className="space-y-6">
          <ActivityItem 
            svgPath={<path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />}
            color="text-blue-600"
            bg="bg-blue-50"
            title="New admission request"
            desc="John Smith applied for Computer Science"
            time="2 mins ago"
          />
          <ActivityItem 
            svgPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
            color="text-emerald-600"
            bg="bg-emerald-50"
            title="Enrollment approved"
            desc="Maria Garcia's enrollment was verified"
            time="15 mins ago"
          />
          <ActivityItem 
            svgPath={<path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />}
            color="text-amber-600"
            bg="bg-amber-50"
            title="Grade updated"
            desc="Math 101 results modified for Robert Johnson"
            time="1 hour ago"
          />
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  svgPath: React.ReactNode;
  color: string;
  bg: string;
  title: string;
  desc: string;
  time: string;
}

function ActivityItem({ svgPath, color, bg, title, desc, time }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className={`rounded-full p-2.5 ${bg} ${color}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          {svgPath}
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
        <p className="mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">{time}</p>
      </div>
    </div>
  );
}