/**
 * UIController - The Body of the AI
 * Executes physical actions on the page
 */

export const UIController = {
    /**
     * Smooth scroll to a specific section ID
     */
    scrollTo: (elementId: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            // Check if mobile or desktop for offset
            const offset = window.innerWidth < 768 ? 60 : 80; // Header height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            return true;
        }
        return false;
    },

    /**
     * Download the CV/Resume
     */
    downloadCV: () => {
        // Create invisible link and click it
        const link = document.createElement('a');
        link.href = '/resume.pdf'; // Ensure this file exists in public/
        link.download = 'Tanawitch_Saentree_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    },

    /**
     * Switch Theme (Requires integration with ThemeProvider)
     * This acts as a signal dispatcher
     */
    dispatchThemeChange: (mode: 'light' | 'dark' | 'toggle') => {
        window.dispatchEvent(new CustomEvent('lumo-theme-change', { detail: { mode } }));
        return true;
    },

    /**
     * Open a modal (e.g. Contact, Project Details)
     */
    openModal: (modalId: string) => {
        // Dispatch event for React to handle
        window.dispatchEvent(new CustomEvent('lumo-open-modal', { detail: { modalId } }));
        return true;
    }
};
