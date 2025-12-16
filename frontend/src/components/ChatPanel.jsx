import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function ChatPanel({ customer, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  // Helper to scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!customer) return;
    setLoading(true);

    // Initial Fetch
    fetchMessages();

    // Polling every 2 seconds to see new replies instantly
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [customer]);

  const fetchMessages = () => {
    // API Call to get chat history
    axios
      .get(`http://localhost:4000/customers/${customer.id}/messages`)
      .then((res) => {
        setMessages(res.data);
        if (loading) setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      // API Call to send message via Server -> WhatsApp
      await axios.post("http://localhost:4000/messages", {
        customerId: customer.id,
        text: inputText,
      });

      setInputText(""); // Clear input
      fetchMessages(); // Refresh chat immediately
    } catch (err) {
      console.error("Failed to send", err);
      alert("Failed to send message. Check server logs.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0f0f16] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#13131f]">
        <div>
          <h2 className="text-white font-bold">
            {customer.name || customer.phone}
          </h2>
          <p className="text-xs text-gray-400 font-mono">{customer.phone}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2"
        >
          ✕
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0f]"
        ref={scrollRef}
      >
        {loading ? (
          <div className="text-center text-gray-500 mt-10">Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-600 mt-10 text-sm">
            No messages yet.
          </div>
        ) : (
          messages.map((msg) => {
            // Check direction: 'out' means YOU sent it, 'in' means Customer sent it
            const isOutbound = msg.direction === "out";
            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOutbound ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    isOutbound
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-[#1f1f2e] text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[10px] mt-1 opacity-50 ${
                      isOutbound ? "text-purple-200" : "text-gray-500"
                    }`}
                  >
                    {/* Format Time */}
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INPUT AREA (This replaces your 'Read-only' text) */}
      <div className="p-4 bg-[#13131f] border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isSending}
            placeholder={isSending ? "Sending..." : "Type a reply..."}
            className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
              isSending
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isSending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
