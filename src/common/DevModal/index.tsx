import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import useGlobalData from '@/utils/hooks/useGlobalData'
import { Button, ButtonProps, Col, Modal, Row, Space } from 'antd'
import useLogger from '@/utils/logger'
import './index.scss'
import { uuid } from '@/utils/common'

type ContentRef = {
  toggle: (visible?: boolean) => void
}

type ContentProps = {
  exampleprop?: any
}

export type {
  ContentRef as DevModalRef,
  ContentProps as DevModalProps
}

const baseCls = 'dev-modal'
const Content = forwardRef<ContentRef, ContentProps>((props, ref) => {
  const { globalData, setGlobalData } = useGlobalData()
  const { logs, logger, clear } = useLogger()
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    toggle: toggleModalVisible
  }))

  const toggleModalVisible = (visible?: boolean) => {
    setVisible(s => visible ?? !s)
  }

  const testLogger = (type: 'logs' | 'test', payload?: any) => {
    switch (type) {
      case 'logs': {
        console.log('I: logs', logs)
        break
      }
      case 'test': {
        logger.debug(`${Date.now()} - ${uuid()}`)
        logger.info(`${Date.now()} - ${uuid()}`)
        logger.warn(`${Date.now()} - ${uuid()}`)
        logger.error(`${Date.now()} - ${uuid()}`)
        break
      }
      default:
        break
    }
  }

  // life cycle
  useEffect(() => {
    if (visible) {
      // ...
    }
  }, [visible])

  const DevBtn = (props: ButtonProps) => (
    <Button type='primary' size='small' ghost {...props} />
  )

  return (
    <Modal
      title='Develop'
      focusTriggerAfterClose={false}
      footer={null}
      open={visible}
      width={640}
      wrapClassName={baseCls}
      onCancel={() => setVisible(false)}
    >
      <div className={`${baseCls}-content`}>
        <div className={`${baseCls}-content-item`}>
          <div className={`${baseCls}-content-item-title`}>全局状态</div>
          <DevBtn onClick={() => console.log('I: globalData', globalData)}>全局状态</DevBtn>
          <DevBtn onClick={() => setGlobalData('reset')}>重置全局</DevBtn>
        </div>
        <div className={`${baseCls}-content-item`}>
          <div className={`${baseCls}-content-item-title`}>日志</div>
          <DevBtn onClick={() => testLogger('logs')}>logs</DevBtn>
          <DevBtn onClick={() => testLogger('test')}>logger</DevBtn>
        </div>
      </div>
    </Modal>
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export default Content