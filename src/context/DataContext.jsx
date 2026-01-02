import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const INITIAL_NEWS = [
    {
        id: 1,
        date: "02",
        month: "DEC",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b955?q=80&w=2670&auto=format&fit=crop",
        title: "Payments for summer 2024 (Germany)",
        desc: "Learn more about the tuition fees."
    },
    // ... items kept for brevity, will persist user's data
];

const INITIAL_INQUIRIES = [
    { id: 1, name: "John Doe", email: "john@example.com", subject: "Admissions", message: "Hello, I am interested in...", date: "2024-03-10", status: "new" },
    { id: 2, name: "Jane Smith", email: "jane@test.com", subject: "General", message: "Do you have a library?", date: "2024-03-12", status: "read" },
    { id: 3, name: "Robert Wilson", email: "robert@tech.com", subject: "Partnership", message: "We want to partner with your CS dept.", date: "2024-03-14", status: "new" }
];

export const DataProvider = ({ children }) => {
    // Initialize State from LocalStorage or Defaults
    const [news, setNews] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('site_news');
            return saved ? JSON.parse(saved) : INITIAL_NEWS;
        }
        return INITIAL_NEWS;
    });

    const [inquiries, setInquiries] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('site_inquiries');
            return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
        }
        return INITIAL_INQUIRIES;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_auth') === 'true';
        }
        return false;
    });

    // Derived Stats (Calculated on every render, cheap)
    const stats = {
        totalNews: news.length,
        totalInquiries: inquiries.length,
        pendingInquiries: inquiries.filter(i => i.status === 'new').length,
        totalStudents: 15234, // Mock
        trafficChange: '+12%' // Mock
    };

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('site_news', JSON.stringify(news));
    }, [news]);

    useEffect(() => {
        localStorage.setItem('site_inquiries', JSON.stringify(inquiries));
    }, [inquiries]);

    useEffect(() => {
        localStorage.setItem('admin_auth', isAuthenticated);
    }, [isAuthenticated]);

    // Actions
    const login = (password) => {
        if (password === 'admin123') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => setIsAuthenticated(false);

    const addNews = (item) => {
        setNews(prev => [...prev, { ...item, id: Date.now() }]);
    };

    const deleteNews = (id) => {
        setNews(prev => prev.filter(n => n.id !== id));
    };

    const addInquiry = (inquiry) => {
        setInquiries(prev => [...prev, { ...inquiry, id: Date.now(), date: new Date().toISOString().split('T')[0], status: 'new' }]);
    };

    // NEW ACTIONS
    const deleteInquiry = (id) => {
        setInquiries(prev => prev.filter(i => i.id !== id));
    };

    const markInquiryAsRead = (id) => {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i));
    };

    return (
        <DataContext.Provider value={{
            news,
            inquiries,
            stats,
            isAuthenticated,
            login,
            logout,
            addNews,
            deleteNews,
            addInquiry,
            deleteInquiry,
            markInquiryAsRead
        }}>
            {children}
        </DataContext.Provider>
    );
};
