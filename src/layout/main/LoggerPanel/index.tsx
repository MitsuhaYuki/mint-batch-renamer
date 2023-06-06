import { FC, MouseEvent } from 'react'
import { Button, Collapse, message } from 'antd'
import { useThrottleFn } from 'ahooks'
import useLogger from '@/utils/logger'
import './index.scss'

export type ContentProps = {
  example?: any
}
const baseCls = 'output'
const Content: FC<ContentProps> = (props) => {
  const { logs, clear } = useLogger()

  const { run: throttledClear } = useThrottleFn(() => {
    if (logs.length > 1) clear()
    message.success('日志已清空')
  }, {
    wait: 750,
    trailing: false
  })

  const handleClickExtraBtn = (e: MouseEvent<any>, type: string) => {
    e.stopPropagation()
    e.preventDefault()
    switch (type) {
      case 'clear':
        throttledClear()
        break
      default:
        message.error('操作未定义')
        break
    }
  }

  const renderExtra = () => {
    return (
      <div className={`${baseCls}-extra`}>
        <div className={`${baseCls}-extra-btns`}>
          <Button type='text' size='small' onClick={e => handleClickExtraBtn(e, 'clear')}>清空</Button>
        </div>
        <div className={`${baseCls}-extra-count`}>{logs.length ? `(${logs.length})` : ''}</div>
      </div >
    )
  }

  return (<div className={baseCls}>
    <Collapse className={`${baseCls}-collapse`} size='small' bordered={false}>
      <Collapse.Panel header='Console' extra={renderExtra()} key='1'>
        {logs.map((value, index) => (
          <div className={`${baseCls}-log`} key={logs.length - index}>
            <div className={`${baseCls}-log-level ${baseCls}-log-level-${value.levelText.toLowerCase()}`}>{value.levelText}</div>
            <div className={`${baseCls}-log-content`}>: {value.content}</div>
          </div>
        ))}
      </Collapse.Panel>
    </Collapse>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content