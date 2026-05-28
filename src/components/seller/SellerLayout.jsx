import { useEffect, useMemo, useState } from "react";
import {
  Bolt,
  ListChecks,
  Ticket,
  BarChart3,
  LogOut,
  Bell,
  Grid2X2,
  Search,
  Filter,
  Download,
  Star,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Eye,
  MessageSquare,
  XCircle,
  TrendingUp,
  Sun,
  Moon,
  FileText,
  AlertTriangle,
  Lock,
  Trash2,
} from "lucide-react";
import { logoutSeller } from "../../utils/sellerAuth";
import { getTickets, updateTicketStatus, deleteTicket as apiDeleteTicket } from "../../services/ticketService";
import { getServiceRequests, updateServiceRequestStatus, deleteServiceRequest as apiDeleteServiceRequest } from "../../services/serviceRequestService";
import { getSellerStats } from "../../services/profileService";
import { getUser } from "../../services/authService";
import { getRating } from "../../services/ratingService";

const go = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

/* ────────────────────────────────────────────
   Confirmation Modal (blurred background)
   ──────────────────────────────────────────── */
function ConfirmModal({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  if (!open) return null;

  const btnColor =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-700"
      : confirmColor === "green"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-orange-500 hover:bg-orange-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 font-bold text-white transition ${btnColor}`}
          >
            {confirmLabel || "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ children }) {
  const map = {
    Processing: "bg-orange-50 text-orange-500",
    Finished: "bg-emerald-50 text-emerald-600",
    Pending: "bg-blue-50 text-blue-600",
    Cancelled: "bg-rose-50 text-rose-500",
    Normal: "bg-blue-50 text-blue-600",
    High: "bg-red-50 text-red-500",
    Low: "bg-slate-100 text-slate-500",
    Urgent: "bg-red-50 text-red-500",
  };

  return (
    <span className={`rounded-xl px-3 py-1 text-xs font-semibold ${map[children] || "bg-slate-100"}`}>
      {children}
    </span>
  );
}

function Sidebar({ page }) {
  const user = getUser() || { fullName: "Seller", email: "seller@sureserve.com" };
  const initials = user.fullName ? user.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "S";

  const item = (id, label, Icon, path) => (
    <button
      type="button"
      onClick={() => go(path)}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${
        page === id
          ? "bg-orange-500/20 text-white ring-1 ring-orange-500"
          : "text-orange-100 hover:bg-white/10"
      }`}
    >
      <Icon size={17} />
      {label}
      <span className="ml-auto">›</span>
    </button>
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logoutSeller();
      window.location.href = "/seller-login";
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-screen w-[245px] flex-col bg-[#351000] px-4 py-5 text-white">
      <div className="flex items-center gap-3 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
          <Bolt size={22} />
        </div>

        <div>
          <h1 className="font-extrabold tracking-wide">SURE SERVE</h1>
          <p className="text-xs font-bold text-orange-400">Seller Portal</p>
        </div>
      </div>

      <div className="border-y border-white/10 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold">
            {initials}
          </div>

          <div>
            <p className="font-bold max-w-[150px] truncate">{user.fullName}</p>
            <p className="text-xs font-bold text-orange-400 max-w-[150px] truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="mt-5 space-y-2">
        {item("dashboard", "Dashboard", Grid2X2, "/seller-dashboard")}
        {item("requests", "Manage Requests", ListChecks, "/seller-requests")}
        {item("tickets", "Manage Support Tickets", Ticket, "/seller-tickets")}
        {item("analytics", "Analytics", BarChart3, "/seller-analytics")}
        {item("subscription", "Subscription", Star, "/seller-subscription")}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-400"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar({ isDarkMode, toggleDarkMode }) {
  return (
    <div
      className={`fixed left-[245px] right-0 top-0 z-10 flex h-[66px] items-center justify-between border-b px-7 transition ${
        isDarkMode
          ? "border-slate-700 bg-slate-900 text-white"
          : "border-orange-100 bg-white text-slate-950"
      }`}
    >
      <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-400"}`}>
        Seller Dashboard —{" "}
        <span className={isDarkMode ? "font-bold text-white" : "font-bold text-slate-950"}>
          TechKing Store
        </span>
      </p>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`flex h-10 w-16 items-center rounded-full p-1 transition ${
            isDarkMode ? "bg-orange-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition ${
              isDarkMode ? "translate-x-6 text-orange-500" : "translate-x-0 text-slate-500"
            }`}
          >
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
          </span>
        </button>

        <SellerNotificationDropdown isDarkMode={isDarkMode} />

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
          TK
        </div>
      </div>
    </div>
  );
}

