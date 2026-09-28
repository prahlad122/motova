"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Icon from "@/components/ui/Icon";

import { clearAuthSession, getAuthSession } from "@/features/auth/auth.utils";

type NavbarProps = {
  setMobileMenuOpen: (open: boolean) => void;
};

export default function Navbar({ setMobileMenuOpen }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * Load logged-in user
   */
  useEffect(() => {
    const session = getAuthSession();

    if (!session?.user) {
      return;
    }

    setUserName(session.user.name || "User");
    setUserRole(session.user.role || "");
  }, []);

  /*
   * Close profile dropdown when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * Open logout confirmation
   */
  function handleLogoutClick() {
    setProfileOpen(false);
    setLogoutModalOpen(true);
  }

  /*
   * Confirm logout
   */
  function handleConfirmLogout() {
    setLoggingOut(true);

    clearAuthSession();

    router.replace("/login");

    setLogoutModalOpen(false);
    setLoggingOut(false);
  }

  /*
   * Get first letter for avatar
   */
  const avatarLetter = userName.trim().charAt(0).toUpperCase() || "U";

  /*
   * Display role
   */
  const displayRole =
    userRole === "VENDOR" ? "Vendor" : userRole === "ADMIN" ? "Admin" : "User";

  return (
    <>
      {/* Navbar */}
      <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#eceef0] bg-white px-3 sm:px-4 lg:px-6">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#44484e] hover:bg-[#f5f6f7] md:hidden"
          >
            <Icon name="menu" className="text-[21px]" />
          </button>

          <h1 className="truncate text-[16px] font-semibold tracking-[-0.2px] text-[#25282d] sm:text-[17px]">
            Dashboard
          </h1>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* New Entry */}
          <button
            type="button"
            className="flex h-[30px] shrink-0 items-center justify-center gap-1 rounded-full bg-[#3d82f6] px-3 text-[10px] font-medium whitespace-nowrap text-white transition hover:bg-[#3275e8] sm:px-4 sm:text-[11px]"
          >
            <span className="hidden sm:inline">New entry</span>

            <span className="sm:hidden">New</span>

            <Icon name="add" className="text-[15px]" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#e7e9ec] bg-white text-[#44484e] hover:bg-[#f7f8f9]"
          >
            <Icon name="notifications" className="text-[16px]" />
          </button>

          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#e7e9ec] bg-white text-[#44484e] hover:bg-[#f7f8f9]"
          >
            <Icon name="search" className="text-[16px]" />
          </button>

          {/* Profile */}
          <div ref={profileRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Profile"
              aria-expanded={profileOpen}
              className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#c5b09d] text-[10px] font-semibold text-white outline-none transition hover:ring-2 hover:ring-[#3d82f6]/30"
            >
              {avatarLetter}
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[220px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                {/* Profile Information */}
                <div className="border-b border-[#eef0f2] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#c5b09d] text-[13px] font-semibold text-white">
                      {avatarLetter}
                    </div>

                    {/* User Details */}
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#25282d]">
                        {userName}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-[#73777d]">
                        {displayRole}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="p-1.5">
                  {/* Profile */}
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-[#3f4348] transition hover:bg-[#f5f7f9]"
                  >
                    <Icon name="person" className="text-[17px]" />

                    <span>Profile</span>
                  </button>

                  {/* Account Settings */}
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-[#3f4348] transition hover:bg-[#f5f7f9]"
                  >
                    <Icon name="settings" className="text-[17px]" />

                    <span>Account Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-[#eef0f2] p-1.5">
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-[#dc2626] transition hover:bg-[#fef2f2]"
                  >
                    <Icon name="logout" className="text-[17px]" />

                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4"
          onClick={() => {
            if (!loggingOut) {
              setLogoutModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Logout Icon */}
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]">
              <Icon name="logout" className="text-[22px]" />
            </div>

            {/* Title */}
            <h2
              id="logout-title"
              className="text-[18px] font-semibold text-[#25282d]"
            >
              Logout?
            </h2>

            {/* Description */}
            <p className="mt-2 text-[13px] leading-5 text-[#73777d]">
              Are you sure you want to logout from your account?
            </p>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              {/* Cancel */}
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setLogoutModalOpen(false)}
                className="h-[36px] rounded-lg border border-[#e1e4e8] bg-white px-4 text-[12px] font-medium text-[#44484e] transition hover:bg-[#f5f6f7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Confirm */}
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleConfirmLogout}
                className="flex h-[36px] items-center justify-center rounded-lg bg-[#dc2626] px-4 text-[12px] font-medium text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
