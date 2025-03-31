import { useState, useEffect } from "react";
import axios from "axios";
import { Users, ShoppingBag, Star, TrendingUp, Target, Leaf } from "lucide-react";

const AboutUs = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalItems: 0,
        totalSold: 0,
        averageRating: "0.0",
        totalRatings: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("http://localhost:8081/stats");
                setStats(response.data);
            } catch (err) {
                setError("Failed to load marketplace statistics");
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">About Our Marketplace</h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
                    {/* Total Users */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        <p className="text-sm text-gray-500 mt-2">Unique sellers in our community</p>
                    </div>

                    {/* Total Items */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Listed Items</h3>
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                        <p className="text-sm text-gray-500 mt-2">Products available</p>
                    </div>

                    {/* Items Sold */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Items Sold</h3>
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalSold}</p>
                        <p className="text-sm text-gray-500 mt-2">Successful transactions</p>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Seller Rating</h3>
                            <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="flex items-center">
                            <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                            <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">From {stats.totalRatings} ratings</p>
                    </div>
                </div>

                {/* Mission and Vision Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Mission Statement */}
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <Target className="w-8 h-8 text-green-600 mr-3" />
                            Our Mission
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            To provide a trusted platform where people can buy and sell quality pre-owned items 
                            at fair prices. We aim to extend the lifecycle of products, reduce waste, and make 
                            sustainable shopping accessible to everyone. By connecting sellers with buyers, we 
                            create opportunities for both economic savings and environmental conservation.
                        </p>
                    </div>

                    {/* Vision Statement */}
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <Leaf className="w-8 h-8 text-blue-600 mr-3" />
                            Our Vision
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            To revolutionize the way people think about second-hand shopping by creating 
                            the most trusted and user-friendly marketplace for pre-owned items. We envision 
                            a world where buying second-hand becomes the first choice for conscious consumers, 
                            leading to significant reductions in waste and environmental impact while building 
                            a strong, sustainable community.
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        We value sustainability, affordability, and trust. These principles guide our platform and community.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs; 