import { QuickModal, QuickModalInst, QuickModalRef } from '@/components/QuickModal/Base'
import { SysUtilContext } from '@/context/sysutil'
import { forwardRef, useContext, useEffect } from 'react'

interface IProps {
  tips?: string
  onDrop?: (res?: string) => void
}

const baseCls = 'modal-drop-interceptor'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const { listenTauri } = useContext(SysUtilContext)

  const Interceptor = (props: {
    onDrop?: (res?: string[]) => void
  }) => {
    useEffect(() => {
      const eFileDrop = listenTauri("tauri://file-drop", (e: any) => {
        if (Array.isArray(e.payload) && e.payload.length > 0) {
          props.onDrop?.(e.payload)
        }
      }, { capture: true })
      return () => { eFileDrop.then(i => i()) }
    }, [])
    return null
  }

  const onDrop = (res: any) => {
    props.onDrop?.(res);
    (ref as QuickModalInst).current?.toggle(false)
  }

  return (<QuickModal
    centered
    className={baseCls}
    classNames={{ content: `${baseCls}-content` }}
    destroyOnClose
    closeIcon={null}
    footer={null}
    ref={ref}
    width='80%'
    title={null}
  >
    <div className={`${baseCls}-tips`}>{props.tips ?? 'Drop File Here'}</div>
    <Interceptor onDrop={onDrop} />
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as DropInterceptor }
export type { IProps as DropInterceptorProps }