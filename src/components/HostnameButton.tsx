import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { useSetAtom } from 'jotai'
import { Trash2Icon } from 'lucide-react'
import { useEffect } from 'preact/hooks'
import { toast, type ToastContentProps } from 'react-toastify'
import { getHealth, getSystemStatus } from '../apis'
import { hostnamesAtom } from '../state'

export function HostnameButton({
    hostname,
    remove
}: {
    hostname: string,
    remove: () => void
}) {
    const setHostnames = useSetAtom(hostnamesAtom)

    const { data: isOnline, isLoading: isOnlineLoading, isError: isOnlineError, error: onlineError } = useQuery({
        queryKey: ['isOnline', hostname],
        queryFn: () => getHealth(hostname),
        refetchInterval: 5000,
        placeholderData: false,
        retry: true,
        retryDelay: 1000,
    })

    const {data: systemStatus, isLoading: isSystemStatusLoading, isError: isSystemStatusError, error: systemStatusError} = useQuery({
        queryKey: ['hostname', hostname],
        queryFn: () => getSystemStatus(hostname),
        refetchInterval: 5000,
        placeholderData: {
            hostname: hostname,
            ip: '',
            network_watcher: '',
            srt_streamer: '',
        },
        retry: true,
        retryDelay: 1000,
    })

    const promptDelete = () => {
        toast(<SplitButtons
            onConfirm={() => {
                remove()
                toast.dismiss('delete-prompt')
            }}
            onCancel={() => toast.dismiss('delete-prompt')}
            title="Delete"
            message={`Are you sure you want to delete "${hostname}"?`} />, {
                toastId: 'delete-prompt',
                type: 'error',
                closeButton: false,
                closeOnClick: false,
                className: 'p-0 w-[400px] border border-red-600/40',
            }
        )
    }

    // Update the hostnamesAtom when the systemStatus changes
    useEffect(() => {
        setHostnames(prev => prev.map(system => system.hostname === hostname && systemStatus ? systemStatus : system))
    }, [systemStatus])

  return (
    <div className='flex flex-row gap-2.5 items-center justify-between w-full h-full'>
        <button class={classNames(
            'cursor-pointer items-center justify-center p-3 rounded-md flex flex-col gap-2.5 w-full',
            (isOnlineLoading || isSystemStatusLoading) && 'bg-gray-500',
            (isOnlineError || isSystemStatusError) && 'bg-red-500',
            (isOnline && !isOnlineLoading && !isOnlineLoading) ? 'bg-green-500' : 'bg-red-500'
        )}
        onClick={() => {
            if (isOnline) {
                window.location.href = `http://${hostname}/`
            } else {
                toast.error(`${hostname} is offline`)
            }
        }}>
            <div class="flex flex-row gap-2.5 items-center justify-between w-full">
                <div className='flex flex-col items-start justify-between w-full'>
                    <span class="text-white text-2xl font-bold">{hostname.toUpperCase()}</span>
                    {systemStatus && systemStatus.ip && <div className='flex flex-col'>
                        {systemStatus && systemStatus.ip && <span className='text-white text-sm flex flex-row items-start w-full'>{systemStatus.ip.substring(0, 32) + '...'}</span>}
                        {systemStatus && systemStatus.network_watcher && <span className='text-white text-sm flex flex-row items-center w-full justify-start'>Network Watcher:&nbsp;<strong>{systemStatus.network_watcher}</strong></span>}
                        {systemStatus && systemStatus.srt_streamer && <span className='text-white text-sm flex flex-row items-center w-full justify-start'>SRT Streamer:&nbsp;<strong>{systemStatus.srt_streamer}</strong></span>}
                    </div>}
                </div>
                {isOnlineLoading || isSystemStatusLoading && <span>Loading...</span>}
                {isOnlineError || isSystemStatusError && <span>Error: {onlineError || systemStatusError}</span>}
                {!isOnlineLoading && !isOnlineError && <span class="font-bold">{isOnline ? 'Online' : 'Offline'}</span>}
            </div>
        </button>
        <button className='bg-red-500 hover:bg-red-600 cursor-pointer p-2 px-4 rounded-md h-full w-auto' onClick={promptDelete}><Trash2Icon /></button>
    </div>
  )
}

function SplitButtons({ onConfirm, onCancel, title, message }: Partial<ToastContentProps> & { onConfirm: () => void, onCancel: () => void, title: string, message: string }) {
    return (
      // using a grid with 3 columns
      <div className="grid grid-cols-[1fr_1px_80px] w-full">
        <div className="flex flex-col p-4">
          <h3 className="text-white text-sm font-semibold">{title}</h3>
          <p className="text-sm">{message}</p>
        </div>
        {/* that's the vertical line which separate the text and the buttons*/}
        <div className="bg-white/10 h-full" />
        <div className="grid grid-rows-[1fr_1px_1fr] h-full">
          {/*specifying a custom closure reason that can be used with the onClose callback*/}
          <button onClick={() => onConfirm()} className="text-red-600">
            Confirm
          </button>
          <div className="bg-white/10 w-full" />
          {/*specifying a custom closure reason that can be used with the onClose callback*/}
          <button onClick={() => onCancel()}>Cancel</button>
        </div>
      </div>
    );
  }