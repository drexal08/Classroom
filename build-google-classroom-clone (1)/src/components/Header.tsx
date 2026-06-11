"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Avatar } from "./Avatar";
import { IconMenu, IconLogout, IconGraduation, IconSettings } from "./Icons";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3 flex-1">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IconMenu className="w-6 h-6 text-gray-600" />
          </button>
        )}
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <IconGraduation className="w-8 h-8 text-classroom-blue" />
          <span className="text-xl text-gray-700 font-normal hidden sm:inline">Classroom</span>
        </a>
      </div>

      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="hover:opacity-80 transition-opacity"
        >
          <Avatar name={user.name} color={user.avatarColor} />
        </button>

        {showProfile && (
          <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-72 animate-slide-in">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} color={user.avatarColor} size="lg" />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => { logout(); setShowProfile(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-3"
            >
              <IconLogout className="w-5 h-5 text-gray-500" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
