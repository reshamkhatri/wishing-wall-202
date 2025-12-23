import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Share2, Plus, Sparkles, Heart, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import StickyNote from '../components/StickyNote';
import CreateWishModal from '../components/CreateWishModal';
import ReadWishModal from '../components/ReadWishModal';
import BalloonAnimation from '../components/BalloonAnimation';

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

    // Synthesize pop sound using Web Audio API (no network needed)
    const playPopSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    // TEMPORARY: Add 5 dummy sticky notes for testing
    const dummyWishes = [
        { id: '1', text: 'Happy New Year! May 2026 bring you joy!', sender: 'John', color: '#fecaca', rotation: -3 },
        { id: '2', text: 'Wishing you success in everything!', sender: 'Sarah', color: '#fef08a', rotation: 2 },
        { id: '3', text: 'Hope all your dreams come true!', sender: 'Mike', color: '#a7f3d0', rotation: -5 },
        { id: '4', text: 'Best wishes for the new year!', sender: 'Emma', color: '#fecaca', rotation: 4 },
        { id: '5', text: 'May this year be amazing!', sender: 'Alex', color: '#a7f3d0', rotation: -2 },
    ];

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
            playPopSound();
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f472b6', '#34d399', '#fbbf24', '#60a5fa']
            });
            setSelectedWish(wish);
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
                backgroundColor: '#e5e7eb',
                scale: 2
            });

            const link = document.createElement('a');
            link.download = `my-wishing-wall-${new Date().getFullYear()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-green"></div>
            </div>
        );
    }

    if (!wall) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
                <h2 className="text-4xl font-bold mb-4">Wall Not Found 😢</h2>
                <p className="text-gray-400">This wishing wall doesn't exist.</p>
            </div>
        );
    }

    const isOwner = user?.id === wall.owner_id;

    // Use dummy wishes for testing, or real wishes if they exist
    const displayWishes = wishes.length > 0 ? wishes : dummyWishes;

    // Generate random positions for sticky notes (mobile-friendly)
    const getRandomPosition = (index) => {
        const positions = [
            { top: '5%', left: '8%' },
            { top: '8%', left: '45%' },
            { top: '18%', left: '15%' },
            { top: '20%', left: '60%' },
            { top: '32%', left: '10%' },
            { top: '35%', left: '52%' },
            { top: '48%', left: '18%' },
            { top: '50%', left: '58%' },
            { top: '62%', left: '12%' },
            { top: '65%', left: '55%' },
            { top: '78%', left: '20%' },
            { top: '80%', left: '50%' },
        ];
        return positions[index % positions.length];
    };

    return (
        <div className="min-h-screen p-4 md:p-6 pb-32">
            <BalloonAnimation trigger={triggerBalloons} />

            {/* In-App Browser Warning */}
            {navigator.userAgent.includes('Instagram') || navigator.userAgent.includes('FBAN') ? (
                <div className="bg-yellow-500/90 text-black px-4 py-2 text-center text-sm font-medium backdrop-blur-sm z-50 sticky top-0">
                    ⚠️ For the best experience (sound & downloads), tap ••• and "Open in Chrome/Safari"
                </div>
            ) : null}

            {/* Header - Only show for owner */}
            {isOwner && (
                <div className="max-w-7xl mx-auto mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                                My Wishing Wall
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span className="font-mono">ID: {wallId.slice(0, 8)}</span>
                                <span className="flex items-center gap-1">
                                    <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                                    <span className="font-semibold">{displayWishes.length} wishes</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={downloadWall}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-sm font-semibold border border-white/10"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </button>

                            <button
                                onClick={handleCopyLink}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 btn-primary rounded-xl transition-all duration-300 text-sm font-semibold"
                            >
                                <Share2 className="w-4 h-4" />
                                {copied ? "Copied!" : "Share"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cork Board */}
            <div className="max-w-7xl mx-auto">
                <div id="cork-board" className="relative bg-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-8 min-h-[500px] md:min-h-[600px] shadow-2xl overflow-hidden">
                    {/* Everyone sees sticky notes */}
                    {displayWishes.length > 0 ? (
                        displayWishes.map((wish, index) => {
                            const position = getRandomPosition(index);
                            return (
                                <div
                                    key={wish.id}
                                    className="absolute"
                                    style={{
                                        top: position.top,
                                        left: position.left,
                                        width: '100px',  // Smaller for mobile
                                        height: '100px'
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
                        })
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <p className="text-xl md:text-2xl font-hand text-gray-400 mb-2 text-center">No wishes yet! 🎈</p>
                            <p className="text-sm md:text-base text-gray-500 text-center">
                                {isOwner ? "Share your link to start collecting wishes!" : "Be the first to add a wish!"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Visitor CTA - Only show for non-owners */}
            {!isOwner && (
                <div className="max-w-7xl mx-auto mt-6 md:mt-8">
                    <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-8 text-center">
                        <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-accent-green mx-auto mb-4" />
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            Want your own wishing wall?
                        </h3>
                        <p className="text-sm md:text-base text-gray-400 mb-6">
                            Create your wall and collect wishes from friends!
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full md:w-auto btn-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                        >
                            Create Your Own Wishing Wall
                        </button>
                    </div>
                </div>
            )}

            {/* FAB - Only visible for visitors */}
            {!isOwner && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 btn-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 z-40"
                >
                    <Plus className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={3} />
                </button>
            )}

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
