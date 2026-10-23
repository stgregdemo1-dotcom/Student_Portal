"use client";

import { useState, useEffect, useCallback } from "react";

interface StatusCount {
  status: string;
  count: number;
}

export default function DashboardPage() {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [admissionCount, setAdmissionCount] = useState<number>(0);
  const [pendingStudentCount, setPendingStudentCount] = useState<number>(0);
  const [recentAdmissionCount, setRecentAdmissionCount] = useState<number>(0);
  const [recentEnrollmentCount, setRecentEnrollmentCount] = useState<number>(0);
  const [admissionStatusData, setAdmissionStatusData] = useState<StatusCount[]>([]);
  const [studentStatusData, setStudentStatusData] = useState<StatusCount[]>([]);
  const [failedRemarksData, setFailedRemarksData] = useState<StatusCount[]>([]);
  const [currentConfigYear, setCurrentConfigYear] = useState<string>("");
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
        recentEnrollRes,
        admissionStatusRes,
        studentStatusRes,
        failedRemarksRes,
      ] = await Promise.all([
        fetch("/api/portal/registrar?table=students&count=true&status=Enrolled"),
        fetch("/api/portal/registrar?table=admissions_applications&count=true&status=Pending"),
        fetch("/api/portal/registrar?table=students&count=true&status=Pending"),
        fetch("/api/portal/registrar?table=admissions_applications&count=true&last24hours=true"),
        fetch("/api/portal/registrar?table=students&count=true&last24hours=true"),
        fetch("/api/portal/registrar?table=admissions_applications&statusBreakdown=true"),
        fetch("/api/portal/registrar?table=students&statusBreakdown=true"),
        fetch("/api/portal/registrar?table=student_section&failedRemarksBreakdown=true"),
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
      if (admissionStatusRes.ok) {
        const res = await admissionStatusRes.json();
        if (res.success && Array.isArray(res.data)) {
          setAdmissionStatusData(res.data);
        }
      }
      if (studentStatusRes.ok) {
        const res = await studentStatusRes.json();
        if (res.success && Array.isArray(res.data)) {
          setStudentStatusData(res.data);
        }
      }
      if (failedRemarksRes.ok) {
        const res = await failedRemarksRes.json();
        if (res.success && Array.isArray(res.data)) {
          setFailedRemarksData(res.data);
          if (res.current_year) {
            setCurrentConfigYear(res.current_year);
          }
        }
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
      label: "Enrolled Students",
      value: studentCount,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "",
      up: true,
      svg: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      ),
    },
    {
      label: "Pending Admissions",
      value: admissionCount,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trend: "Action needed",
      up: false,
      svg: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      ),
    },
    {
      label: "Pending Enrollment",
      value: pendingStudentCount,
      color: "text-rose-600",
      bg: "bg-rose-100",
      trend: "Review needed",
      up: false,
      svg: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.656-5.64 9.094 9.094 0 00-3.741.479m1.112 5.64M12 12a5 5 0 100-10 5 5 0 000 10zm0 0c-2.67 0-5 1.33-6.16 3.35A4.922 4.922 0 0012 21a4.922 4.922 0 006.16-5.65C17 13.33 14.67 12 12 12z"
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header bar showing sync status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">System Overview</h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs font-medium text-slate-400">
              Auto-updating (Last: {lastUpdated.toLocaleTimeString()})
            </span>
          )}
          <button
            onClick={() => fetchMetrics()}
            disabled={isFetching}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  {stat.svg}
                </svg>
              </div>
            </div>
            <div
              className={`mt-4 flex items-center text-xs font-semibold ${
                stat.up ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {stat.up && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="mr-1 size-3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              )}
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid: Admission Status, Student Status, & Failed Remarks Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Admission Applications Status Pie Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Admission Status
          </h3>
          <StatusPieChart data={admissionStatusData} />
        </div>

        {/* Student Collection Status Pie Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Student Status
          </h3>
          <StatusPieChart data={studentStatusData} />
        </div>

        {/* Failed Remarks Breakdown Pie Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              Failed Remarks Analysis
            </h3>
            {currentConfigYear && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                Year: {currentConfigYear}
              </span>
            )}
          </div>
          <StatusPieChart data={failedRemarksData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800">Recent System Activity</h3>
        <div className="space-y-6">
          <ActivityItem
            svgPath={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            }
            color="text-blue-600"
            bg="bg-blue-50"
            title="New admission requests"
            desc={`${recentAdmissionCount} new admission application${
              recentAdmissionCount === 1 ? "" : "s"
            } submitted`}
            time="Last 24 hours"
          />
          <ActivityItem
            svgPath={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            }
            color="text-emerald-600"
            bg="bg-emerald-50"
            title="Enrollment requests"
            desc={`${recentEnrollmentCount} new enrollment request${
              recentEnrollmentCount === 1 ? "" : "s"
            } created`}
            time="Last 24 hours"
          />
        </div>
      </div>
    </div>
  );
}

{/* Status Pie Chart Component with Center Total Display */}
function StatusPieChart({ data }: { data: StatusCount[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const COLOR_PALETTE: Record<string, { fill: string; bg: string }> = {
    Approved: { fill: "#10b981", bg: "bg-emerald-500" },
    Enrolled: { fill: "#3b82f6", bg: "bg-blue-500" },
    Pending: { fill: "#f59e0b", bg: "bg-amber-500" },
    Rejected: { fill: "#ef4444", bg: "bg-rose-500" },
    Dropped: { fill: "#64748b", bg: "bg-slate-500" },
    Graduated: { fill: "#8b5cf6", bg: "bg-purple-500" },
    Failed: { fill: "#ef4444", bg: "bg-rose-500" },
    "Passed / Normal": { fill: "#10b981", bg: "bg-emerald-500" },
  };

  const DEFAULT_COLOR = { fill: "#94a3b8", bg: "bg-slate-400" };

  if (total === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm font-medium text-slate-400">
        No records available.
      </div>
    );
  }

  let cumulativeAngle = 0;

  return (
    <div className="flex flex-col items-center justify-between gap-4">
      <div className="relative flex items-center justify-center">
        <svg viewBox="-1 -1 2 2" className="size-40 -rotate-90 transform overflow-visible">
          {data.map((item) => {
            const percentage = item.count / total;
            const sliceAngle = percentage * 2 * Math.PI;

            const startX = Math.cos(cumulativeAngle);
            const startY = Math.sin(cumulativeAngle);

            cumulativeAngle += sliceAngle;

            const endX = Math.cos(cumulativeAngle);
            const endY = Math.sin(cumulativeAngle);

            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
            const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

            const color = COLOR_PALETTE[item.status] || DEFAULT_COLOR;

            return (
              <path
                key={item.status}
                d={pathData}
                fill={color.fill}
                className="transition-all duration-300 hover:opacity-85"
              >
                <title>{`${item.status}: ${item.count} (${((item.count / total) * 100).toFixed(1)}%)`}</title>
              </path>
            );
          })}
        </svg>
        {/* Center Total Overlay Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          
          <span className="text-lg font-extrabold text-slate-800">{total}</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        {data.map((item) => {
          const percent = ((item.count / total) * 100).toFixed(1);
          const color = COLOR_PALETTE[item.status] || DEFAULT_COLOR;

          return (
            <div key={item.status} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${color.bg}`} />
                <span className="font-semibold text-slate-700">{item.status}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{percent}%</span>
                <span className="text-slate-400">({item.count})</span>
              </div>
            </div>
          );
        })}
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          {svgPath}
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {time}
        </p>
      </div>
    </div>
  );
}