function SellerNotificationDropdown({ isDarkMode }) {
  const [show, setShow] = useState(false);
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    Promise.all([
      getTickets().catch(() => ({ success: false, data: [] })),
      getServiceRequests().catch(() => ({ success: false, data: [] }))
    ]).then(([ticketRes, requestRes]) => {
      const arr = [];
      if (ticketRes.success) ticketRes.data.forEach(t => arr.push({...t, title: `New Ticket #${t.id} - ${t.ticket_type}`, notifType: "ticket"}));
      if (requestRes.success) requestRes.data.forEach(r => arr.push({...r, title: `New Request #${r.id} - ${r.service_type}`, notifType: "request"}));
      setItems(arr.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
    });
  }, []);

  const handleClick = (item) => {
    setShow(false);
    if (item.notifType === "ticket") {
      go(`/seller-tickets#${item.id}`);
    } else {
      go(`/seller-requests#${item.id}`);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative text-orange-500">
        <Bell size={19} />
        {items.length > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
      </button>

      {show && (
        <div className={`absolute right-0 top-10 z-50 w-80 rounded-2xl shadow-xl ring-1 ${isDarkMode ? "bg-slate-800 ring-slate-700" : "bg-white ring-slate-200"}`}>
          <div className="border-b border-slate-100 p-4 font-bold">Recent Updates</div>
          <div className="p-2">
            {items.map(item => (
              <div
                key={`${item.id}-${item.title}`}
                onClick={() => handleClick(item)}
                className={`cursor-pointer rounded-xl p-3 text-sm ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}`}
              >
                <p className="font-bold">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Shell({ page, children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("sellerDarkMode") === "true";
  });

  const toggleDarkMode = () => {
    setIsDarkMode((previousMode) => {
      const nextMode = !previousMode;
      localStorage.setItem("sellerDarkMode", String(nextMode));
      return nextMode;
    });
  };

  return (
    <div className={isDarkMode ? "dark-mode min-h-screen" : "min-h-screen"}>
      <Sidebar page={page} />

      <Topbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className={`min-h-screen pl-[245px] pt-[66px] transition ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-[#fff7f4] text-slate-950"
      }`}>
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, note }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon size={22} />
        </div>

        <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-400">
          {note}
        </span>
      </div>

      <h3 className="mt-6 text-3xl font-extrabold text-slate-950">{value}</h3>
      <p className="text-sm text-slate-500">{title}</p>

      <div className="mt-5 h-1.5 rounded-full bg-slate-100">
        <div className="h-full w-4/5 rounded-full bg-orange-300" />
      </div>
    </div>
  );
}

function HeaderTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-7 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Icon />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      {action}
    </div>
  );
}

function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    getSellerStats().then((res) => {
      if (res.success) setStats(res.data);
    }).catch(() => {});

    getServiceRequests().then((res) => {
      if (res.success) setRecentRequests(res.data.slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <Shell page="dashboard">
      <HeaderTitle
        title="Seller Dashboard"
        subtitle="Monitor and manage your service operations."
        action={
          <button
            type="button"
            onClick={() => go("/seller-requests")}
            className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"
          >
            View All Requests
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-5">
        <StatCard icon={ListChecks} value={stats ? String(stats.totalRequests) : "0"} title="Total Requests" note="All time" color="bg-orange-50 text-orange-500" />
        <StatCard icon={Ticket} value={stats ? String(stats.totalTickets) : "0"} title="Active Tickets" note={stats ? `${stats.pendingTickets} pending` : ""} color="bg-blue-50 text-blue-500" />
        <StatCard icon={DollarSign} value="—" title="Revenue (Month)" note="Coming soon" color="bg-emerald-50 text-emerald-500" />
        <StatCard 
          icon={Star} 
          value={stats && parseFloat(stats.avgRating) > 0 ? stats.avgRating : "0.0"} 
          title="Customer Rating" 
          note={stats ? `Based on ${stats.totalRatings} review${stats.totalRatings === 1 ? '' : 's'}` : "No reviews yet"} 
          color="bg-amber-50 text-amber-500" 
        />
      </div>

      <div className="mt-7 grid grid-cols-[1fr_390px] gap-6">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
          <div className="flex items-center justify-between border-b border-orange-100 p-6">
            <h3 className="text-lg font-extrabold">Recent Requests</h3>
            <button type="button" onClick={() => go("/seller-requests")} className="font-semibold text-orange-500">
              View all →
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No requests yet.</div>
          ) : (
            recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-4 border-b border-slate-100 px-6 py-4"
              >
                <span className="flex-shrink-0 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-500">
                  #{req.id}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{req.customer_name || "Customer"}</p>
                  <p className="truncate text-xs text-slate-400">{req.service_type}</p>
                </div>

                <Badge>{req.status}</Badge>
                <Badge>{req.priority}</Badge>

                <span className="flex-shrink-0 text-xs text-slate-400">
                  {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
            <h3 className="mb-5 text-lg font-extrabold">Request Status</h3>

            {[
              ["Completed", stats?.finishedRequests || 0, "bg-emerald-500"],
              ["In Progress", stats?.processingRequests || 0, "bg-orange-500"],
              ["Pending", stats?.pendingRequests || 0, "bg-blue-500"],
              ["Cancelled", stats?.cancelledRequests || 0, "bg-red-500"],
            ].map(([label, value, color]) => {
              const total = Math.max(stats?.totalRequests || 1, 1);
              const pct = Math.round((value / total) * 100);
              return (
                <div className="mb-3" key={label}>
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <b className="text-xs">{value}</b>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                    <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
            <h3 className="mb-5 text-lg font-extrabold">Quick Actions</h3>

            {[
              [ListChecks, "Manage Requests", "/seller-requests"],
              [Ticket, "View Tickets", "/seller-tickets"],
              [BarChart3, "Analytics", "/seller-analytics"],
            ].map(([Icon, title, path]) => (
              <button
                key={title}
                type="button"
                onClick={() => go(path)}
                className="flex w-full items-center gap-4 py-4 font-semibold"
              >
                <span className="rounded-xl bg-orange-50 p-2 text-orange-500">
                  <Icon size={18} />
                </span>

                {title}

                <span className="ml-auto text-slate-300">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[#351000] p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="rounded-xl bg-orange-500/20 p-4 text-orange-400">
              <TrendingUp />
            </span>

            <div>
              <h3 className="text-lg font-extrabold">Performance Insight</h3>
              <p className="font-semibold text-orange-300">
                Your completion rate is {stats && stats.totalRequests > 0 ? Math.round((stats.finishedRequests / stats.totalRequests) * 100) : 0}% — keep it up!
              </p>
            </div>
          </div>

          <button type="button" onClick={() => go("/seller-analytics")} className="rounded-xl bg-orange-500 px-5 py-3 font-bold">
            View Analytics →
          </button>
        </div>
      </div>
    </Shell>
  );
}

function exportCsv(rows, isTicket) {
  const getBadgeColor = (val) => {
    const map = {
      Processing: "#fff7ed", ProcessingText: "#f97316",
      Finished: "#ecfdf5", FinishedText: "#059669",
      Pending: "#eff6ff", PendingText: "#2563eb",
      Cancelled: "#fff1f2", CancelledText: "#e11d48",
      High: "#fef2f2", HighText: "#ef4444",
      Urgent: "#fef2f2", UrgentText: "#ef4444",
      Low: "#f1f5f9", LowText: "#64748b",
      Normal: "#eff6ff", NormalText: "#2563eb"
    };
    const bg = map[val] || "#ffffff";
    const text = map[`${val}Text`] || "#000000";
    return `background-color:${bg};color:${text};font-weight:bold;px:8px;py:4px;border-radius:12px;`;
  };

  const headers = isTicket
    ? ["ID", "Customer", "Email", "Phone", "Ticket Type", "Description", "Status", "Priority", "Date"]
    : ["ID", "Customer", "Email", "Phone", "Service Type", "Description", "Location", "Status", "Priority", "Date"];

  let html = "<html xmlns:x='urn:schemas-microsoft-com:office:excel'>";
  html += "<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>";
  html += "<x:Name>Export</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>";
  html += "</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body><table>";

  html += "<tr>";
  headers.forEach(h => html += `<th style="background-color:#f8fafc;font-weight:bold;padding:10px;">${h}</th>`);
  html += "</tr>";

  rows.forEach(row => {
    html += "<tr>";
    html += `<td>${row.id}</td>`;
    html += `<td>${row.customer_name || ""}</td>`;
    html += `<td>${row.customer_email || ""}</td>`;
    html += `<td>${row.phone || ""}</td>`;
    html += `<td>${isTicket ? row.ticket_type : row.service_type}</td>`;
    html += `<td>${row.description || ""}</td>`;
    if (!isTicket) html += `<td>${row.location || ""}</td>`;
    html += `<td style="${getBadgeColor(row.status)}">${row.status}</td>`;
    html += `<td style="${getBadgeColor(row.priority)}">${row.priority}</td>`;
    html += `<td>${row.created_at}</td>`;
    html += "</tr>";
  });

  html += "</table></body></html>";

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = isTicket ? "seller-tickets.xls" : "seller-orders.xls";
  anchor.click();

  URL.revokeObjectURL(url);
}

function DetailsModal({ item, isTicket, onClose }) {
  if (!item) return null;

  const [ratingData, setRatingData] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    if (item.status === "Finished") {
      setLoadingRating(true);
      const source = isTicket ? "ticket" : "service";
      getRating(source, item.id)
        .then((res) => {
          if (res.success && res.data) {
            setRatingData(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingRating(false));
    }
  }, [item, isTicket]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-extrabold">
              {isTicket ? "Ticket Details" : "Request Details"}
            </h3>
            <p className="text-sm text-slate-500">
              #{item.id} — {item.customer_name || "Customer"}
            </p>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <XCircle size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Customer Name</p>
            <p className="font-bold text-slate-800">{item.customer_name || item.contact_person || "—"}</p>
          </div>

          <div>
            <p className="text-slate-400">Customer Email</p>
            <p className="font-bold text-slate-800">{item.customer_email || "—"}</p>
          </div>

          <div>
            <p className="text-slate-400">Phone Number</p>
            <p className="font-bold">{item.phone || item.contact_person_phone || item.customer_phone || "—"}</p>
          </div>

          <div>
            <p className="text-slate-400">Address</p>
            <p className="font-bold">{item.customer_address || "—"}</p>
          </div>

          <div>
            <p className="text-slate-400">Premium Status</p>
            <Badge>{item.customer_subscription || "Free"}</Badge>
          </div>

          <div>
            <p className="text-slate-400">
              {isTicket ? "Ticket Type" : "Service Type"}
            </p>
            <p className="font-bold">{isTicket ? item.ticket_type : item.service_type}</p>
          </div>

          {!isTicket && (
            <div>
              <p className="text-slate-400">Location</p>
              <p className="font-bold">{item.location || "—"}</p>
            </div>
          )}

          <div>
            <p className="text-slate-400">Status</p>
            <Badge>{item.status}</Badge>
          </div>

          <div>
            <p className="text-slate-400">Priority</p>
            <Badge>{item.priority}</Badge>
          </div>

          {item.preferred_date && (
            <div>
              <p className="text-slate-400">Preferred Date</p>
              <p className="font-bold">
                {new Date(item.preferred_date).toLocaleDateString()} {item.preferred_time || ""}
              </p>
            </div>
          )}

          <div>
            <p className="text-slate-400">Submitted On</p>
            <p className="font-bold">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</p>
          </div>
        </div>

        {/* Service Description */}
        <div className="mt-5 max-h-[150px] overflow-y-auto break-words rounded-xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
            {isTicket ? "Ticket Description" : "Service Description"}
          </p>
          <p className="text-sm text-slate-700">{item.description || "No description provided."}</p>
        </div>

        {/* Customer Rating (visible to seller) */}
        {item.status === "Finished" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-bold text-amber-700">Customer Rating</p>
            {loadingRating ? (
              <p className="text-sm text-amber-600">Loading rating...</p>
            ) : ratingData ? (
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${
                        s <= ratingData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-none text-slate-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-bold text-amber-600">{ratingData.rating}/5</span>
                </div>
                {ratingData.review && (
                  <p className="mt-2 text-sm italic text-amber-700">"{ratingData.review}"</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-600">No rating submitted yet.</p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {item.status === "Pending" && (
            <button
              type="button"
              onClick={() => {
                if (item.onUpdateStatus) item.onUpdateStatus(item.id, "Processing");
                onClose();
              }}
              className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Mark as Processing
            </button>
          )}

          <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600">
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}

function TablePage({ type }) {
  const isTicket = type === "tickets";

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // {id, action, label}
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetcher = isTicket ? getTickets : getServiceRequests;
    fetcher()
      .then((res) => {
        if (res.success) setRows(res.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        const hash = window.location.hash.replace("#", "");
        if (hash) {
          setHighlightId(parseInt(hash));
          setTimeout(() => {
            const el = document.getElementById(`row-${hash}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
          setTimeout(() => setHighlightId(null), 3000);
        }
      });
  }, [isTicket]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const label = isTicket ? row.ticket_type : row.service_type;
      const keyword = `${row.id} ${row.customer_name || ""} ${row.customer_email || ""} ${label} ${row.location || ""} ${row.description || ""}`.toLowerCase();

      const matchesSearch = keyword.includes(search.toLowerCase());
      const matchesStatus = status === "All Status" || row.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status, isTicket]);

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const updater = isTicket ? updateTicketStatus : updateServiceRequestStatus;
      const res = await updater(id, nextStatus);
      if (res.success) {
        setRows((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: nextStatus } : row
          )
        );
        setToast(`#${id} marked as ${nextStatus}.`);
        setTimeout(() => setToast(""), 1800);
      }
    } catch {}
  };

  const askConfirm = (id, nextStatus) => {
    const label = nextStatus === "Finished" ? "FINISH" : "CANCEL";
    setConfirmAction({ id, action: nextStatus, label });
  };

  const handleDelete = async (row) => {
    try {
      const deleter = isTicket ? apiDeleteTicket : apiDeleteServiceRequest;
      const res = await deleter(row.id);
      if (res.success) {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        setToast(`#${row.id} deleted.`);
        setTimeout(() => setToast(""), 1800);
      }
    } catch {}
    setDeleteConfirm(null);
  };

  const replyTicket = (row) => {
    const email = row.customer_email || "";
    const subject = encodeURIComponent(`RE: Ticket #${row.id} \u2014 ${row.ticket_type}`);
    const body = encodeURIComponent(`Hello ${row.customer_name || "Customer"},\n\nRegarding your ticket #${row.id} (${row.ticket_type}):\n\n`);

    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      setToast("No customer email available for this ticket.");
      setTimeout(() => setToast(""), 2200);
    }
  };

  const ticketStatCounts = useMemo(() => {
    if (!isTicket) return {};
    return {
      total: rows.length,
      processing: rows.filter((r) => r.status === "Processing").length,
      finished: rows.filter((r) => r.status === "Finished").length,
      pending: rows.filter((r) => r.status === "Pending").length,
    };
  }, [rows, isTicket]);

  return (
    <Shell page={isTicket ? "tickets" : "requests"}>
      <HeaderTitle
        icon={isTicket ? Ticket : ListChecks}
        title={isTicket ? "Manage Tickets" : "Manage Requests"}
        subtitle={isTicket ? "View and manage all customer support tickets" : "View and manage all customer orders"}
        action={
          <button
            type="button"
            onClick={() => exportCsv(filteredRows, isTicket)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
          >
            <Download size={16} className="mr-2 inline" />
            Export {isTicket ? "Tickets" : "Orders"}
          </button>
        }
      />

      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-[#351000] px-5 py-3 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      {isTicket && (
        <div className="mb-5 grid grid-cols-4 gap-4">
          <div className="rounded-xl bg-white p-5 ring-1 ring-blue-100">
            <b className="mr-3 text-2xl text-blue-600">{ticketStatCounts.total}</b>
            Total Tickets
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-orange-100">
            <b className="mr-3 text-2xl text-orange-500">{ticketStatCounts.processing}</b>
            Processing Tickets
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-emerald-100">
            <b className="mr-3 text-2xl text-emerald-500">{ticketStatCounts.finished}</b>
            Finished Tickets
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-blue-100">
            <b className="mr-3 text-2xl text-blue-600">{ticketStatCounts.pending}</b>
            Pending Tickets
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
        <div className="flex gap-3 border-b border-orange-100 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 outline-none"
              placeholder="Search by ID, customer, description..."
            />
          </div>

          <Filter className="mt-3 text-slate-400" size={18} />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4"
          >
            <option>All Status</option>
            <option>Processing</option>
            <option>Pending</option>
            <option>Finished</option>
            <option>Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                {[
                  "ID",
                  "Customer",
                  isTicket ? "Ticket Type" : "Service Type",
                  "Status",
                  "Priority",
                  "Date",
                  "Actions",
                ].map((header) => (
                  <th className="px-5 py-4" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr
                  className={`border-t border-orange-100 transition-colors duration-1000 ${
                    highlightId === row.id ? "bg-amber-100/60 ring-2 ring-amber-400" : ""
                  }`}
                  key={row.id}
                  id={`row-${row.id}`}
                >
                  <td className={`px-5 py-5 font-bold ${isTicket ? "text-blue-600" : "text-orange-500"}`}>
                    #{row.id}
                  </td>

                  <td className="px-5 py-5">
                    <p className="font-bold">{row.customer_name || "Customer"}</p>
                    <p className="text-xs text-slate-400">{row.customer_email || ""}</p>
                    {row.phone && <p className="text-xs text-slate-400">{row.phone}</p>}
                  </td>

                  <td className="px-5 py-5">
                    <p>{isTicket ? row.ticket_type : row.service_type}</p>
                    <p className="mt-1 max-w-[200px] truncate text-xs text-slate-400">
                      {row.description || (isTicket ? "" : row.location || "")}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <Badge>{row.status}</Badge>
                  </td>

                  <td className="px-5 py-5">
                    <Badge>{row.priority}</Badge>
                  </td>

                  <td className="px-5 py-5 text-slate-600">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex items-center gap-1.5">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => setSelected({ ...row, onUpdateStatus: handleUpdateStatus })}
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Reply (tickets only) */}
                      {isTicket && (
                        <button
                          type="button"
                          onClick={() => replyTicket(row)}
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                          title="Reply via Email"
                        >
                          <MessageSquare size={16} />
                        </button>
                      )}

                      {/* Mark Finished / Resolved */}
                      {row.status !== "Finished" && row.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => askConfirm(row.id, "Finished")}
                          className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title={isTicket ? "Mark Resolved" : "Mark Finished"}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}

                      {/* Cancel / Close */}
                      {row.status !== "Cancelled" && row.status !== "Finished" && (
                        <button
                          type="button"
                          onClick={() => askConfirm(row.id, "Cancelled")}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          title={isTicket ? "Close Ticket" : "Cancel Request"}
                        >
                          <XCircle size={16} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(row)}
                        className="rounded-lg p-2 text-red-400 transition hover:bg-red-50"
                        title={"Delete"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex items-center justify-between border-t border-orange-100 p-5 text-sm text-slate-400">
          <span>
            Showing {filteredRows.length} of {rows.length}{" "}
            {isTicket ? "tickets" : "requests"}
          </span>
        </div>
      </div>

      <DetailsModal item={selected} isTicket={isTicket} onClose={() => setSelected(null)} />

      {/* Confirmation modal for Finish/Cancel */}
      <ConfirmModal
        open={!!confirmAction}
        title={`Are you sure you want to ${confirmAction?.label}?`}
        message={confirmAction?.label === "FINISH" ? "This will mark the item as completed." : "This will cancel the item. This can't be undone easily."}
        confirmLabel={`Yes, ${confirmAction?.label}`}
        confirmColor={confirmAction?.label === "CANCEL" ? "red" : "green"}
        onConfirm={() => {
          if (confirmAction) handleUpdateStatus(confirmAction.id, confirmAction.action);
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Item?"
        message={`Are you sure you want to delete this ${isTicket ? "ticket" : "service request"}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        confirmColor="red"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </Shell>
  );
}

function Analytics() {
  const [stats, setStats] = useState(null);
  const sellerUser = getUser();
  const sellerPlan = (sellerUser?.subscription || "Free").toLowerCase();
  const isPremium = sellerPlan === "professional" || sellerPlan === "enterprise";

  useEffect(() => {
    getSellerStats().then((res) => {
      if (res.success) setStats(res.data);
    }).catch(() => {});
  }, []);

  if (!isPremium) {
    return (
      <Shell page="analytics">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Analytics is a Premium Feature</h2>
          <p className="mt-3 max-w-md text-lg text-slate-500">
            Upgrade to the <span className="font-bold text-blue-600">Professional</span> or <span className="font-bold text-violet-600">Enterprise</span> plan to unlock detailed analytics, performance insights, and export capabilities.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
              <h3 className="font-bold text-blue-700">Professional — ₱29/mo</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>• Analytics Dashboard</li>
                <li>• PDF & CSV Export</li>
                <li>• Performance Insights</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-left">
              <h3 className="font-bold text-violet-700">Enterprise — ₱99/mo</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>• Advanced Analytics</li>
                <li>• Custom Reports</li>
                <li>• Business Reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const requestData = [12, 18, 14, 22, 19, 25];
  const ticketData = [8, 12, 10, 16, 14, 18];
  const maxVal = Math.max(...requestData, ...ticketData, 1);

  const toY = (val) => 160 - (val / maxVal) * 140;

  const requestPoints = requestData.map((v, i) => `${i * 170 + 40},${toY(v)}`).join(" ");
  const ticketPoints = ticketData.map((v, i) => `${i * 170 + 40},${toY(v)}`).join(" ");

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <Shell page="analytics">
      <HeaderTitle
        title="Analytics"
        subtitle="Track your business performance and insights"
        action={
          <button
            type="button"
            onClick={handleExportPdf}
            className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"
          >
            <FileText size={16} className="mr-2 inline" />
            Export PDF
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-5" id="analytics-content">
        {[
          [Clock, "1.8h", "Avg Response Time", "-0.3h vs last month"],
          [CheckCircle2, stats ? `${stats.totalRequests > 0 ? Math.round((stats.finishedRequests / stats.totalRequests) * 100) : 0}%` : "0%", "Completion Rate", "All time"],
          [Star, "4.8/5", "Customer Rating", "+0.1 vs last month"],
          [Users, stats ? String(stats.totalRequests) : "0", "Total Requests", "All time"],
        ].map(([Icon, value, title, note]) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
            <Icon className="text-blue-500" />
            <h3 className="mt-6 text-2xl font-extrabold text-slate-950">{value}</h3>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-xs font-bold text-emerald-500">{note}</p>
          </div>
        ))}
      </div>

      {/* Improved chart with axes, labels, dots, legend */}
      <div className="mt-6 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Revenue & Requests Overview</h3>
            <p className="text-sm text-slate-500">Last 6 months performance</p>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              Requests
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              Tickets
            </span>
          </div>
        </div>

        <div className="mt-8 h-56 rounded-xl bg-gradient-to-t from-blue-50/50 to-white p-4">
          <svg viewBox="0 0 900 200" className="h-full w-full">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = 20 + i * 35;
              return (
                <g key={i}>
                  <line x1="30" y1={y} x2="890" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                  <text x="0" y={y + 4} fill="#94a3b8" fontSize="10">{Math.round(maxVal - (i / 4) * maxVal)}</text>
                </g>
              );
            })}

            {/* Month labels */}
            {months.map((m, i) => (
              <text key={m} x={i * 170 + 35} y="195" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600">{m}</text>
            ))}

            {/* Area fills */}
            <polygon
              points={`40,${toY(requestData[0])} ${requestPoints} ${40 + (requestData.length - 1) * 170},175 40,175`}
              fill="url(#blueGrad)"
              opacity="0.15"
            />
            <polygon
              points={`40,${toY(ticketData[0])} ${ticketPoints} ${40 + (ticketData.length - 1) * 170},175 40,175`}
              fill="url(#orangeGrad)"
              opacity="0.1"
            />

            {/* Lines */}
            <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={requestPoints} />
            <polyline fill="none" stroke="#ff5b2e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={ticketPoints} />

            {/* Data point dots */}
            {requestData.map((v, i) => (
              <circle key={`r${i}`} cx={i * 170 + 40} cy={toY(v)} r="5" fill="#2563eb" stroke="white" strokeWidth="2" />
            ))}
            {ticketData.map((v, i) => (
              <circle key={`t${i}`} cx={i * 170 + 40} cy={toY(v)} r="5" fill="#ff5b2e" stroke="white" strokeWidth="2" />
            ))}

            {/* Data values above dots */}
            {requestData.map((v, i) => (
              <text key={`rv${i}`} x={i * 170 + 40} y={toY(v) - 10} fill="#2563eb" fontSize="10" textAnchor="middle" fontWeight="600">{v}</text>
            ))}
            {ticketData.map((v, i) => (
              <text key={`tv${i}`} x={i * 170 + 40} y={toY(v) - 10} fill="#ff5b2e" fontSize="10" textAnchor="middle" fontWeight="600">{v}</text>
            ))}

            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff5b2e" />
                <stop offset="100%" stopColor="#ff5b2e" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
          <h3 className="text-lg font-extrabold">Requests by Service Type</h3>

          {[
            ["TV Installation", 34],
            ["AC Installation", 28],
            ["Network Setup", 22],
            ["CCTV System", 18],
            ["Smart Home", 14],
            ["Other", 8],
          ].map(([label, value]) => (
            <div key={label} className="mt-4 flex items-center gap-4">
              <span className="w-36 text-xs text-slate-500">{label}</span>
              <div className="h-5 flex-1 rounded bg-slate-50">
                <div className="h-full rounded bg-orange-500" style={{ width: `${value * 2.3}%` }} />
              </div>
              <span className="w-8 text-right text-xs font-bold text-slate-600">{value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
            <h3 className="text-lg font-extrabold">Request Status Distribution</h3>

            <div className="mt-5 flex items-center gap-8">
              <div className="h-28 w-28 rounded-full border-[18px] border-emerald-500 border-b-blue-500 border-r-orange-400" />

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Finished {stats ? stats.finishedRequests : 0}</p>
                <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-400" /> Processing {stats ? stats.processingRequests : 0}</p>
                <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" /> Pending {stats ? stats.pendingRequests : 0}</p>
                <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /> Cancelled {stats ? stats.cancelledRequests : 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
            <h3 className="text-lg font-extrabold">Weekly Ticket Resolution</h3>

            <div className="mt-4 flex items-end justify-around gap-2">
              {[
                ["Mon", 30],
                ["Tue", 48],
                ["Wed", 26],
                ["Thu", 60],
                ["Fri", 40],
                ["Sat", 22],
                ["Sun", 14],
              ].map(([day, height]) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500">{height}</span>
                  <div className="w-10 rounded-t bg-orange-400" style={{ height }} />
                  <span className="text-[10px] text-slate-400">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

import AdvancedSubscription from "./AdvancedSubscription";

export default function SellerPortal({ page }) {
  if (page === "requests") return <TablePage type="requests" />;
  if (page === "tickets") return <TablePage type="tickets" />;
  if (page === "analytics") return <Analytics />;
  if (page === "subscription") {
    return (
      <Shell page="subscription">
        <AdvancedSubscription user={getUser()} onUpgrade={(plan) => {
           const user = getUser();
           user.subscription = plan;
           localStorage.setItem("user", JSON.stringify(user));
           window.location.reload();
        }} />
      </Shell>
    );
  }

  return <SellerDashboard />;
}