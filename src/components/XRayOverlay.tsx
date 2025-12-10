import { useState, useEffect } from 'react';

interface SectionInfo {
    name: string;
    element: HTMLElement;
    rect: DOMRect;
    spacing: {
        padding?: string;
        margin?: string;
        gap?: string;
    };
}

export default function XRayOverlay() {
    const [sections, setSections] = useState<SectionInfo[]>([]);

    useEffect(() => {
        const updateSections = () => {
            const sectionSelectors = [
                { name: 'Main Content', selector: '.main-content' },
                { name: 'Profile Section', selector: '.profile-section' },
                { name: 'Chat Section', selector: '.chat-section' },
                { name: 'Bio Section', selector: '.bio-section' },
                { name: 'Profile Header', selector: '.profile-header' },
                { name: 'Experience Section', selector: '.experience-section' },
            ];

            const sectionsData: SectionInfo[] = [];

            sectionSelectors.forEach(({ name, selector }) => {
                const element = document.querySelector(selector) as HTMLElement;
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const styles = window.getComputedStyle(element);

                    sectionsData.push({
                        name,
                        element,
                        rect,
                        spacing: {
                            padding: styles.padding !== '0px' ? styles.padding : undefined,
                            margin: styles.margin !== '0px' ? styles.margin : undefined,
                            gap: styles.gap !== 'normal' && styles.gap !== '0px' ? styles.gap : undefined,
                        },
                    });
                }
            });

            setSections(sectionsData);
        };

        updateSections();
        window.addEventListener('resize', updateSections);
        window.addEventListener('scroll', updateSections);

        return () => {
            window.removeEventListener('resize', updateSections);
            window.removeEventListener('scroll', updateSections);
        };
    }, []);

    return (
        <div className="xray-overlay">
            {sections.map((section, index) => (
                <div
                    key={index}
                    className="xray-section"
                    style={{
                        left: `${section.rect.left}px`,
                        top: `${section.rect.top + window.scrollY}px`,
                        width: `${section.rect.width}px`,
                        height: `${section.rect.height}px`,
                    }}
                >
                    <div className="xray-label">
                        {/* {section.name} removed as requested */}
                        {section.spacing.padding && (
                            <div className="xray-label-value">p:{section.spacing.padding}</div>
                        )}
                        {section.spacing.margin && (
                            <div className="xray-label-value">m: {section.spacing.margin}</div>
                        )}
                        {section.spacing.gap && (
                            <div className="xray-label-value">gap: {section.spacing.gap}</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
