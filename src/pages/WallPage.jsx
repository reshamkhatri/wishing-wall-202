import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Share2, Plus, Sparkles } from 'lucide-react';
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
        // Only owner can read wishes
        if (isOwner) {
            setSelectedWish(wish);
            setTriggerBalloons(prev => !prev);
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

    // Generate random positions for sticky notes
    const getRandomPosition = (index) => {
        const positions = [
            { top: '8%', left: '12%' },
            { top: '5%', left: '35%' },
            { top: '10%', left: '58%' },
            { top: '25%', left: '8%' },
            { top: '22%', left: '28%' },
            { top: '28%', left: '48%' },
            { top: '20%', left: '72%' },
            { top: '45%', left: '15%' },
            { top: '42%', left: '38%' },
            { top: '48%', left: '62%' },
            { top: '65%', left: '10%' },
            { top: '68%', left: '32%' },
            { top: '62%', left: '52%' },
            { top: '70%', left: '75%' },
            { top: '85%', left: '20%' },
            { top: '82%', left: '45%' },
        ];
        return positions[index % positions.length];
    };

    return (
        <div className="min-h-screen p-6 pb-32">
            <BalloonAnimation trigger={triggerBalloons} />

            {/* Header - Only show for owner */}
            {isOwner && (
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                                My Wishing Wall
                            </h1>
                            <p className="text-sm text-gray-500 font-mono">
                                ID: {wallId.slice(0, 8)}
                            </p>
                        </div>

                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 px-5 py-3 btn-primary rounded-xl transition-all duration-300 text-sm font-semibold"
                        >
                            <Share2 className="w-4 h-4" />
                            {copied ? "Copied!" : "Share to your friend"}
                        </button>
                    </div>
                </div>
            )}

            {/* Cork Board */}
            <div className="max-w-7xl mx-auto">
                <div className="relative bg-gray-200 rounded-3xl p-8 min-h-[600px] shadow-2xl">
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
                                        width: '140px',
                                        height: '140px'
                                    }}
                                >
                                    <StickyNote
                                        text={wish.text}
                                        color={wish.color}
                                        sender={wish.sender}
                                        rotation={wish.rotation}
                                        onClick={() => handleOpenWish(wish)}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-hand text-gray-400 mb-2">No wishes yet! 🎈</p>
                            <p className="text-gray-500">
                                {isOwner ? "Share your link to start collecting wishes!" : "Be the first to add a wish!"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Visitor CTA - Only show for non-owners */}
            {!isOwner && (
                <div className="max-w-7xl mx-auto mt-8">
                    <div className="glass-card rounded-3xl p-8 text-center">
                        <Sparkles className="w-12 h-12 text-accent-green mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Want your own wishing wall?
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Create your wall and collect wishes from friends!
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="btn-primary px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
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
                    className="fixed bottom-8 right-8 w-16 h-16 btn-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 z-40"
                >
                    <Plus className="w-8 h-8 text-white" strokeWidth={3} />
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
