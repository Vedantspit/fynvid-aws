import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Home" },
  { to: "/liked", label: "Liked" },
  { to: "/playlists", label: "Playlists" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/history", label: "History" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-56 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] border-r border-gray-200 bg-white">
      <nav className="p-3 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
