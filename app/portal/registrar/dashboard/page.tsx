"use client";

import { useState, useEffect, useCallback } from 'react';

export default function DashboardPage() {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [admissionCount, setAdmissionCount] = useState<number>(0);
  const [pendingStudentCount, setPendingStudentCount] = useState<number>(0);
  const [recentAdmissionCount, setRecentAdmissionCount] = useState<number>(0);
  const [recentEnrollmentCount, setRecentEnrollmentCount] = useState<number>(0);

  // Tracking refresh states
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsFetching(true);
    try {
      const [
        enrolledRes, 
        pendingAdmRes, 
        pendingStudRes, 
        recentAdmRes, 
        recentEnrollRes
      ] = await Promise.all([
        fetch("/api/portal/registrar?table=students&count=true&status=Enrolled"),
        fetch("/api/portal/registrar?table=admissions_applications&count=true&status=Pending"),
        fetch("/api/portal/registrar?table=students&count=true&status=Pending"),
        // 🚀 Fetch admissions created within the last 24 hours
        fetch("/api/portal/registrar?table=admissions_applications&count=true&last24hours=true"),
        // 🚀 Fetch student enrollment requests created within the last 24 hours
        fetch("/api/portal/registrar?table=students&count=true&last24hours=true"),
      ]);

      if (enrolledRes.ok) {
        const data = await enrolledRes.json();
        setStudentCount(data.count);
      }
      if (pendingAdmRes.ok) {
        const data = await pendingAdmRes.json();
        setAdmissionCount(data.count);
      }
      if (pendingStudRes.ok) {
        const data = await pendingStudRes.json();
        setPendingStudentCount(data.count);
      }
      if (recentAdmRes.ok) {
        const data = await recentAdmRes.json();
        setRecentAdmissionCount(data.count);
      }
      if (recentEnrollRes.ok) {
        const data = await recentEnrollRes.json();
        setRecentEnrollmentCount(data.count);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    const INTERVAL_MS = 30000;
    const intervalId = setInterval(() => {
      fetchMetrics();
    }, INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchMetrics]);

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
    
  ];

  return (
    <div className="space-y-8">
      {/* Header bar showing sync status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">System Overview</h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400 font-medium">
              Auto-updating (Last: {lastUpdated.toLocaleTimeString()})
            </span>
          )}
          <button
            onClick={() => fetchMetrics()}
            disabled={isFetching}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            title="Refresh statistics now"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className={`size-4 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

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
            title="New admission requests"
            desc={`${recentAdmissionCount} new admission application${recentAdmissionCount === 1 ? '' : 's'} submitted`}
            time="Last 24 hours"
          />
          <ActivityItem 
            svgPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
            color="text-emerald-600"
            bg="bg-emerald-50"
            title="Enrollment requests"
            desc={`${recentEnrollmentCount} new enrollment request${recentEnrollmentCount === 1 ? '' : 's'} created`}
            time="Last 24 hours"
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