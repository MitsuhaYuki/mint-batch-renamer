import { message } from 'antd'
import { MessageType } from 'antd/es/message/interface'
import { Children, ReactElement, ReactNode, cloneElement, useMemo } from 'react'

/** UUID generator */
function uuid () {
  const s: string[] = []
  const hexDigits = '0123456789abcdef'.split('')
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits[Math.floor(Math.random() * 0x10)]
  }
  // bits 12-15 of the time_hi_and_version field to 0010
  s[14] = '4'
  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[19] = hexDigits[(s[19] as any & 0x3) | 0x8]
  s[8] = s[13] = s[18] = s[23] = '-'
  return s.join('')
}

function checkOsError (e: any) {
  const eStr = `${e}`
  const eNum = eStr.match(/\(os error \d+\)$/)?.[0]
  return eNum ? Number(eNum.slice(10, -1)) : undefined
}

function exportJsonFile (content: Record<string, any>, fileName: string = 'config.json') {
  const data = JSON.stringify(content, undefined, 2)
  const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data)
  const link = document.createElement('a')
  link.href = uri
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

type MessageLevel = 'info' | 'success' | 'error' | 'warning' | 'loading'
type MessageFunc = (content: ReactNode, duration?: number, onClose?: () => void) => MessageType
const useKeyMessage = (key: string): [Record<MessageLevel, MessageFunc>, ReactElement] => {
  const [api, ctx] = message.useMessage()

  const apiWrapped = useMemo(() => {
    const open = (level: MessageLevel) => (
      (content: any, duration = 3, onClose?: any) =>
        api[level]({ key, content, duration, onClose })
    )
    return {
      info: open('info'),
      success: open('success'),
      error: open('error'),
      warning: open('warning'),
      loading: open('loading')
    }
  }, [api])

  return [apiWrapped, ctx]
}

const reverseFooter = (i: any) => cloneElement(i, {
  children: Children.toArray(i.props.children).reverse()
})

export {
  uuid,
  exportJsonFile,
  useKeyMessage,
  checkOsError,
  reverseFooter
}