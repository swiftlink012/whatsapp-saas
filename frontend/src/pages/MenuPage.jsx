import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Utensils,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";

// --- COMPONENT: WhatsApp Live Preview ---
const WhatsAppMockup = ({ data }) => {
  return (
    <div className="w-[300px] h-[580px] bg-gray-900 rounded-[35px] border-[12px] border-gray-800 relative overflow-hidden shadow-2xl shrink-0">
      {/* Phone Speaker/Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>

      {/* WhatsApp Header */}
      <div className="bg-[#075e54] h-20 flex items-end pb-3 px-4 shadow-sm relative z-10">
        <div className="flex items-center gap-3 w-full text-white">
          <ArrowLeft size={20} />
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            W
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">My Restaurant</div>
            <div className="text-[10px] text-white/80">Online</div>
          </div>
          <div className="flex gap-3">
            <Video size={18} />
            <Phone size={18} />
            <MoreVertical size={18} />
          </div>
        </div>
      </div>

      {/* Chat Background */}
      <div className="h-full bg-[#e5ddd5] p-3 relative overflow-y-auto pb-24">
        {/* Background Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-[0.06] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat pointer-events-none"></div>

        {/* Date Divider */}
        <div className="flex justify-center mb-4 relative z-10">
          <span className="bg-[#dcf8c6] text-gray-600 text-[10px] px-2 py-1 rounded-lg shadow-sm">
            Today
          </span>
        </div>

        {/* User Message (Trigger) */}
        <div className="flex justify-end mb-4 relative z-10">
          <div className="bg-[#dcf8c6] p-2 px-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
            <p className="text-xs text-gray-800">Hi, show me the menu</p>
            <span className="text-[9px] text-gray-500 block text-right mt-1">
              10:42 AM
            </span>
          </div>
        </div>

        {/* Bot Response (The Item Preview) */}
        <div className="flex justify-start mb-4 relative z-10">
          <div className="bg-white p-1 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
            {/* Product Card Look */}
            <div className="p-1">
              {/* Image Placeholder */}
              <div className="w-full h-28 bg-gray-200 rounded-lg mb-2 flex flex-col items-center justify-center text-gray-400">
                <Utensils size={24} className="mb-1 opacity-50" />
                <span className="text-[10px]">Item Image</span>
              </div>

              <div className="px-1 pb-1">
                <p className="font-bold text-gray-800 text-sm">
                  {data.itemName || "Item Name"}
                </p>
                <p className="text-gray-500 text-[10px] leading-tight mt-1 mb-2">
                  {data.description || "Description will appear here..."}
                </p>
                <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Price</span>
                  <span className="text-xs font-bold text-gray-800">
                    ₹{data.price || "0.00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Button Simulation */}
            <div className="border-t border-gray-100 p-2 mt-1">
              <button className="w-full text-center text-[#00a884] text-xs font-semibold">
                + Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    itemName: "",
    price: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/menu", {
        withCredentials: true,
      });
      setMenuItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBackend = async (newMenuArray) => {
    try {
      await axios.put(
        "http://localhost:4000/api/menu",
        { menu: newMenuArray },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Failed to save changes.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddNew = () => {
    setFormData({ itemName: "", price: "", category: "", description: "" });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEdit = (index) => {
    setFormData(menuItems[index]);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm("Delete this item?")) {
      const updatedMenu = menuItems.filter((_, i) => i !== index);
      setMenuItems(updatedMenu);
      saveToBackend(updatedMenu);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    let updatedMenu = [...menuItems];
    if (editingIndex !== null) {
      updatedMenu[editingIndex] = formData;
    } else {
      updatedMenu.push(formData);
    }
    setMenuItems(updatedMenu);
    setIsModalOpen(false);
    saveToBackend(updatedMenu);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Menu Management</h1>
          <p className="text-gray-400 mt-2">
            Create and manage your digital menu items.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} /> Add Item
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-[#13131f] border border-white/5 rounded-2xl border-dashed">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <Utensils className="text-gray-500" size={32} />
            </div>
            <p className="text-gray-400 text-lg">Your menu is empty.</p>
            <button
              onClick={handleAddNew}
              className="mt-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Add your first item
            </button>
          </div>
        )}

        {menuItems.map((item, index) => (
          <div
            key={index}
            className="group relative bg-[#13131f] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded-md">
                  {item.category}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {item.itemName}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="text-gray-500 text-sm">Price</span>
                <span className="text-xl font-bold text-emerald-400">
                  ${item.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- NEW SPLIT-SCREEN MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in">
          {/* Increased width to max-w-5xl to fit both columns */}
          <div className="bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row">
            {/* LEFT SIDE: FORM */}
            <div className="flex-1 flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/50">
                <h2 className="text-xl font-bold text-white">
                  {editingIndex !== null ? "Edit Item" : "New Menu Item"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Form */}
              <form
                onSubmit={handleSave}
                className="p-6 space-y-5 flex-1 overflow-y-auto"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    required
                    value={formData.itemName}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    placeholder="e.g. Spicy Chicken Burger"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      list="categories"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      placeholder="Select..."
                    />
                    <datalist id="categories">
                      <option value="Starters" />
                      <option value="Mains" />
                      <option value="Desserts" />
                      <option value="Drinks" />
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                    placeholder="Describe ingredients, taste, etc."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 mt-4"
                >
                  <Save size={18} /> Save Item
                </button>
              </form>
            </div>

            {/* RIGHT SIDE: LIVE PREVIEW (Hidden on small screens) */}
            <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-[#0a0a0f]/50 border-l border-white/5 w-[380px]">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
                Live WhatsApp Preview
              </h3>
              <WhatsAppMockup data={formData} />
              <p className="text-center text-gray-600 text-xs mt-4 px-4">
                This is how your customers will see this item in the WhatsApp
                chat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
