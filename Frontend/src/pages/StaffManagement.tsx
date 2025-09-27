import React, { useState } from "react";
import {
  Calendar,
  Filter,
  Search,
  Plus,
  Users,
  Pizza,
  ShoppingBasket,
  Package,
  Coffee,
  Truck,
  User,
} from "lucide-react";

const StaffManagement: React.FC = () => {
  const [config, setConfig] = useState<any[] | null>(null);
  const [assignment, setAssignment] = useState<any[] | null>(null);

  // Role to icon mapping
  const roleIcons: Record<string, React.ReactNode> = {
    dough: <Pizza className="inline w-4 h-4 mr-1 text-orange-600" />,
    topping: <ShoppingBasket className="inline w-4 h-4 mr-1 text-green-600" />,
    cashier: <User className="inline w-4 h-4 mr-1 text-blue-600" />,
    waiter: <Users className="inline w-4 h-4 mr-1 text-purple-600" />,
    delivery: <Truck className="inline w-4 h-4 mr-1 text-red-600" />,
    packaging: <Package className="inline w-4 h-4 mr-1 text-pink-600" />,
    bar: <Coffee className="inline w-4 h-4 mr-1 text-brown-600" />,
  };

  // Generate today's config
  const generateBestConfig = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    return [{
      date: formattedDate,
      shifts: [
        {
          name: "Day (8am-4pm)",
          roles: {
            dough: 1,
            topping: 1,
            cashier: 1,
            waiter: 1,
            delivery: 1,
            packaging: 1,
            bar: 1,
          },
        },
        {
          name: "Night (4pm-1am)",
          roles: {
            dough: 2,
            topping: 2,
            cashier: 2,
            waiter: 3,
            delivery: 2,
            packaging: 2,
            bar: 2,
          },
        },
      ],
    }];
  };

  // Generate today's assignment
  const generateBestAssignment = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const dayShift: Record<string, string[]> = {
      dough: ["Youssef", "Karim"],
      topping: ["Khaled", "Hassan"],
      cashier: ["Nour", "Amel"],
      waiter: ["Rania", "Samir", "Salima"],
      delivery: ["Salem", "Nadia"],
      packaging: ["Ahmed", "Leila"],
      bar: ["Zineb", "Omar"],
    };

    return [{
      date: formattedDate,
      day: dayShift,
      night: dayShift,
    }];
  };

  return (
    <div className="staff-management">
      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-filter-left">
          <button className="control-button">
            <Calendar className="nav-icon" />
            Today
          </button>
          <button className="control-button">
            <Filter className="nav-icon" />
          </button>
          <div className="search-input-group">
            <Search className="nav-icon" />
            <input type="text" placeholder="Q Search" />
          </div>
        </div>
        <button className="add-button">
          <Plus className="nav-icon" />
          Add New Staff +
        </button>
      </div>

      {/* Config Card */}
      <div className="staff-card">
        <div className="card-header">
          <div className="card-title-section">
            <div className="card-subtitle">Staff Planning</div>
            <h2 className="card-title">Best Staff Configuration</h2>
          </div>
          <button
            className="add-button"
            onClick={() => setConfig(generateBestConfig())}
          >
            Get Best Config
          </button>
        </div>
        <div className="card-body">
          {config && (
            <div className="config-list">
              {config.map((day, i) => (
                <div key={i} className="config-item">
                  <h3 className="config-date">
                    📅 {day.date}
                  </h3>
                  {day.shifts.map((shift: any, idx: number) => (
                    <div key={idx} className="shift-section">
                      <p className="shift-name">{shift.name}</p>
                      <div className="roles-grid">
                        {Object.entries(
                          shift.roles as Record<string, number>
                        ).map(([role, count]) => (
                          <div key={role} className="role-item">
                            {roleIcons[role]}
                            <span className="role-name">{role}</span>
                            <span className="role-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Card */}
      <div className="staff-card">
        <div className="card-header">
          <div className="card-title-section">
            <div className="card-subtitle">Staff Planning</div>
            <h2 className="card-title">Best Staff Assignment</h2>
          </div>
          <button
            className="add-button"
            onClick={() => setAssignment(generateBestAssignment())}
          >
            Get Best Assignment
          </button>
        </div>
        <div className="card-body">
          {assignment && (
            <div className="assignment-list">
              {assignment.map((day, i) => (
                <div key={i} className="assignment-item">
                  <h3 className="assignment-date">
                    📅 {day.date}
                  </h3>
                  <div className="shift-assignment">
                    <p className="shift-title">
                      Day Shift (Forecast Orders: 340)
                    </p>
                    <div className="roles-grid">
                      {Object.entries(
                        day.day as Record<string, string[]>
                      ).map(([role, people]) => (
                        <div key={role} className="role-item">
                          {roleIcons[role]}
                          <span className="role-name">{role}</span>
                          <span className="role-people">{people.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="shift-assignment">
                    <p className="shift-title">
                      Night Shift (Forecast Orders: 570)
                    </p>
                    <div className="roles-grid">
                      {Object.entries(
                        day.night as Record<string, string[]>
                      ).map(([role, people]) => (
                        <div key={role} className="role-item">
                          {roleIcons[role]}
                          <span className="role-name">{role}</span>
                          <span className="role-people">{people.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
