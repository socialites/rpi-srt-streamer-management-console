import type { SystemStatus } from '../types'

export async function getSystemStatus(hostname: string) {
    try {
        const response = await fetch(`http://${hostname}/api/status`)
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`)
        }
        return await response.json() as SystemStatus
    } catch (error) {
        console.error(error)
        throw new Error(`Failed to fetch system status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

export async function getHealth(hostname: string) {
    try {
        const response = await fetch(`http://${hostname}/health`)
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`)
            return false
        }
        return response.ok;
    } catch (error) {
        console.error(error)
        throw new Error(`Failed to fetch health: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}