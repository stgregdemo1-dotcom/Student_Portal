"use client";

import { useState, useEffect } from 'react';

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Dashboard() {
  const [enrolledStudents, setEnrolledStudents] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);

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
          setSubjects(data.subjects || []);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Enrolled Students" value={enrolledStudents} icon="fa-users" color="blue" />
        <StatCard title="Classes" value={classCount} icon="fa-chalkboard-teacher" color="green" />
        <StatCard title="Upcoming Events" value={upcomingEvents} icon="fa-calendar-check" color="purple" />
      </div>

      {/* Assigned Subjects Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Assigned Classes & Analytics</h3>
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-sm">No active classes found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subjects.map((subject: any, index: number) => {
              const total = subject.totalStudents || 0;
              const passed = subject.passedCount || 0;
              const failed = subject.failedCount || 0;
              const ungraded = Math.max(0, total - (passed + failed));

              // Calculate percentages for SVG Donut chart slices
              const passedPct = total > 0 ? (passed / total) * 100 : 0;
              const failedPct = total > 0 ? (failed / total) * 100 : 0;
              const ungradedPct = total > 0 ? (ungraded / total) * 100 : 0;

              // SVG conic gradient simulation or stroke-dasharray parameters
              const passedStroke = passedPct;
              const failedStroke = failedPct;
              const ungradedStroke = ungradedPct;

              return (
                <div key={subject.subject_id || index} className="p-5 rounded-lg border border-gray-200 shadow-sm hover:border-green-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {subject.subject_name || "Unnamed Subject"}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {subject.subject_id}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded font-mono">
                      {subject.sched_code || "N/A"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p><span className="font-medium text-gray-500">Semester:</span> {subject.semester || "N/A"}</p>
                    <p><span className="font-medium text-gray-500">Section:</span> {subject.subject_year_section || "N/A"}</p>
                  </div>

                  {/* Pie / Donut Graph Section */}
                  <div className="mb-4 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Class Performance Breakdown</p>
                    
                    {total === 0 ? (
                      <p className="text-xs text-gray-400 italic">No students enrolled in this subject yet.</p>
                    ) : (
                      <div className="flex items-center justify-around bg-gray-50 p-3 rounded-lg">
                        {/* Donut Chart Visual */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <path
                              className="text-gray-200"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Passed Slice */}
                            {passed > 0 && (
                              <path
                                className="text-green-500"
                                strokeDasharray={`${passedStroke}, 100`}
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            )}
                            {/* Failed Slice */}
                            {failed > 0 && (
                              <path
                                className="text-red-500"
                                strokeDasharray={`${failedStroke}, 100`}
                                strokeDashoffset={`-${passedPct}`}
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            )}
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-xs text-gray-400 block font-medium">Total</span>
                            <span className="text-lg font-bold text-gray-800">{total}</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="text-xs space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-200 rounded-full inline-block"></span>
                            <span className="text-gray-600 font-medium">Total Students:</span>
                            <span className="font-bold text-gray-800">{total}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                            <span className="text-gray-600 font-medium">Passed:</span>
                            <span className="font-bold text-green-600">{passed}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                            <span className="text-gray-600 font-medium">Failed:</span>
                            <span className="font-bold text-red-500">{failed}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Student Section */}
                  <div className="mt-2 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Student(s)</p>
                    {(!subject.topStudents || subject.topStudents.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">No grades recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {subject.topStudents.map((student: any, sIdx: number) => (
                          <div key={sIdx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded text-sm">
                            <div>
                              <p className="font-medium text-gray-800">{student.last_name}, {student.first_name}</p>
                              <p className="text-xs text-gray-500">ID: {student.student_id}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">
                                Average Grade: {student.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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