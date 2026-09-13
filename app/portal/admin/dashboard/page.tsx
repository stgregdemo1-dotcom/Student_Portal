"use client"; 

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [teacherCount, setTeacherCount] = useState<number>(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/portal/admin?table=teachers&count=true");
        if (res.ok) {
          const data = await res.json();
          // Update state with the clean count value returned from NextRequest
          setTeacherCount(data.count); 
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      }
    };
    fetchMetrics();
  }, []);

  const stats = [
    { 
      label: 'Active Teachers', 
      value: teacherCount, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100', 
      trend: 'All verified', 
      up: true,
      svg: (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M4.26 10.174L10.74 12.5a.75.75 0 0 0 .52 0l6.48-2.326m-13.48 0L3 9.375l9-3.75 9 3.75-1.26.524m-12.48 2.523v3.546c0 .542.472.946 1.011.838 1.64-.33 3.29-.514 4.989-.551a37.883 37.883 0 0 1 4.989.551c.539.108 1.011-.296 1.011-.838V10.174m-12.48 2.523L12 15.25l6-2.553" 
        />
      )
    }
  ];

  return (
    <div className="space-y-8">
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