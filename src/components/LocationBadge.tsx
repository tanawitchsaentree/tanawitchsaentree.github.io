import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import profileData from '../data/profile_data_enhanced.json';

export default function LocationBadge() {
    const [time, setTime] = useState('');
    const { location } = profileData.identity;

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                timeZone: location.timezone_iana,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            setTime(now.toLocaleTimeString('en-US', options));
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                color: 'var(--foreground)',
            }}>
                <MapPin size={14} className="location-icon" />
                <span>{location.location_display}</span>
            </div>
            <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                marginTop: '2px',
            }}>
                {time}
            </div>
        </div>
    );
}
