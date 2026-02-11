import '../index.css';
import workData from '../data/work_projects.json';

export default function WorkGrid() {
    return (
        <div className="work-grid-container">
            <div className="work-grid">
                {workData.map((itemData) => {
                    // Default to 'cover' if not specified, but 'contain' can be used for "no matter size" logic
                    // Actually, let's make the "Smart Fit" the default for large banners if they seem complex, 
                    // but for now we follow the user's desire for a "Good Ratio" handler.

                    // We will implement the "Blurred Background" technique for ALL items 
                    // This ensures that even if 'contain' is used, it looks good.

                    // We will implement the "Blurred Background" technique for ALL items 
                    // This ensures that even if 'contain' is used, it looks good.

                    const item = itemData as any; // Cast to access flexible properties
                    // If the user wants to see the whole image "no matter size", they should ideally use 'contain' 
                    // BUT 'contain' usually leaves ugly whitespace.
                    // The blurred background fixes that whitespace.

                    return (
                        <a
                            key={item.id}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`work-item work-item-${item.size}`}
                            aria-label={`View project: ${item.title}`}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                aspectRatio: item.aspect ? item.aspect : undefined // Allow JSON to override CSS ratio
                            }}
                        >
                            {/* 1. Blurred Background Layer (Fills the box) */}
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
                                        objectFit: 'cover', // Always cover for background
                                        filter: 'blur(20px) brightness(0.6)',
                                        transform: 'scale(1.1)',
                                        zIndex: 0,
                                        pointerEvents: 'none'
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
                                        transform: 'scale(1.1)', // Prevent blur edges
                                        zIndex: 0
                                    }}
                                />
                            )}

                            {/* 2. Main Media Layer (The content) */}
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
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover', // Force full bleed
                                        objectPosition: 'center', // Always center
                                        zIndex: 1,
                                        pointerEvents: 'none' // Let clicks pass through to link
                                    }}
                                />
                            ) : (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover', // Force full bleed
                                        objectPosition: 'center', // Always center
                                        zIndex: 1,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />
                            )}

                            {/* 3. Overlay & Content (On Top) */}
                            <div className="work-item-overlay" style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.6)',
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                zIndex: 2
                            }} />
                            <div className="work-item-content">
                                <span className="work-item-title" style={{ color: 'white', fontWeight: 'bold', display: 'block' }}>{item.title}</span>
                                <span className="work-item-type" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9em' }}>{item.type}</span>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
