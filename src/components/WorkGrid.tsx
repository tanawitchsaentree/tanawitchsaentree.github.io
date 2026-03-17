import { useEffect, useRef } from 'react';
import '../index.css';
import workData from '../data/work_projects.json';

interface WorkGridProps {
    onOpenProject?: (projectId: string) => void;
}

export default function WorkGrid({ onOpenProject }: WorkGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    // Lazy-load videos: set src only when card enters viewport
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const card = entry.target as HTMLElement;
                    card.querySelectorAll<HTMLVideoElement>('video[data-src]').forEach(video => {
                        video.src = video.dataset.src!;
                        video.play().catch(() => {});
                    });
                    observer.unobserve(card);
                });
            },
            { rootMargin: '200px' }
        );

        grid.querySelectorAll<HTMLElement>('.work-item').forEach(card => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <div id="work-grid" className="work-grid-container">
            <div className="work-grid" ref={gridRef}>
                {workData.map((itemData) => {
                    const item = itemData as any;
                    const isVideo = item.image.endsWith('.mp4');
                    const hasModal = !!item.projectId;

                    const handleClick = () => {
                        if (hasModal && onOpenProject) {
                            onOpenProject(item.projectId);
                        } else if (item.link) {
                            window.open(item.link, '_blank', 'noopener,noreferrer');
                        }
                    };

                    return (
                        <div
                            key={item.id}
                            className={`work-item work-item-${item.size}`}
                            aria-label={`Project: ${item.title}`}
                            role="button"
                            tabIndex={0}
                            onClick={handleClick}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                aspectRatio: item.aspect ?? undefined,
                                cursor: hasModal || item.link ? 'pointer' : 'default',
                                background: '#000',
                            }}
                        >
                            {/* Background layer:
                                - Video items: solid dark bg (no duplicate video = half the requests)
                                - Image items: blurred CSS background (no extra request) */}
                            {!isVideo && (
                                <div style={{
                                    position: 'absolute',
                                    inset: '-2px',
                                    backgroundImage: `url(${item.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'blur(20px) brightness(0.7)',
                                    transform: 'scale(1.1)',
                                    zIndex: 0,
                                }} />
                            )}

                            {/* Main media */}
                            {isVideo ? (
                                <video
                                    data-src={item.image}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="none"
                                    style={{
                                        display: 'block',
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        zIndex: 1,
                                        pointerEvents: 'none',
                                    }}
                                />
                            ) : (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    loading="lazy"
                                    style={{
                                        display: 'block',
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        zIndex: 1,
                                        pointerEvents: 'none',
                                    }}
                                />
                            )}

                            {/* Hover overlay */}
                            <div className="work-item-overlay" style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.55)',
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                zIndex: 2,
                            }} />

                            {/* Label */}
                            <div className="work-item-content">
                                <span className="work-item-title" style={{ color: 'white', fontWeight: 'bold', display: 'block' }}>
                                    {item.title}
                                </span>
                                <span className="work-item-type" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9em' }}>
                                    {item.type}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
