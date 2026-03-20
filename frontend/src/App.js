import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
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
import { Recycle, Factory, Leaf, TrendingUp, Upload, Search, MapPin, DollarSign, Package, Sparkles, BarChart3, TreeDeciduous, Cloud } from "lucide-react";
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
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    } finally {
      setLoading(false);
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
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <Recycle className="w-8 h-8 text-primary" />
            <span className="text-2xl font-black font-heading tracking-tight text-primary">EcoMarket</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" data-testid="nav-dashboard">
                  <Button variant="ghost" className="transition-transform duration-200 hover:scale-105">Dashboard</Button>
                </Link>
                <Link to="/marketplace" data-testid="nav-marketplace">
                  <Button variant="ghost" className="transition-transform duration-200 hover:scale-105">Marketplace</Button>
                </Link>
                <Link to="/impact" data-testid="nav-impact">
                  <Button variant="ghost" className="transition-transform duration-200 hover:scale-105">Impact</Button>
                </Link>
                <Button 
                  onClick={logout} 
                  variant="outline"
                  className="transition-transform duration-200 hover:scale-105"
                  data-testid="logout-button"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" data-testid="nav-auth">
                  <Button className="rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105">Get Started</Button>
                </Link>
              </>
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
    if (user) navigate("/dashboard");
  }, [user]);

  return (
    <div className="min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.pexels.com/photos/36397860/pexels-photo-36397860.jpeg" 
            alt="Industrial recycling" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-black font-heading text-primary tracking-tight leading-tight mb-6" data-testid="hero-title">
              Transform Waste Into Worth
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect industries, recyclers, and farmers on a sustainable marketplace. Buy and sell industrial waste materials and crop residue for a cleaner, greener future.
            </p>
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg" 
              className="rounded-full bg-primary hover:bg-primary/90 text-lg px-8 py-6 transition-all duration-200 hover:scale-105 shadow-lg"
              data-testid="hero-cta-button"
            >
              Start Trading
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-black font-heading text-center mb-16 text-primary">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" data-testid="feature-card-1">
              <CardHeader>
                <Factory className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl font-heading">List Your Waste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Industries and farmers can easily list their waste materials with photos, quantities, and pricing.</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" data-testid="feature-card-2">
              <CardHeader>
                <Sparkles className="w-12 h-12 text-accent mb-4" />
                <CardTitle className="text-2xl font-heading">AI Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Our AI analyzes waste materials to determine recyclability, potential uses, and environmental impact.</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" data-testid="feature-card-3">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-chart-2 mb-4" />
                <CardTitle className="text-2xl font-heading">Track Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Monitor CO2 savings, recycling stats, and your contribution to a sustainable future.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.pexels.com/photos/916406/pexels-photo-916406.jpeg" 
                alt="Farmer with crops" 
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-black font-heading mb-6 text-primary">For Every Role</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Factory className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Industries</h3>
                    <p className="text-muted-foreground">Turn industrial waste into revenue while meeting sustainability goals.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Recycle className="w-8 h-8 text-chart-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Recyclers</h3>
                    <p className="text-muted-foreground">Access quality recyclable materials from verified sources.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Leaf className="w-8 h-8 text-accent flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Farmers</h3>
                    <p className="text-muted-foreground">Monetize crop residue and contribute to circular economy.</p>
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
    role: "industry",
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
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-muted/20">
      <Card className="w-full max-w-md border-2 shadow-lg" data-testid="auth-card">
        <CardHeader>
          <CardTitle className="text-3xl font-black font-heading text-center">{isLogin ? "Welcome Back" : "Join EcoMarket"}</CardTitle>
          <CardDescription className="text-center">Start trading for a sustainable future</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    data-testid="auth-name-input"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required={!isLogin}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                    <SelectTrigger data-testid="auth-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="industry">Industry</SelectItem>
                      <SelectItem value="recycler">Recycler</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="seller">Seller / Farmer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name (Optional)</Label>
                  <Input 
                    id="company_name" 
                    data-testid="auth-company-input"
                    value={formData.company_name} 
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    data-testid="auth-location-input"
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                data-testid="auth-email-input"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                data-testid="auth-password-input"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full" data-testid="auth-submit-button">
              {isLogin ? "Login" : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            data-testid="auth-toggle-button"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [impact, setImpact] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyListings();
    fetchImpact();
  }, []);

  const fetchMyListings = async () => {
    try {
      const response = await axios.get(`${API}/listings/my`);
      setMyListings(response.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  const fetchImpact = async () => {
    try {
      const response = await axios.get(`${API}/impact`);
      setImpact(response.data);
    } catch (error) {
      console.error("Failed to fetch impact", error);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-primary mb-2" data-testid="dashboard-title">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Role: <Badge variant="outline" className="ml-2">{user?.role}</Badge></p>
        </div>

        {impact && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="border-2" data-testid="impact-card-co2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">CO2 Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-heading text-chart-1">{impact.co2_saved_kg} kg</div>
              </CardContent>
            </Card>
            <Card className="border-2" data-testid="impact-card-items">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Items Recycled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-heading text-primary">{impact.items_recycled}</div>
              </CardContent>
            </Card>
            <Card className="border-2" data-testid="impact-card-waste">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Waste Diverted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-heading text-accent">{impact.waste_diverted_kg} kg</div>
              </CardContent>
            </Card>
            <Card className="border-2" data-testid="impact-card-trees">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trees Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-heading text-chart-2">{impact.trees_saved}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black font-heading text-primary">My Listings</h2>
          <Button 
            onClick={() => navigate("/create-listing")} 
            className="rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
            data-testid="create-listing-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </div>

        {myListings.length === 0 ? (
          <Card className="border-2" data-testid="no-listings-card">
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">You haven't created any listings yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((listing) => (
              <Card key={listing.id} className="border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer" onClick={() => navigate(`/listing/${listing.id}`)} data-testid={`listing-card-${listing.id}`}>
                {listing.images.length > 0 && (
                  <img 
                    src={`${API}/files/${listing.images[0]}?auth=${localStorage.getItem("token")}`} 
                    alt={listing.title} 
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <CardTitle className="font-heading">{listing.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{listing.waste_type}</Badge>
                    <span className="text-lg font-bold text-primary">${listing.price}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {listing.quantity} {listing.unit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [search, filterType]);

  const fetchListings = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterType) params.waste_type = filterType;
      const response = await axios.get(`${API}/listings`, { params });
      setListings(response.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-black font-heading text-primary mb-8" data-testid="marketplace-title">Marketplace</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No listings found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card 
                key={listing.id} 
                className="border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer" 
                onClick={() => navigate(`/listing/${listing.id}`)}
                data-testid={`marketplace-listing-card-${listing.id}`}
              >
                {listing.images.length > 0 && (
                  <img 
                    src={`${API}/files/${listing.images[0]}?auth=${localStorage.getItem("token")}`} 
                    alt={listing.title} 
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-heading flex-1">{listing.title}</CardTitle>
                    <Badge 
                      variant={listing.status === "available" ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{listing.waste_type}</Badge>
                      <span className="text-xl font-black font-heading text-primary">${listing.price}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {listing.quantity} {listing.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {listing.location}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Seller: {listing.seller_name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
    price: "",
    location: "",
    images: []
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
        const response = await axios.post(`${API}/upload`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
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
      const response = await axios.post(`${API}/listings`, {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price)
      });
      toast.success("Listing created successfully");
      navigate(`/listing/${response.data.id}`);
    } catch (error) {
      toast.error("Failed to create listing");
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-black font-heading text-primary mb-8" data-testid="create-listing-title">Create Listing</h1>
        
        <Card className="border-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  data-testid="listing-title-input"
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  data-testid="listing-description-input"
                  rows={4}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waste_type">Waste Type</Label>
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
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    data-testid="listing-location-input"
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    step="0.01"
                    data-testid="listing-quantity-input"
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit</Label>
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
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    data-testid="listing-price-input"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="images">Images</Label>
                <Input 
                  id="images" 
                  type="file" 
                  accept="image/*" 
                  multiple
                  data-testid="listing-image-input"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {formData.images.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {formData.images.map((img, idx) => (
                      <img key={idx} src={`${API}/files/${img}?auth=${localStorage.getItem("token")}`} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full rounded-full" data-testid="listing-submit-button">
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

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
          data-testid="back-button"
        >
          ← Back
        </Button>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            {listing.images.length > 0 ? (
              <img 
                src={`${API}/files/${listing.images[0]}?auth=${localStorage.getItem("token")}`} 
                alt={listing.title} 
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                data-testid="listing-detail-image"
              />
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-black font-heading text-primary" data-testid="listing-detail-title">{listing.title}</h1>
              <Badge variant={listing.status === "available" ? "default" : "secondary"}>{listing.status}</Badge>
            </div>
            
            <div className="text-3xl font-black font-heading text-primary mb-6">${listing.price}</div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="w-5 h-5" />
                <span>{listing.quantity} {listing.unit}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>{listing.location}</span>
              </div>
              <div>
                <Badge variant="outline">{listing.waste_type}</Badge>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-xl font-bold font-heading mb-2">Description</h3>
              <p className="text-muted-foreground" data-testid="listing-detail-description">{listing.description}</p>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">Seller: <span className="font-semibold">{listing.seller_name}</span></p>
            </div>
            
            {user && listing.seller_id === user.id && !listing.ai_classification && (
              <Button 
                onClick={handleClassify} 
                disabled={classifying}
                className="mt-6 rounded-full w-full"
                data-testid="classify-button"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {classifying ? "Classifying..." : "Get AI Classification"}
              </Button>
            )}
          </div>
        </div>
        
        {listing.ai_classification && (
          <Card className="mt-8 border-2" data-testid="ai-classification-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Sparkles className="w-6 h-6 text-accent" />
                AI Classification Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Category:</span>
                <p className="font-semibold">{listing.ai_classification.category}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Recyclability Score:</span>
                <p className="font-semibold text-chart-1">{listing.ai_classification.recyclability_score}/100</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Hazard Level:</span>
                <Badge variant={listing.ai_classification.hazard_level === "low" ? "default" : "destructive"}>
                  {listing.ai_classification.hazard_level}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">CO2 Saved per kg:</span>
                <p className="font-semibold">{listing.ai_classification.co2_saved_per_kg} kg</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Potential Uses:</span>
                <ul className="list-disc list-inside">
                  {listing.ai_classification.potential_uses?.map((use, idx) => (
                    <li key={idx}>{use}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const ImpactTracker = () => {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    fetchImpact();
  }, []);

  const fetchImpact = async () => {
    try {
      const response = await axios.get(`${API}/impact`);
      setImpact(response.data);
    } catch (error) {
      console.error("Failed to fetch impact", error);
    }
  };

  if (!impact) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-primary mb-4" data-testid="impact-title">Environmental Impact</h1>
          <p className="text-lg text-muted-foreground">Track the positive impact of our marketplace on the environment</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 p-8" data-testid="impact-detail-co2">
            <Cloud className="w-12 h-12 text-chart-1 mb-4" />
            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">CO2 Saved</CardTitle>
            <div className="text-5xl font-black font-heading text-chart-1 mb-2">{impact.co2_saved_kg}</div>
            <div className="text-muted-foreground">kilograms</div>
          </Card>
          
          <Card className="border-2 p-8" data-testid="impact-detail-items">
            <Recycle className="w-12 h-12 text-primary mb-4" />
            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">Items Recycled</CardTitle>
            <div className="text-5xl font-black font-heading text-primary mb-2">{impact.items_recycled}</div>
            <div className="text-muted-foreground">total items</div>
          </Card>
          
          <Card className="border-2 p-8" data-testid="impact-detail-waste">
            <Package className="w-12 h-12 text-accent mb-4" />
            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">Waste Diverted</CardTitle>
            <div className="text-5xl font-black font-heading text-accent mb-2">{impact.waste_diverted_kg}</div>
            <div className="text-muted-foreground">kilograms</div>
          </Card>
          
          <Card className="border-2 p-8" data-testid="impact-detail-trees">
            <TreeDeciduous className="w-12 h-12 text-chart-2 mb-4" />
            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">Trees Saved</CardTitle>
            <div className="text-5xl font-black font-heading text-chart-2 mb-2">{impact.trees_saved}</div>
            <div className="text-muted-foreground">equivalent</div>
          </Card>
        </div>
        
        <div className="relative rounded-lg overflow-hidden h-96">
          <img 
            src="https://images.pexels.com/photos/109391/pexels-photo-109391.jpeg" 
            alt="Forest landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white px-6">
              <h2 className="text-4xl font-black font-heading mb-4">Every Transaction Makes a Difference</h2>
              <p className="text-lg">Together, we're building a sustainable future through waste reduction and recycling.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  
  return children;
};

const { useParams } = require("react-router-dom");

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/listing/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
          <Route path="/impact" element={<ProtectedRoute><ImpactTracker /></ProtectedRoute>} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
