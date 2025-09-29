import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MessageSquare } from "lucide-react";

const ProductMsg = () => {
  const { id: productId } = useParams();
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const username = localStorage.getItem("username") || "";
  const [sellerId, setSellerId] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch sellerId (userId) from username
  useEffect(() => {
    if (!username) return;
    axios.get(`http://localhost:8081/get-userid/${username}`)
      .then(res => setSellerId(res.data.userId))
      .catch(() => {});
  }, [username]);

  // Fetch buyers who messaged for this product
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    axios.get(`http://localhost:8081/product-buyers/${productId}`)
      .then(res => setBuyers(res.data))
      .finally(() => setLoading(false));
  }, [productId]);

  // Fetch chat history with selected buyer
  useEffect(() => {
    if (!selectedBuyer || !sellerId) return;
    setChatLoading(true);
    axios.get(`http://localhost:8081/chat/history/${productId}/${sellerId}/${selectedBuyer.user_id}`)
      .then(res => setChatMessages(res.data))
      .finally(() => setChatLoading(false));
  }, [selectedBuyer, sellerId, productId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Send message to buyer
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedBuyer) return;
    const messageData = {
      product_id: productId,
      sender_id: sellerId,
      receiver_id: selectedBuyer.user_id,
      message_text: chatInput.trim(),
    };
    setChatMessages(prev => [
      ...prev,
      {
        ...messageData,
        sender_id: sellerId,
        timestamp: new Date().toISOString(),
      },
    ]);
    setChatInput("");
    try {
      await axios.post("http://localhost:8081/send-message", messageData);
    } catch {
      alert("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Buyers who messaged about this product</h2>
        {loading ? (
          <p>Loading buyers...</p>
        ) : buyers.length === 0 ? (
          <p className="text-gray-500">No buyers have messaged for this product.</p>
        ) : (
          <ul className="divide-y mb-4">
            {buyers.map((buyer) => (
              <li
                key={buyer.user_id}
                className={`py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded ${selectedBuyer && selectedBuyer.user_id === buyer.user_id ? "bg-green-50" : ""}`}
                onClick={() => setSelectedBuyer(buyer)}
              >
                <span>
                  <span className="font-semibold">{buyer.name || buyer.username}</span>
                  <span className="block text-xs text-gray-400">{buyer.email}</span>
                </span>
                <MessageSquare className="text-green-600" />
              </li>
            ))}
          </ul>
        )}

        {/* Chat Window */}
        {selectedBuyer && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">
              Chat with {selectedBuyer.name || selectedBuyer.username}
            </h3>
            <div className="h-64 overflow-y-auto bg-gray-100 rounded p-3 mb-2">
              {chatLoading ? (
                <div className="text-center text-gray-400">Loading chat...</div>
              ) : chatMessages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center mt-4">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_id === sellerId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-xl mb-1 ${
                        msg.sender_id === sellerId
                          ? "bg-green-100 text-gray-800 rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.message_text}</p>
                      <span className="text-xs text-gray-500 block text-right mt-1">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={chatInput.trim() === ""}
                className={`p-2 rounded-lg transition-colors ${
                  chatInput.trim() === ""
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <MessageSquare size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMsg;