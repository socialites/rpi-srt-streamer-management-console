import type { PrimitiveAtom } from 'jotai';

export type FilterStates = 'all' | 'offline' | 'online'

export type SystemStatus = {
    hostname: string;
    ip: string;
    network_watcher: string;
    srt_streamer: string;
}

export type RemoveFn = (item: PrimitiveAtom<SystemStatus>) => void


export interface NetworkStatus {
    [key: string]: { in_kbps: number, out_kbps: number };
}
