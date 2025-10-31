import React, { useRef } from "react";

export const NotificationPage = ({
  franchises = [],                // ✅ default empty array
  notifications = [],             // ✅ default empty array
  onMarkRead = () => {},          // ✅ default no-op function
  onMarkAllRead = () => {},       // ✅ default no-op function
}) => {
  const listRef = useRef(null);

  const getFranchiseName = (id) => {
    const franchise = franchises.find((f) => f.id === id);
    return franchise ? franchise.name : "Unknown Franchise";
  };

  const handleMarkAllAndScroll = () => {
    onMarkAllRead();
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  return (
    <div className="relative min-h-[400px] px-4 sm:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 mt-16 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
      </div>
      <p className="text-gray-700 mb-6 text-sm sm:text-base">
        View recent updates and alerts
      </p>

      {/* Notifications List */}
      <ul
        ref={listRef}
        className="space-y-4 mb-20 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
      >
        {notifications.length === 0 && (
          <li className="text-center text-gray-500">No notifications.</li>
        )}

        {notifications.map(({ id, message, time, franchiseId, read }) => (
          <li
            key={id}
            className={`p-4 border rounded-lg shadow-sm bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition ${
              read ? "opacity-60" : "font-semibold"
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold text-base sm:text-lg">{message}</p>
              <p className="text-xs sm:text-sm text-gray-700">{time}</p>
              <p className="text-xs text-gray-500">
                Franchise: {getFranchiseName(franchiseId)}
              </p>
            </div>
            {!read && (
              <button
                className="text-blue-600 underline text-xs sm:text-sm self-start sm:self-center"
                onClick={() => onMarkRead(id)}
              >
                Mark Read
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Floating Action Button */}
      {notifications.some((n) => !n.read) && (
        <button
          onClick={handleMarkAllAndScroll}
          title="Mark all notifications as read"
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
          aria-label="Mark all notifications as read"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};
