import type { PrimitiveAtom } from 'jotai'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'preact/hooks'
import type { FilterStates, SystemStatus } from '../types'

export function useReducerAtom<Value, Action>(
    anAtom: PrimitiveAtom<Value>,
    reducer: (v: Value, a: Action) => Value,
  ) {
    const [state, setState] = useAtom(anAtom)
    const dispatch = useCallback(
      (action: Action) => setState((prev) => reducer(prev, action)),
      [setState, reducer],
    )
    return [state, dispatch] as const
}

export const hostnamesAtom = atomWithStorage<SystemStatus[]>(
    'hostnames',
    []
)

export const filteredAtom = atom<SystemStatus[]>((get) => {
    const filter = get(filterAtom)
    const hostnames = get(hostnamesAtom)

    if (filter === 'all'){
        return hostnames
    } else if (filter === 'online'){
        return hostnames.filter((system) => system.ip !== '')
    } else {
        return hostnames.filter((system) => system.ip === '')
    }
  })

export const filterAtom = atom<FilterStates>('all')

export const showDetailedStatsAtom = atomWithStorage<boolean>('showDetailedStats', true);