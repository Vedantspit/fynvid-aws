import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

export default function SubscribeButton({
  channelId,
  initialSubscribed = false,
  initialCount = 0,
  onCountChange,
}) {
  const { api } = useAuth();
  const [state, setState] = useState({
    subscribed: initialSubscribed,
    count: initialCount,
  });
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await api.request(endpoints.toggleSubscription(channelId), {
        method: "POST",
      });

      setState((prev) => {
        const newSubscribed = !prev.subscribed;
        const newCount = newSubscribed
          ? prev.count + 1
          : Math.max(0, prev.count - 1);

        // notify parent once
        onCountChange?.(newCount);

        return {
          subscribed: newSubscribed,
          count: newCount,
        };
      });
    } catch (e) {
      console.error("Failed to toggle subscription:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-1.5 rounded font-medium transition ${
        state.subscribed
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {loading ? "..." : state.subscribed ? `Subscribed ` : `Subscribe `}
    </button>
  );
}
