import { useEffect, useRef, useState } from 'preact/hooks';
import type { NetworkStatus as NetworkStatusType } from '../types';

export const useNetworkStatus = (hostname: string) => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatusType | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let retryTimeout: number | null = null;
        let isRetrying = false;

        const connectWebSocket = () => {
            if (isRetrying) return;

            // Create WebSocket connection
            const ws = new WebSocket(`ws://${hostname}/api/network/ws`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connection opened');
                setIsConnected(true);
                setError(null);
                isRetrying = false;
            };

            ws.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data) as NetworkStatusType;
                    setNetworkStatus(data);
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                    setError('Failed to parse network data');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('WebSocket connection error');
                setIsConnected(false);

                // Schedule retry if not already retrying
                if (!isRetrying) {
                    isRetrying = true;
                    retryTimeout = window.setTimeout(() => {
                        isRetrying = false;
                        connectWebSocket();
                    }, 1000);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed');
                setIsConnected(false);

                // Schedule retry if not already retrying
                if (!isRetrying) {
                    isRetrying = true;
                    retryTimeout = window.setTimeout(() => {
                        isRetrying = false;
                        connectWebSocket();
                    }, 1000);
                }
            };
        };

        // Start the initial connection
        connectWebSocket();

        // Cleanup function
        return () => {
            isRetrying = false;
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, []); // Empty dependency array - only run once

    return { networkStatus, isConnected, error };
}