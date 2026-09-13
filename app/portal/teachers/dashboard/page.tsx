"use client"; 
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [activeStudents, setActiveStudents] = useState<number>(0);
  useEffect(() => {
    const getAnalytics = async () => {
      try {
        const res = await fetch("/api/teachers");
        if (res.ok) {
          const data = await res.json();
          setActiveStudents(data.totalActiveStudents);
        }
      } catch (err) {
        console.error("Could not fetch active student metrics:", err);
      }
    };
    getAnalytics();
  }, []);

  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [{
      label: 'Students',
      data: [35, 42, 28, 12, 5],
      backgroundColor: ['#4ade80', '#86efac', '#fde047', '#fdba74', '#fca5a5'],
    }]
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here is what is happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Students" value={activeStudents} icon="fa-users" color="blue" />
        <StatCard title="Classes" value="4" icon="fa-chalkboard-teacher" color="green" />
        <StatCard title="Pending Grades" value="12" icon="fa-clipboard-list" color="yellow" />
        <StatCard title="Upcoming Events" value="2" icon="fa-calendar-check" color="purple" />
      </div>

      {/* Charts Section - Now constrained to a smaller width */}
      <div className="max-w-2xl mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Grade Distribution</h3>
          <div className="h-[250px]"> {/* Fixed height container */}
            <Bar 
              data={gradeData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </div>
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