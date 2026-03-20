import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Recycle, Factory, Leaf, TrendingUp, Upload, Search, MapPin, DollarSign, Package, Sparkles, BarChart3, TreeDeciduous, Cloud, MessageCircle, X, Send, Wallet, ShoppingCart, Store, Shield, CheckCircle2, TrendingDown } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "@/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
      if (response.data.wallet_address) {
        setWalletAddress(response.data.wallet_address);
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);
        if (user) {
          await axios.put(`${API}/auth/wallet?wallet_address=${address}`);
          toast.success("Wallet connected successfully!");
        }
        return address;
      } catch (error) {
        toast.error("Failed to connect wallet");
        return null;
      }
    } else {
      toast.error("Please install MetaMask!");
      return null;
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setWalletAddress(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, walletAddress, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your 24/7 AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: input,
        session_id: sessionId
      });
      
      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, { role: "assistant", content: response.data.response }]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ai-glow animate-pulse-glow"
        data-testid="ai-chatbot-button"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] glass-effect rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden" data-testid="ai-chatbot-window">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <div>
                <h3 className="font-bold font-heading text-lg">AI Assistant</h3>
                <p className="text-xs opacity-90">24/7 Support • Powered by GPT-4o</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/95">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                    : "glass-effect border border-border/50"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-effect p-3 rounded-2xl border border-border/50">
                  <p className="text-sm flex items-center gap-2">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{animationDelay: '0.2s'}}>●</span>
                    <span className="animate-pulse" style={{animationDelay: '0.4s'}}>●</span>
                    AI is thinking...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border/50 bg-background/95">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 glass-effect border-border/50"
                data-testid="ai-chat-input"
              />
              <Button 
                onClick={sendMessage} 
                size="icon" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                data-testid="ai-chat-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Navbar = () => {
  const { user, logout, walletAddress, connectWallet } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/50 glass-effect backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" data-testid="navbar-logo">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 ai-glow group-hover:scale-110 transition-transform duration-300">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black font-heading tracking-tight gradient-text">EcoMarket</span>
            <Badge variant="outline" className="ml-2 text-xs border-primary/50 bg-primary/5 ai-glow">
              <Sparkles className="w-3 h-3 mr-1 text-accent" />
              AI Powered
            </Badge>
          </Link>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/marketplace" data-testid="nav-marketplace">
                  <Button variant="ghost" className="transition-all duration-200 hover:scale-105 hover:bg-primary/10">Marketplace</Button>
                </Link>
                <Link to="/create-listing" data-testid="nav-create-listing">
                  <Button variant="ghost" className="transition-all duration-200 hover:scale-105 hover:bg-accent/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Sell
                  </Button>
                </Link>
                <Link to="/analytics" data-testid="nav-analytics">
                  <Button variant="ghost" className="transition-all duration-200 hover:scale-105 hover:bg-secondary/10">Analytics</Button>
                </Link>
                {!walletAddress ? (
                  <Button 
                    onClick={connectWallet} 
                    variant="outline" 
                    size="sm"
                    className="transition-all duration-200 hover:scale-105 border-primary/50 hover:bg-primary/10"
                    data-testid="connect-wallet-button"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <Badge className="font-mono text-xs bg-gradient-to-r from-purple-600 to-pink-600 ai-glow">
                    <Wallet className="w-3 h-3 mr-1" />
                    {walletAddress.substring(0, 4)}...{walletAddress.substring(38)}
                  </Badge>
                )}
                <Button 
                  onClick={logout} 
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105"
                  data-testid="logout-button"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth" data-testid="nav-auth">
                <Button className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-110 ai-glow font-semibold">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/marketplace");
  }, [user]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -top-48 -left-48 animate-float" />
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-1/4 right-0 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl bottom-0 left-1/3 animate-float" style={{animationDelay: '4s'}} />
      </div>

      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 text-sm px-6 py-2 ai-glow border-primary/50 bg-primary/5 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 inline text-accent animate-pulse" />
              <span className="gradient-text font-semibold">Powered by AI & DeFi Technology</span>
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-black font-heading tracking-tight leading-tight mb-6 gradient-text floating-animation" data-testid="hero-title">
              Transform Industrial Waste Into Valuable Assets
            </h1>
            <p className="text-lg lg:text-xl text-foreground/80 mb-10 leading-relaxed max-w-3xl mx-auto">
              The world's first <span className="text-primary font-semibold">AI-powered DeFi</span> marketplace connecting industries, recyclers, and farmers. Trade waste materials with crypto payments, intelligent classification, and real-time impact tracking.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-10 py-7 transition-all duration-300 hover:scale-110 hover:shadow-2xl ai-glow font-bold"
                data-testid="hero-cta-button"
              >
                <Store className="w-5 h-5 mr-2" />
                Start Trading Now
              </Button>
              <Button 
                onClick={() => navigate("/create-listing")} 
                size="lg" 
                className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-10 py-7 transition-all duration-300 hover:scale-110 hover:shadow-2xl font-bold"
                data-testid="hero-sell-button"
              >
                <Upload className="w-5 h-5 mr-2" />
                Sell Waste Material
              </Button>
              <Button 
                onClick={() => navigate("/analytics")} 
                size="lg" 
                variant="outline"
                className="rounded-full text-lg px-10 py-7 transition-all duration-300 hover:scale-110 border-2 border-primary/50 glass-effect hover:bg-primary/10"
                data-testid="hero-analytics-button"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black font-heading mb-4 gradient-text">How It Works</h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">Three simple steps powered by artificial intelligence</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-3d glass-effect rounded-2xl p-8 relative overflow-hidden group" data-testid="feature-card-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-4 left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ai-glow">1</div>
              <div className="relative z-10">
                <Factory className="w-16 h-16 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-black font-heading mb-4">List Your Waste</h3>
                <p className="text-foreground/70 leading-relaxed">Upload detailed information, images, and set pricing in USD or ETH. Our AI will classify and optimize your listing automatically.</p>
              </div>
            </div>
            
            <div className="card-3d glass-effect rounded-2xl p-8 relative overflow-hidden group" data-testid="feature-card-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-4 left-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ai-glow">2</div>
              <div className="relative z-10">
                <ShoppingCart className="w-16 h-16 text-secondary mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-black font-heading mb-4">Browse & Buy</h3>
                <p className="text-foreground/70 leading-relaxed">Search verified waste materials, view AI classifications, and purchase using traditional or crypto payments securely.</p>
              </div>
            </div>
            
            <div className="card-3d glass-effect rounded-2xl p-8 relative overflow-hidden group" data-testid="feature-card-3">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-4 left-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ai-glow">3</div>
              <div className="relative z-10">
                <TrendingUp className="w-16 h-16 text-accent mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-black font-heading mb-4">Track Impact</h3>
                <p className="text-foreground/70 leading-relaxed">Monitor your environmental contribution with real-time analytics showing CO2 saved, waste diverted, and sustainability metrics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/50 bg-accent/5">
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Market Intelligence
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-black font-heading mb-4 gradient-text">Global Waste Market Opportunity</h2>
            <p className="text-foreground/70 text-lg max-w-3xl mx-auto">The industrial waste recycling market is experiencing exponential growth</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="card-3d glass-effect rounded-2xl p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ai-glow">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black font-heading gradient-text mb-2">$410B</h3>
              <p className="text-foreground/60">Global Market Size</p>
              <p className="text-xs text-foreground/40 mt-2">2024 Valuation</p>
            </div>

            <div className="card-3d glass-effect rounded-2xl p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center ai-glow">
                <Factory className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black font-heading gradient-text mb-2">7.2%</h3>
              <p className="text-foreground/60">Annual Growth Rate</p>
              <p className="text-xs text-foreground/40 mt-2">CAGR 2024-2030</p>
            </div>

            <div className="card-3d glass-effect rounded-2xl p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center ai-glow">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black font-heading gradient-text mb-2">2B+</h3>
              <p className="text-foreground/60">Tons Recycled</p>
              <p className="text-xs text-foreground/40 mt-2">Annually Worldwide</p>
            </div>

            <div className="card-3d glass-effect rounded-2xl p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center ai-glow">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black font-heading gradient-text mb-2">$285/ton</h3>
              <p className="text-foreground/60">Average Price</p>
              <p className="text-xs text-foreground/40 mt-2">Industrial Waste</p>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-3xl font-black font-heading mb-2">Metal Scrap</h4>
                  <p className="text-foreground/60 mb-3">$180B Market</p>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: '44%'}} />
                  </div>
                  <p className="text-xs text-foreground/50 mt-2">44% of total market</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4">
                    <Recycle className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="text-3xl font-black font-heading mb-2">Plastic Waste</h4>
                  <p className="text-foreground/60 mb-3">$95B Market</p>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-600" style={{width: '23%'}} />
                  </div>
                  <p className="text-xs text-foreground/50 mt-2">23% of total market</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                    <Leaf className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="text-3xl font-black font-heading mb-2">E-Waste</h4>
                  <p className="text-foreground/60 mb-3">$65B Market</p>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-600 to-purple-600" style={{width: '16%'}} />
                  </div>
                  <p className="text-xs text-foreground/50 mt-2">16% of total market</p>
                </div>
              </div>

              <div className="text-center pt-6 border-t border-border/50">
                <p className="text-foreground/80 text-lg mb-4">
                  <span className="font-bold text-primary">EcoMarket</span> is positioned at the intersection of this massive opportunity with AI-powered efficiency and DeFi innovation
                </p>
                <Button 
                  onClick={() => navigate("/marketplace")} 
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-110 ai-glow font-bold"
                >
                  Explore Opportunities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/5">DeFi Integration</Badge>
              <h2 className="text-4xl lg:text-5xl font-black font-heading mb-6 gradient-text">Decentralized Finance Meets Sustainability</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Wallet className="w-8 h-8 text-secondary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Crypto Payments</h3>
                    <p className="text-foreground/70">Pay with ETH or traditional USD. Connect your MetaMask wallet for seamless transactions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Secure & Transparent</h3>
                    <p className="text-foreground/70">All transactions are secure with blockchain verification and smart contract protection.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Sparkles className="w-8 h-8 text-accent flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">AI-Powered</h3>
                    <p className="text-foreground/70">Get instant waste classification, market pricing, and 24/7 AI assistant support.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="card-3d glass-effect rounded-2xl p-8 ai-glow">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-10 h-10 text-chart-1" />
                  <div>
                    <p className="font-black font-heading text-2xl">100% Verified</p>
                    <p className="text-sm text-foreground/60">All listings AI-validated</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                    <span className="text-sm text-foreground/70">Metal Scrap</span>
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">+12%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                    <span className="text-sm text-foreground/70">Plastic Waste</span>
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600">+8%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                    <span className="text-sm text-foreground/70">E-Waste</span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">+15%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company_name: "",
    location: ""
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
      const response = await axios.post(`${API}${endpoint}`, payload);
      login(response.data.token, response.data.user);
      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      navigate("/marketplace");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6" style={{background: "linear-gradient(135deg, #FDFDFC 0%, #F4F5F4 100%)"}}>
      <Card className="w-full max-w-md border-2 shadow-2xl" data-testid="auth-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-black font-heading text-center text-primary">
            {isLogin ? "Welcome Back" : "Join EcoMarket"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to continue trading" : "Create your account to start trading"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name" 
                    data-testid="auth-name-input"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required={!isLogin}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name (Optional)</Label>
                  <Input 
                    id="company_name" 
                    data-testid="auth-company-input"
                    value={formData.company_name} 
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                    placeholder="Acme Industries"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location" 
                    data-testid="auth-location-input"
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                    required={!isLogin}
                    placeholder="New York, USA"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                data-testid="auth-email-input"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required
                placeholder="you@company.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input 
                id="password" 
                type="password" 
                data-testid="auth-password-input"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full rounded-full" data-testid="auth-submit-button">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            data-testid="auth-toggle-button"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
    fetchMyListings();
  }, [search, filterType]);

  const fetchListings = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterType && filterType !== "all") params.waste_type = filterType;
      const response = await axios.get(`${API}/listings`, { params });
      setListings(response.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  const fetchMyListings = async () => {
    try {
      const response = await axios.get(`${API}/listings/my`);
      setMyListings(response.data);
    } catch (error) {
      console.error("Failed to fetch my listings", error);
    }
  };

  const ListingCard = ({ listing, isMine = false }) => (
    <div 
      className="card-3d glass-effect rounded-2xl overflow-hidden cursor-pointer group border border-border/50 hover:border-primary/50" 
      onClick={() => navigate(`/listing/${listing.id}`)}
      data-testid={`listing-card-${listing.id}`}
    >
      {listing.images.length > 0 ? (
        <div className="relative h-52 w-full overflow-hidden">
          <img 
            src={`${API}/files/${listing.images[0]}?auth=${localStorage.getItem("token")}`} 
            alt={listing.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Badge className="absolute top-4 right-4 ai-glow" variant={listing.status === "available" ? "default" : "secondary"}>
            {listing.status}
          </Badge>
          {listing.ai_classification && (
            <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Classified
            </div>
          )}
        </div>
      ) : (
        <div className="h-52 w-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
          <Package className="w-20 h-20 text-muted-foreground/30" />
        </div>
      )}
      
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-heading text-xl font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">{listing.title}</h3>
          <p className="text-sm text-foreground/60 line-clamp-2 leading-relaxed">{listing.description}</p>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Badge variant="outline" className="text-xs font-semibold">{listing.waste_type}</Badge>
          <div className="text-right">
            {listing.price_inr && (
              <div className="text-2xl font-black font-heading gradient-text">₹{listing.price_inr.toLocaleString('en-IN')}</div>
            )}
            <div className="text-sm text-foreground/50">${listing.price_usd}</div>
            {listing.price_eth && (
              <div className="text-xs text-foreground/40 flex items-center gap-1 justify-end mt-1">
                <Wallet className="w-3 h-3" />
                {listing.price_eth} ETH
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-foreground/70">
            <Package className="w-4 h-4 text-primary" />
            <span className="truncate">{listing.quantity} {listing.unit}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="truncate">{listing.location}</span>
          </div>
        </div>
        
        {listing.purity_percentage && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/30">
            <span className="text-foreground/60">Purity:</span>
            <Badge variant="outline" className="text-xs bg-primary/5">{listing.purity_percentage}%</Badge>
          </div>
        )}
        
        {!isMine && (
          <div className="pt-2 text-xs text-foreground/50">
            Seller: <span className="font-semibold text-foreground/80">{listing.seller_name}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-primary mb-3" data-testid="marketplace-title">
            Marketplace
          </h1>
          <p className="text-muted-foreground text-lg">Buy and sell verified waste materials</p>
        </div>

        <Tabs defaultValue="buy" className="w-full" data-testid="marketplace-tabs">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="buy" className="text-base" data-testid="buy-tab">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-base" data-testid="sell-tab">
              <Store className="w-4 h-4 mr-2" />
              My Listings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="Search waste materials..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="marketplace-search-input"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="md:w-64" data-testid="marketplace-filter-select">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="chemical">Chemical</SelectItem>
                  <SelectItem value="e-waste">E-Waste</SelectItem>
                  <SelectItem value="crop-residue">Crop Residue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {listings.length === 0 ? (
              <Card className="border-2" data-testid="no-marketplace-listings">
                <CardContent className="py-20 text-center">
                  <Package className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold font-heading mb-2">No listings found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sell" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">Manage your listings and track performance</p>
              <Button 
                onClick={() => navigate("/create-listing")} 
                className="rounded-full bg-primary hover:bg-primary/90"
                data-testid="create-listing-button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </div>

            {myListings.length === 0 ? (
              <Card className="border-2" data-testid="no-my-listings">
                <CardContent className="py-20 text-center">
                  <Store className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold font-heading mb-2">You haven't created any listings yet</h3>
                  <p className="text-muted-foreground mb-6">Start selling waste materials and contribute to sustainability</p>
                  <Button onClick={() => navigate("/create-listing")} data-testid="create-first-listing-button">
                    Create Your First Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} isMine={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    waste_type: "metal",
    quantity: "",
    unit: "kg",
    price_usd: "",
    price_eth: "",
    location: "",
    images: [],
    material_composition: "",
    certifications: "",
    pickup_available: true,
    delivery_available: false,
    min_order_quantity: "",
    purity_percentage: ""
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const response = await axios.post(`${API}/upload`, formDataUpload);
        return response.data.path;
      });
      
      const paths = await Promise.all(uploadPromises);
      setFormData({...formData, images: [...formData.images, ...paths]});
      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const certArray = formData.certifications.split(",").map(c => c.trim()).filter(c => c);
      
      const response = await axios.post(`${API}/listings`, {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price_usd: parseFloat(formData.price_usd),
        price_eth: formData.price_eth ? parseFloat(formData.price_eth) : null,
        min_order_quantity: formData.min_order_quantity ? parseFloat(formData.min_order_quantity) : null,
        purity_percentage: formData.purity_percentage ? parseFloat(formData.purity_percentage) : null,
        certifications: certArray
      });
      toast.success("Listing created successfully");
      navigate(`/listing/${response.data.id}`);
    } catch (error) {
      toast.error("Failed to create listing");
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-primary mb-3" data-testid="create-listing-title">
            Create Listing
          </h1>
          <p className="text-muted-foreground text-lg">Add detailed information about your waste material</p>
        </div>
        
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-heading text-primary">Basic Information</h3>
                
                <div>
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input 
                    id="title" 
                    data-testid="listing-title-input"
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    required
                    placeholder="e.g., High-Grade Steel Scrap"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    data-testid="listing-description-input"
                    rows={4}
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    required
                    placeholder="Detailed description of the waste material, its condition, and any relevant details..."
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waste_type">Waste Type *</Label>
                    <Select value={formData.waste_type} onValueChange={(val) => setFormData({...formData, waste_type: val})}>
                      <SelectTrigger data-testid="listing-waste-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="plastic">Plastic</SelectItem>
                        <SelectItem value="chemical">Chemical</SelectItem>
                        <SelectItem value="e-waste">E-Waste</SelectItem>
                        <SelectItem value="crop-residue">Crop Residue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="material_composition">Material Composition</Label>
                    <Input 
                      id="material_composition" 
                      data-testid="listing-composition-input"
                      value={formData.material_composition} 
                      onChange={(e) => setFormData({...formData, material_composition: e.target.value})} 
                      placeholder="e.g., 95% Steel, 5% Aluminum"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-bold font-heading text-primary">Quantity & Pricing</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      step="0.01"
                      data-testid="listing-quantity-input"
                      value={formData.quantity} 
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                      required
                      placeholder="100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(val) => setFormData({...formData, unit: val})}>
                      <SelectTrigger data-testid="listing-unit-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ton">ton</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="units">units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="min_order_quantity">Min Order Quantity</Label>
                    <Input 
                      id="min_order_quantity" 
                      type="number" 
                      step="0.01"
                      data-testid="listing-min-order-input"
                      value={formData.min_order_quantity} 
                      onChange={(e) => setFormData({...formData, min_order_quantity: e.target.value})} 
                      placeholder="10"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price_usd">Price (USD) *</Label>
                    <Input 
                      id="price_usd" 
                      type="number" 
                      step="0.01"
                      data-testid="listing-price-input"
                      value={formData.price_usd} 
                      onChange={(e) => setFormData({...formData, price_usd: e.target.value})} 
                      required
                      placeholder="500.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price_eth">Price (ETH)</Label>
                    <Input 
                      id="price_eth" 
                      type="number" 
                      step="0.0001"
                      data-testid="listing-price-eth-input"
                      value={formData.price_eth} 
                      onChange={(e) => setFormData({...formData, price_eth: e.target.value})} 
                      placeholder="0.15"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="purity_percentage">Purity %</Label>
                    <Input 
                      id="purity_percentage" 
                      type="number" 
                      step="0.1"
                      max="100"
                      data-testid="listing-purity-input"
                      value={formData.purity_percentage} 
                      onChange={(e) => setFormData({...formData, purity_percentage: e.target.value})} 
                      placeholder="95.5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-bold font-heading text-primary">Location & Logistics</h3>
                
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location" 
                    data-testid="listing-location-input"
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                    required
                    placeholder="City, State/Country"
                  />
                </div>
                
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.pickup_available}
                      onChange={(e) => setFormData({...formData, pickup_available: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Pickup Available</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.delivery_available}
                      onChange={(e) => setFormData({...formData, delivery_available: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Delivery Available</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-bold font-heading text-primary">Additional Information</h3>
                
                <div>
                  <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                  <Input 
                    id="certifications" 
                    data-testid="listing-certifications-input"
                    value={formData.certifications} 
                    onChange={(e) => setFormData({...formData, certifications: e.target.value})} 
                    placeholder="ISO 9001, EPA Certified"
                  />
                </div>
                
                <div>
                  <Label htmlFor="images">Upload Images</Label>
                  <Input 
                    id="images" 
                    type="file" 
                    accept="image/*" 
                    multiple
                    data-testid="listing-image-input"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload high-quality images of your waste material</p>
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {formData.images.map((img, idx) => (
                        <img key={idx} src={`${API}/files/${img}?auth=${localStorage.getItem("token")}`} alt="Preview" className="w-full h-24 object-cover rounded border-2" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full rounded-full py-6 text-lg" data-testid="listing-submit-button">
                <Upload className="w-5 h-5 mr-2" />
                Create Listing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`${API}/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      toast.error("Failed to fetch listing");
    }
  };

  const handleClassify = async () => {
    setClassifying(true);
    try {
      const response = await axios.post(`${API}/listings/${id}/classify`);
      setListing({...listing, ai_classification: response.data.classification});
      toast.success("AI classification completed");
    } catch (error) {
      toast.error("Classification failed");
    } finally {
      setClassifying(false);
    }
  };

  if (!listing) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const isMine = user && listing.seller_id === user.id;

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
          data-testid="back-button"
        >
          ← Back
        </Button>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            {listing.images.length > 0 ? (
              <>
                <img 
                  src={`${API}/files/${listing.images[0]}?auth=${localStorage.getItem("token")}`} 
                  alt={listing.title} 
                  className="w-full h-96 object-cover rounded-lg shadow-xl border-2"
                  data-testid="listing-detail-image"
                />
                {listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {listing.images.slice(1).map((img, idx) => (
                      <img 
                        key={idx}
                        src={`${API}/files/${img}?auth=${localStorage.getItem("token")}`} 
                        alt={`${listing.title} ${idx + 2}`} 
                        className="w-full h-24 object-cover rounded border-2 cursor-pointer hover:border-primary transition-colors"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-4xl font-black font-heading text-primary" data-testid="listing-detail-title">{listing.title}</h1>
                <Badge variant={listing.status === "available" ? "default" : "secondary"} className="text-sm">
                  {listing.status}
                </Badge>
              </div>
              
              <div className="flex items-baseline gap-3 mb-4">
                {listing.price_inr && (
                  <span className="text-5xl font-black font-heading gradient-text">₹{listing.price_inr.toLocaleString('en-IN')}</span>
                )}
                <span className="text-xl text-foreground/60">${listing.price_usd}</span>
                {listing.price_eth && (
                  <span className="text-lg text-foreground/50 flex items-center gap-1">
                    <Wallet className="w-4 h-4" />
                    {listing.price_eth} ETH
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="outline">{listing.waste_type}</Badge>
                {listing.purity_percentage && (
                  <Badge variant="outline">{listing.purity_percentage}% Purity</Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                <p className="font-bold font-heading">{listing.quantity} {listing.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-bold font-heading flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </p>
              </div>
              {listing.min_order_quantity && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Min Order</p>
                  <p className="font-bold font-heading">{listing.min_order_quantity} {listing.unit}</p>
                </div>
              )}
              {listing.material_composition && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Composition</p>
                  <p className="font-bold font-heading text-sm">{listing.material_composition}</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold font-heading mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="listing-detail-description">{listing.description}</p>
            </div>
            
            {listing.certifications && listing.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-bold font-heading mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 text-sm">
              {listing.pickup_available && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Pickup Available
                </Badge>
              )}
              {listing.delivery_available && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Delivery Available
                </Badge>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Seller: <span className="font-semibold text-foreground">{listing.seller_name}</span>
              </p>
              {listing.seller_wallet && (
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Wallet: {listing.seller_wallet.substring(0, 10)}...{listing.seller_wallet.substring(32)}
                </p>
              )}
            </div>
            
            {isMine && !listing.ai_classification && (
              <Button 
                onClick={handleClassify} 
                disabled={classifying}
                className="w-full rounded-full"
                data-testid="classify-button"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {classifying ? "Analyzing..." : "Get AI Classification"}
              </Button>
            )}
          </div>
        </div>
        
        {listing.ai_classification && (
          <Card className="border-2 shadow-lg" data-testid="ai-classification-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                <Sparkles className="w-6 h-6 text-accent" />
                AI Classification Results
              </CardTitle>
              <CardDescription>Advanced analysis powered by GPT-4o</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Detailed Category</span>
                  <p className="font-bold font-heading text-lg">{listing.ai_classification.detailed_category || listing.ai_classification.category}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Recyclability Score</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chart-1 transition-all duration-500" 
                        style={{width: `${listing.ai_classification.recyclability_score}%`}}
                      />
                    </div>
                    <span className="font-bold font-heading text-chart-1">{listing.ai_classification.recyclability_score}/100</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Environmental Impact</span>
                  <p className="font-bold font-heading">{listing.ai_classification.co2_saved_per_kg} kg CO2 saved per kg</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Hazard Level</span>
                  <Badge variant={listing.ai_classification.hazard_level === "low" ? "default" : listing.ai_classification.hazard_level === "medium" ? "secondary" : "destructive"} className="mt-1">
                    {listing.ai_classification.hazard_level}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                {listing.ai_classification.market_value_indicator && (
                  <div>
                    <span className="text-sm text-muted-foreground">Market Value</span>
                    <p className="font-bold font-heading capitalize">{listing.ai_classification.market_value_indicator}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Potential Uses</span>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {listing.ai_classification.potential_uses?.map((use, idx) => (
                      <li key={idx} className="text-sm">{use}</li>
                    ))}
                  </ul>
                </div>
                {listing.ai_classification.processing_requirements && (
                  <div>
                    <span className="text-sm text-muted-foreground">Processing Requirements</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {listing.ai_classification.processing_requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{req}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  if (!analytics) return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;

  const COLORS = ['#1A4A38', '#22C55E', '#D4F860', '#C86A53', '#F4F5F4'];

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Badge variant="outline" className="mb-4">Advanced Analytics</Badge>
          <h1 className="text-4xl lg:text-6xl font-black font-heading text-primary mb-4" data-testid="analytics-title">
            Environmental Impact Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Track your contribution to sustainability with real-time data and insights
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" data-testid="analytics-co2">
            <div className="flex items-start justify-between mb-4">
              <Cloud className="w-10 h-10 text-chart-1" />
              <Badge variant="outline" className="text-xs">+12%</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">CO2 Saved</p>
            <p className="text-4xl font-black font-heading text-chart-1">{analytics.total_impact.co2_saved_kg}</p>
            <p className="text-xs text-muted-foreground mt-1">kilograms</p>
          </Card>
          
          <Card className="border-2 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" data-testid="analytics-items">
            <div className="flex items-start justify-between mb-4">
              <Recycle className="w-10 h-10 text-primary" />
              <Badge variant="outline" className="text-xs">+8%</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Items Recycled</p>
            <p className="text-4xl font-black font-heading text-primary">{analytics.total_impact.items_recycled}</p>
            <p className="text-xs text-muted-foreground mt-1">total items</p>
          </Card>
          
          <Card className="border-2 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" data-testid="analytics-waste">
            <div className="flex items-start justify-between mb-4">
              <Package className="w-10 h-10 text-accent" />
              <Badge variant="outline" className="text-xs">+15%</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Waste Diverted</p>
            <p className="text-4xl font-black font-heading text-accent">{analytics.total_impact.waste_diverted_kg}</p>
            <p className="text-xs text-muted-foreground mt-1">kilograms</p>
          </Card>
          
          <Card className="border-2 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" data-testid="analytics-trees">
            <div className="flex items-start justify-between mb-4">
              <TreeDeciduous className="w-10 h-10 text-chart-2" />
              <Badge variant="outline" className="text-xs">+8%</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Trees Saved</p>
            <p className="text-4xl font-black font-heading text-chart-2">{analytics.total_impact.trees_saved}</p>
            <p className="text-xs text-muted-foreground mt-1">equivalent</p>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Waste Saved Over Time</CardTitle>
              <CardDescription>Monthly tracking of environmental impact</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.monthly_stats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.monthly_stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" style={{fontSize: '12px'}} />
                    <YAxis stroke="#6B7280" style={{fontSize: '12px'}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px'}}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="waste_saved" stroke="#1A4A38" fill="#22C55E" fillOpacity={0.6} name="Waste Saved (kg)" />
                    <Area type="monotone" dataKey="co2_saved" stroke="#C86A53" fill="#D4F860" fillOpacity={0.4} name="CO2 Saved (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Waste Category Breakdown</CardTitle>
              <CardDescription>Distribution by material type</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.category_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.category_breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({category, percentage}) => `${category}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.category_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{backgroundColor: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '8px'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="py-12">
            <div className="text-center max-w-3xl mx-auto">
              <Leaf className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-black font-heading text-primary mb-4">
                Every Transaction Creates Impact
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your participation in EcoMarket contributes to a circular economy, reduces landfill waste, and helps combat climate change. Together, we're building a sustainable future.
              </p>
              <div className="grid grid-cols-3 gap-8 mt-8">
                <div>
                  <p className="text-3xl font-black font-heading text-chart-1 mb-1">
                    {((analytics.total_impact.co2_saved_kg / 1000) * 2.5).toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Cars off road (equivalent)</p>
                </div>
                <div>
                  <p className="text-3xl font-black font-heading text-primary mb-1">
                    {(analytics.total_impact.waste_diverted_kg / 50).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Landfills avoided</p>
                </div>
                <div>
                  <p className="text-3xl font-black font-heading text-chart-2 mb-1">
                    {(analytics.total_impact.trees_saved * 1.2).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Forests protected (acres)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/listing/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        </Routes>
        <AIChatbot />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};
