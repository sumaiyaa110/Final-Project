"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuArrowLeftRight,
  LuFileText,
  LuLayoutDashboard,
  LuSearch,
  LuSettings,
  LuShare2,
  LuSmartphone,
  LuTriangleAlert,
  LuUserCheck,
  LuUsers,
} from "react-icons/lu";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LuLayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: LuArrowLeftRight,
  },
  {
    name: "Fraud Alerts",
    href: "/alerts",
    icon: LuTriangleAlert,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: LuUsers,
  },
  {
    name: "Devices",
    href: "/devices",
    icon: LuSmartphone,
  },
  {
    name: "Agents",
    href: "/agents",
    icon: LuUserCheck,
  },
  {
    name: "Network Analysis",
    href: "/network",
    icon: LuShare2,
  },
  {
    name: "Investigations",
    href: "/investigations",
    icon: LuSearch,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: LuFileText,
  },
];

const bottomItems = [
  {
    name: "Settings",
    href: "/settings",
    icon: LuSettings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">A</div>

        <div>
          <div className="sidebar-brand-name">
            Anomaly<span>X</span>
          </div>

          <div className="sidebar-brand-subtitle">Fraud monitoring</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-navigation">
        <div className="sidebar-section-title">Monitoring</div>

        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${
                isActive ? "sidebar-item-active" : ""
              }`}
            >
              <span className="sidebar-icon">
                <item.icon aria-hidden="true" />
              </span>

              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="sidebar-section-title bottom-section">System</div>

        {bottomItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${
                isActive ? "sidebar-item-active" : ""
              }`}
            >
              <span className="sidebar-icon">
                <item.icon aria-hidden="true" />
              </span>

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
