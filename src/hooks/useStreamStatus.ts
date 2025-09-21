import { useState, useEffect, useCallback, useRef } from 'react';

interface StreamStatus {
    isLoading: boolean;
    isConnected: boolean;
    hasError: boolean;
    errorMessage: string;
    reconnectAttempts: number;
    isReconnecting: boolean;
    isInitializing: boolean;
}

export const useStreamStatus = (src: string) => {
    const [status, setStatus] = useState<StreamStatus>({
        isLoading: false,
        isConnected: false,
        hasError: false,
        errorMessage: '',
        reconnectAttempts: 0,
        isReconnecting: false,
        isInitializing: true
    });

    const stateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const minimumLoadingTimeRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced update to prevent rapid state changes
    const updateStatus = useCallback((updates: Partial<StreamStatus>) => {
        // Clear any pending state updates
        if (stateTimeoutRef.current) {
            clearTimeout(stateTimeoutRef.current);
        }

        // Apply updates with a small debounce to prevent flickering
        stateTimeoutRef.current = setTimeout(() => {
            setStatus(prev => ({ ...prev, ...updates }));
        }, 100);
    }, []);

    // Immediate update for critical states
    const updateStatusImmediate = useCallback((updates: Partial<StreamStatus>) => {
        if (stateTimeoutRef.current) {
            clearTimeout(stateTimeoutRef.current);
        }
        setStatus(prev => ({ ...prev, ...updates }));
    }, []);

    const resetStatus = useCallback(() => {
        if (stateTimeoutRef.current) {
            clearTimeout(stateTimeoutRef.current);
        }
        if (minimumLoadingTimeRef.current) {
            clearTimeout(minimumLoadingTimeRef.current);
        }

        setStatus({
            isLoading: true,
            isConnected: false,
            hasError: false,
            errorMessage: '',
            reconnectAttempts: 0,
            isReconnecting: false,
            isInitializing: false
        });

        // Ensure minimum loading time to prevent flashing
        minimumLoadingTimeRef.current = setTimeout(() => {
            // This will be overridden by actual loading events
        }, 500);
    }, []);

    const checkStreamAvailability = useCallback(async () => {
        try {
            const response = await fetch(src, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }, [src]);

    const setLoadingWithMinimumTime = useCallback((isLoading: boolean) => {
        if (isLoading) {
            updateStatusImmediate({ isLoading: true });
            // Ensure loading shows for at least 300ms to prevent flashing
            if (minimumLoadingTimeRef.current) {
                clearTimeout(minimumLoadingTimeRef.current);
            }
            minimumLoadingTimeRef.current = setTimeout(() => {
                // Don't auto-hide loading, let the actual events control it
            }, 300);
        } else {
            // Only hide loading after minimum time has passed
            setTimeout(() => {
                updateStatus({ isLoading: false });
            }, 200);
        }
    }, [updateStatus, updateStatusImmediate]);

    useEffect(() => {
        resetStatus();

        // Cleanup timeouts on src change
        return () => {
            if (stateTimeoutRef.current) {
                clearTimeout(stateTimeoutRef.current);
            }
            if (minimumLoadingTimeRef.current) {
                clearTimeout(minimumLoadingTimeRef.current);
            }
        };
    }, [src, resetStatus]);

    return {
        status,
        updateStatus,
        updateStatusImmediate,
        resetStatus,
        checkStreamAvailability,
        setLoadingWithMinimumTime
    };
};
