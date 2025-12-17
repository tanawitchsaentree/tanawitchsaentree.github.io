import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export default function LocationBadge() {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            // Force Bangkok Time (GMT+7)
            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Asia/Bangkok',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            setTime(now.toLocaleTimeString('en-US', options));
        };

        updateTime();
        const interval = setInterval(updateTime, 10000); // Update every 10s is enough

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="location-badge" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
        }}>
            {/* Location Row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                color: 'var(--foreground)',
            }}>
                <MapPin size={14} className="location-icon" />
                <span>Bangkok, THA</span>
            </div>

            {/* Details Row */}
            <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                marginTop: '2px', // Micro spacing
            }}>
                {time} • 32°C
            </div>
        </div>
    );
}
