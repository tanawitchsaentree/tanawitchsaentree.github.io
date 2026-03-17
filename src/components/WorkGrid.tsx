import '../index.css';
import workData from '../data/work_projects.json';

interface WorkGridProps {
    onOpenProject?: (projectId: string) => void;
}

export default function WorkGrid({ onOpenProject }: WorkGridProps) {
    return (
        <div id="work-grid" className="work-grid-container">
            <div className="work-grid">
                {workData.map((itemData) => {
                    const item = itemData as any;
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
                                aspectRatio: item.aspect ? item.aspect : undefined,
                                cursor: hasModal || item.link ? 'pointer' : 'default',
                            }}
                        >
                            {/* 1. Blurred Background Layer */}
                            {item.image.endsWith('.mp4') ? (
                                <video
                                    src={item.image}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    style={{
                                        position: 'absolute',
                                        top: -1, left: -1, right: -1, bottom: -1,
                                        width: 'calc(100% + 2px)',
                                        height: 'calc(100% + 2px)',
                                        objectFit: 'cover',
                                        filter: 'blur(20px) brightness(0.6)',
                                        transform: 'scale(1.1)',
                                        zIndex: 0,
                                        pointerEvents: 'none',
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: -1, left: -1, right: -1, bottom: -1,
                                        width: 'calc(100% + 2px)',
                                        height: 'calc(100% + 2px)',
                                        backgroundImage: `url(${item.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        filter: 'blur(20px) brightness(0.7)',
                                        transform: 'scale(1.1)',
                                        zIndex: 0,
                                    }}
                                />
                            )}

                            {/* 2. Main Media Layer */}
                            {item.image.endsWith('.mp4') ? (
                                <video
                                    src={item.image}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    style={{
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                        zIndex: 1,
                                        pointerEvents: 'none',
                                    }}
                                />
                            ) : (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                        zIndex: 1,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                />
                            )}

                            {/* 3. Overlay */}
                            <div className="work-item-overlay" style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.6)',
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                zIndex: 2,
                            }} />

                            {/* 4. Content label */}
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
