import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Share2, Plus, Heart, Download, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
import StickyNote from '../components/StickyNote';
import CreateWishModal from '../components/CreateWishModal';
import ReadWishModal from '../components/ReadWishModal';
import BalloonAnimation from '../components/BalloonAnimation';
import StarryBackground from '../components/StarryBackground';
import Lantern from '../components/Lantern';

export default function WallPage() {
    const { wallId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [wall, setWall] = useState(null);
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedWish, setSelectedWish] = useState(null);
    const [triggerBalloons, setTriggerBalloons] = useState(false);
    const [readWishes, setReadWishes] = useState(() => {
        const saved = localStorage.getItem('readWishes');
        return saved ? JSON.parse(saved) : [];
    });

    // Synthesize pop sound using Web Audio API
    const playPopSound = () => {
        try {
            const audio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTSVMAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+UwaAAACExuYgAAAAC5iAAAAELmIAAAAAuYg==");
            audio.volume = 0.6;
            audio.play().catch(e => console.log('Audio error (interaction needed):', e));
        } catch (e) {
            console.error('Audio setup failed', e);
        }
    };

    // TEMPORARY: Add 5 dummy sticky notes for testing
    const dummyWishes = useMemo(() => [
        { id: '1', text: 'Happy New Year! May 2026 bring you joy!', sender: 'John', color: '#fecaca', rotation: -3 },
        { id: '2', text: 'Wishing you success in everything!', sender: 'Sarah', color: '#fef08a', rotation: 2 },
        { id: '3', text: 'Hope all your dreams come true!', sender: 'Mike', color: '#a7f3d0', rotation: -5 },
        { id: '4', text: 'Best wishes for the new year!', sender: 'Emma', color: '#fecaca', rotation: 4 },
        { id: '5', text: 'May this year be amazing!', sender: 'Alex', color: '#a7f3d0', rotation: -2 },
    ], []);

    useEffect(() => {
        if (!wallId) return;

        async function fetchWall() {
            const { data, error } = await supabase
                .from('walls')
                .select('*')
                .eq('id', wallId)
                .single();

            if (error) {
                console.error("Error fetching wall:", error);
                setWall(null);
            } else {
                setWall(data);
            }
            setLoading(false);
        }

        fetchWall();

        const channel = supabase
            .channel('public:wishes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'wishes',
                filter: `wall_id=eq.${wallId}`
            }, (payload) => {
                setWishes(prev => [payload.new, ...prev]);
            })
            .subscribe();

        supabase
            .from('wishes')
            .select('*')
            .eq('wall_id', wallId)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data) setWishes(data);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [wallId]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenWish = (wish) => {
        if (isOwner) {
            setSelectedWish(wish);

            try {
                playPopSound();
                import('canvas-confetti').then((confetti) => {
                    confetti.default({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#f472b6', '#34d399', '#fbbf24', '#60a5fa']
                    });
                });
            } catch (e) {
                console.log('Effect error:', e);
            }

            setTriggerBalloons(prev => !prev);

            if (!readWishes.includes(wish.id)) {
                const newReadWishes = [...readWishes, wish.id];
                setReadWishes(newReadWishes);
                localStorage.setItem('readWishes', JSON.stringify(newReadWishes));
            }
        }
    };

    const downloadWall = async () => {
        const wallElement = document.getElementById('cork-board');
        if (!wallElement) return;

        try {
            const canvas = await html2canvas(wallElement, {
                backgroundColor: '#1e1b4b', // Dark background for capture
                scale: 2,
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `my-wishing-wall-${new Date().getFullYear()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    // Memoize lanterns
    const lanterns = useMemo(() => [...Array(10)].map((_, i) => ({
        id: i,
        delay: Math.random() * 20,
        duration: Math.random() * 10 + 15,
        x: Math.random() * 100, // percentage
        scale: Math.random() * 0.5 + 0.5
    })), []);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a2a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    if (!wall) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 bg-[#0a0a2a]">
                <h2 className="text-4xl font-bold mb-4">Wall Not Found 😢</h2>
                <p className="text-gray-400 mb-8">This wishing wall doesn't exist.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const isOwner = user?.id === wall.owner_id;
    const isVisitor = !isOwner;

    // Logic: 
    // - If Owner: Show real wishes. If empty, show dummy wishes (Demo Mode).
    // - If Visitor: Show real wishes ONLY. If empty, show nothing (so they can add start).
    const finalDisplayWishes = wishes.length > 0 ? wishes : (isOwner ? dummyWishes : []);

    // Generate random positions (mobile-friendly)
    const getRandomPosition = (index) => {
        const positions = [
            { top: '10%', left: '10%' },
            { top: '15%', left: '40%' },
            { top: '12%', left: '70%' },
            { top: '35%', left: '15%' },
            { top: '30%', left: '55%' },
            { top: '40%', left: '80%' },
            { top: '60%', left: '20%' },
            { top: '55%', left: '60%' },
            { top: '65%', left: '85%' },
            { top: '80%', left: '30%' },
            { top: '75%', left: '70%' },
        ];
        return positions[index % positions.length];
    };

    return (
        <div className="relative min-h-screen overflow-hidden text-white selection:bg-amber-500/30 font-inter">
            <StarryBackground />

            {lanterns.map((l) => (
                <Lantern key={l.id} {...l} />
            ))}

            <BalloonAnimation trigger={triggerBalloons} />

            {/* In-App Browser Warning */}
            {navigator.userAgent.includes('Instagram') || navigator.userAgent.includes('FBAN') ? (
                <div className="bg-amber-500/90 text-black px-4 py-2 text-center text-sm font-medium backdrop-blur-sm z-50 sticky top-0">
                    ⚠️ For best experience, open in Chrome/Safari
                </div>
            ) : null}

            {/* Navbar / Header */}
            <div className="relative z-20 px-4 py-6 md:px-8 max-w-7xl mx-auto flex items-center justify-between">
                <div>
                    {isVisitor ? (
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Wishing Wall</h1>
                    ) : (
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">My Wishing Wall</h1>
                            <div className="flex items-center gap-3 text-xs md:text-sm text-purple-200/60 mt-1">
                                <span className="font-mono bg-white/5 px-2 py-0.5 rounded">ID: {wallId.slice(0, 8)}</span>
                                <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                                    <span>{wishes.length} wishes</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    {/* Home Button for everyone */}
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/80"
                        title="Go Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>

                    {/* Owner Actions */}
                    {isOwner && (
                        <>
                            <button
                                onClick={downloadWall}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium border border-white/10"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-500/90 rounded-xl transition-all shadow-lg shadow-emerald-900/20 text-sm font-medium"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">{copied ? "Copied!" : "Share Link"}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Wall Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
                <div
                    id="cork-board"
                    className="relative bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 min-h-[600px] md:min-h-[700px] shadow-2xl overflow-hidden mt-4"
                >
                    {/* Add Wish CTA Center - VISITOR ONLY */}
                    {isVisitor && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-0 pointer-events-none">
                            <div className="pointer-events-auto text-center">
                                <p className="text-xl md:text-2xl font-light text-white/80 mb-6 font-kalam tracking-wide">
                                    Every big year starts with a small wish.
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="group relative overflow-hidden rounded-xl p-[1px] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient-x" />
                                    <div className="relative px-8 py-4 bg-[#0a0a20] rounded-xl flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors duration-300">
                                        <Plus className="w-5 h-5 text-emerald-400 group-hover:text-white" />
                                        <span className="font-semibold text-white tracking-wide">Add a wish</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Sticky Notes */}
                    <div className="relative w-full h-full min-h-[600px]">
                        {finalDisplayWishes.map((wish, index) => {
                            const position = getRandomPosition(index);
                            return (
                                <div
                                    key={wish.id}
                                    className="absolute transition-transform hover:z-50"
                                    style={{
                                        top: position.top,
                                        left: position.left,
                                        width: '140px',
                                        height: '140px'
                                    }}
                                >
                                    <StickyNote
                                        text={wish.text}
                                        color={wish.color}
                                        sender={wish.sender}
                                        rotation={wish.rotation}
                                        isNew={!readWishes.includes(wish.id)}
                                        onClick={() => handleOpenWish(wish)}
                                    />
                                </div>
                            );
                        })}

                        {/* Empty State for Owner */}
                        {isOwner && finalDisplayWishes.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none text-center p-6">
                                <p className="text-lg">No wishes yet! 🎈</p>
                                <p className="text-sm mt-2 opacity-60">Share your link to start collecting wishes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateWishModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                wallId={wallId}
            />

            {/* Only owner can read wishes */}
            {isOwner && (
                <ReadWishModal
                    wish={selectedWish}
                    onClose={() => setSelectedWish(null)}
                />
            )}
        </div>
    );
}
