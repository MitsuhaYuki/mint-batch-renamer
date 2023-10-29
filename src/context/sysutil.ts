import { uuid } from '@/utils/common'
import React from 'react'
import { listen } from '@tauri-apps/api/event'

type ListenEvtMap = Record<string, {
  unlisten: () => void
  handlers: {
    id: string
    handler: (e: any) => void
    options?: {
      capture?: boolean
    }
  }[]
}>

const eventRecords: ListenEvtMap = {}

const listenTauri = async (event: string, handler: (e: any) => void, options?: {
  capture?: boolean
}): Promise<() => void> => {
  const record = eventRecords[event] || { handlers: [] }
  const eventId = uuid()
  record.handlers.push({
    id: eventId,
    handler: handler,
    options: options
  })
  if (record.handlers.length === 1) {
    const unlisten = await listen(event, (data) => {
      console.log('I: TauriEvent', event, data)
      const handlers = record.handlers.slice().reverse()
      for (const handlerItem of handlers) {
        handlerItem.handler(data)
        if (handlerItem.options?.capture) {
          break
        }
      }
    })
    record.unlisten = unlisten
  }
  eventRecords[event] = record
  console.log('I: TauriEvent/REG', event, eventId, eventRecords)

  return () => {
    const eventItem = eventRecords[event]
    if (eventItem) {
      const handlerItem = eventItem.handlers.find(item => item.id === eventId)
      if (handlerItem) {
        eventItem.handlers.splice(eventItem.handlers.indexOf(handlerItem), 1)
        console.log('I: TauriEvent/UN_REG', event, eventId, eventRecords)

        if (eventItem.handlers.length === 0) {
          eventItem.unlisten()
          delete eventRecords[event]
        }
      }
    }
  }
}

type IContext = {
  listenTauri: (event: string, handler: (e: any) => void, options?: {
    capture?: boolean
  }) => Promise<() => void>
}

const initValue: IContext = {
  listenTauri
}

const Context = React.createContext<IContext>({} as any)

export {
  Context as SysUtilContext,
  initValue as SysUtilInitValue,
}

export type {
  IContext as ISysUtilContext,
}