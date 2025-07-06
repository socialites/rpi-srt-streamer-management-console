import { a, useTransition } from '@react-spring/web'
import { useAtom } from 'jotai'
import { CheckIcon, PlusIcon } from 'lucide-react'
import { useCallback, useState } from 'preact/hooks'
import { Checkbox, RadioGroup } from 'radix-ui'
import { Slide, toast, ToastContainer } from 'react-toastify'
import './app.css'
import { Button } from './components/button'
import { HostnameButton } from './components/HostnameButton'
import { filterAtom, filteredAtom, hostnamesAtom, showDetailedStatsAtom, useReducerAtom } from './state'
import type { FilterStates, SystemStatus } from './types'

const reducer = (state: SystemStatus[], action: { type: 'add' | 'remove'; hostname?: string }) => {
  if (action.type === 'add' && action.hostname) {
    if (state.find(h => h.hostname === action.hostname)) {
      toast.error(`Hostname "${action.hostname}" already exists`)
      return state
    }
    toast.success(`Hostname "${action.hostname}" added`)
    return [...state, { hostname: action.hostname, ip: '', network_watcher: '', srt_streamer: '' }]
  }
  if (action.type === 'remove' && action.hostname) {
    if (!state.find(h => h.hostname === action.hostname)) {
      toast.error(`Hostname "${action.hostname}" not found`)
      return state
    }
    toast.success(`Hostname "${action.hostname}" removed`)
    return state.filter(h => h.hostname !== action.hostname)
  }
  return state
}

export function App() {
  const [_hostnames, dispatch] = useReducerAtom(hostnamesAtom, reducer)
  const [inputValue, setInputValue] = useState('')

  return (
    <div className='flex flex-col gap-4 items-center justify-center w-full max-w-md'>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Slide}
        />
      <h1 class="text-4xl font-bold">Stream Connections</h1>
      <div className="flex flex-row gap-2.5">
        <input
          className="box-border inline-flex h-auto w-full appearance-none items-center justify-center rounded bg-black/60 px-2.5 text-[15px] leading-none text-white shadow-[0_0_0_1px] shadow-black outline-none selection:bg-black selection:text-white hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
          type="text"
          placeholder="Add a hostname"
          value={inputValue}
          onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
        />
        <Button
        className='bg-green-600 hover:bg-green-700 cursor-pointer p-2 px-4 rounded-md h-full w-auto'
        onClick={() => {
          if (inputValue.trim()) {
            dispatch({ type: 'add', hostname: inputValue.trim() })
            setInputValue('')
          }
        }}><PlusIcon /></Button>
      </div>
      <Filter />
      <div className='flex flex-col gap-2.5 mt-8 w-full h-full'>
        <Filtered />
      </div>
    </div>
  )
}

const Filtered = () => {
    const [hostnames] = useAtom(filteredAtom)
    const [_hostnames, setHostnames] = useAtom(hostnamesAtom)

    const remove = useCallback((hostname: string) => {
        setHostnames(prev => prev.filter(h => h.hostname !== hostname))
    }, [setHostnames])

    const transitions = useTransition(hostnames, {
      keys: system => system.hostname,
      from: { opacity: 0, height: 0 },
      enter: { opacity: 1, height: 'auto' },
      leave: { opacity: 0, height: 0 },
    })

    if (hostnames.length === 0) {
        return <div className='w-full h-full flex items-center justify-center'>
            <p className='text-white text-sm font-bold'>No hostnames found</p>
        </div>
    }

    return transitions((style, system) =>
      <a.div className="w-full" style={style}>
        <HostnameButton
          key={system.hostname}
          hostname={system.hostname}
          remove={() => remove(system.hostname)}
        />
      </a.div>
    )
}

const Filter = () => {
    const [filter, setFilter] = useAtom(filterAtom)
    const [showDetailedStats, setShowDetailedStats] = useAtom(showDetailedStatsAtom)

    const handleToggleShowDetailedStats = useCallback(() => {
        setShowDetailedStats(!showDetailedStats)
    }, [showDetailedStats, setShowDetailedStats])

    return (
        <>
            <form>
                <RadioGroup.Root
                    className="flex flex-row gap-2.5"
                    defaultValue="all"
                    aria-label="View density"
                    value={filter}
                    onValueChange={(value) => setFilter(value as FilterStates)}
                >
                    <div className="flex items-center">
                        <RadioGroup.Item
                            className="size-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
                            value="all"
                            id="r1"
                        >
                            <RadioGroup.Indicator className="relative flex size-full items-center justify-center after:block after:size-[11px] after:rounded-full after:bg-violet-500" />
                        </RadioGroup.Item>
                        <label
                            className="pl-[15px] text-[15px] leading-none text-white"
                            htmlFor="r1"
                        >
                            All
                        </label>
                    </div>
                    <div className="flex items-center">
                        <RadioGroup.Item
                            className="size-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
                            value="online"
                            id="r2"
                        >
                            <RadioGroup.Indicator className="relative flex size-full items-center justify-center after:block after:size-[11px] after:rounded-full after:bg-violet-500" />
                        </RadioGroup.Item>
                        <label
                            className="pl-[15px] text-[15px] leading-none text-white"
                            htmlFor="r2"
                        >
                            Online
                        </label>
                    </div>
                    <div className="flex items-center">
                        <RadioGroup.Item
                            className="size-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
                            value="offline"
                            id="r3"
                        >
                            <RadioGroup.Indicator className="relative flex size-full items-center justify-center after:block after:size-[11px] after:rounded-full after:bg-violet-500" />
                        </RadioGroup.Item>
                        <label
                            className="pl-[15px] text-[15px] leading-none text-white"
                            htmlFor="r3"
                        >
                            Offline
                        </label>
                    </div>
                </RadioGroup.Root>
            </form>
            <div className="flex items-center">
			<Checkbox.Root
				className="flex size-6 appearance-none items-center justify-center rounded bg-white shadow-[0_2px_10px] shadow-black outline-none hover:bg-violet-300 focus:shadow-[0_0_0_2px_black]"
				id="showDetailedStats"
                checked={showDetailedStats}
                onCheckedChange={handleToggleShowDetailedStats}
			>
				<Checkbox.Indicator className="text-violet-500">
					<CheckIcon />
				</Checkbox.Indicator>
			</Checkbox.Root>
			<label
				className="pl-3.5 text-sm leading-none text-white"
				htmlFor="showDetailedStats"
			>
				Show Detailed Stats
			</label>
		</div>
        </>
    )
}