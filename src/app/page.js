"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function Home() {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [alertStats, setAlertStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  })
  const [chartData, setChartData] = useState([])

  // Function to parse logs and extract statistics
  const processLogs = (logData) => {
    const stats = {
      total: logData.length,
      high: 0,
      medium: 0,
      low: 0,
    }

    // Simple parsing logic - in a real app, you'd parse the JSON properly
    logData.forEach((log) => {
      if (log.includes("CRITICAL") || log.includes("HIGH")) {
        stats.high++
      } else if (log.includes("MEDIUM") || log.includes("WARNING")) {
        stats.medium++
      } else {
        stats.low++
      }
    })

    setAlertStats(stats)

    // Update chart data
    const now = new Date()
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`

    setChartData((prev) => {
      const newData = [...prev, { time: timeStr, alerts: logData.length }]
      // Keep only the last 10 data points
      return newData.slice(-10)
    })
  }

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/logs")
      const data = await res.json()
      setLogs(data.logs)
      setFilteredLogs(data.logs)
      processLogs(data.logs)
      setLastUpdated(new Date())
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = logs.filter((log) => log.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredLogs(filtered)
    } else {
      setFilteredLogs(logs)
    }
  }, [searchQuery, logs])

  // Function to determine severity based on log content
  const getSeverity = (log) => {
    if (log.includes("CRITICAL") || log.includes("HIGH")) {
      return "high"
    } else if (log.includes("MEDIUM") || log.includes("WARNING")) {
      return "medium"
    }
    return "low"
  }

  // Function to get badge color based on severity
  const getBadgeColor = (severity) => {
    switch (severity) {
      case "high":
        return "#ef4444" // red
      case "medium":
        return "#f59e0b" // amber
      default:
        return "#10b981" // green
    }
  }

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <p style={{ color: "#f8fafc" }}>{`Time: ${payload[0].payload.time}`}</p>
          <p style={{ color: "#10b981" }}>{`Alerts: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#10b981", fontWeight: "bold" }}>🛡️</div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Suricata Monitor</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "4px",
                color: "#f8fafc",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {isLoading ? "🔄" : "🔄"} Refresh
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              🕒 Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}>Total Alerts</div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>{alertStats.total}</div>
            </div>

            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}>High Severity</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>{alertStats.high}</div>
            </div>

            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}>Medium Severity</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>{alertStats.medium}</div>
            </div>

            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}>Low Severity</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>{alertStats.low}</div>
            </div>
          </div>

          {/* Chart */}
          <div
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Alert Trend</h2>
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>Number of alerts over time</p>
            </div>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="alerts" stroke="#10b981" fillOpacity={1} fill="url(#colorAlerts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Logs Section */}
          <div
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Suricata Alert Logs</h2>
              <div style={{ position: "relative", width: "250px" }}>
                <input
                  placeholder="Search logs..."
                  style={{
                    width: "100%",
                    padding: "8px 8px 8px 32px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "4px",
                    color: "#f8fafc",
                    fontSize: "14px",
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                >
                  🔍
                </span>
              </div>
            </div>
            <div
              style={{
                height: "400px",
                overflowY: "auto",
                border: "1px solid #334155",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              {filteredLogs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filteredLogs.map((log, i) => {
                    const severity = getSeverity(log)
                    const badgeColor = getBadgeColor(severity)

                    return (
                      <div
                        key={i}
                        style={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "4px",
                          padding: "12px",
                          animation: "fadeIn 0.3s ease-in-out",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span
                            style={{
                              backgroundColor: badgeColor,
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {severity.toUpperCase()}
                          </span>
                          <span style={{ color: "#e2e8f0" }}>{log}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                  }}
                >
                  <p>No alerts yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        body {
          margin: 0;
          padding: 0;
        }
        
        * {
          box-sizing: border-box;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  )
}
