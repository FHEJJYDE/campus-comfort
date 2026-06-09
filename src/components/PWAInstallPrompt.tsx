import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { showInstallPrompt } from '@/lib/pwa';

const PWAInstallPrompt = () => {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handler = (e: Event) => {
            // This event fires when the PWA is installable
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler as EventListener);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler as EventListener);
        };
    }, []);

    const handleInstallClick = () => {
        showInstallPrompt();
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isInstallable || !isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 z-50">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Install Tonys Estate App</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="p-1 h-auto"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Install our app for a better experience with offline access and push notifications.
            </p>
            <Button
                onClick={handleInstallClick}
                className="w-full flex items-center gap-2"
            >
                <Download className="h-4 w-4" />
                Install App
            </Button>
        </div>
    );
};

export default PWAInstallPrompt;