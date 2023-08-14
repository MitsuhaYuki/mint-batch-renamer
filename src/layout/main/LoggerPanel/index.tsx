import { FC, MouseEvent, useMemo } from 'react'
import { Button, Collapse, CollapseProps, message } from 'antd'
import { useThrottleFn } from 'ahooks'
import useLogger from '@/utils/logger'
import './index.scss'

export type ContentProps = {}
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

  const renderLog = useMemo(() => {
    return logs.map((value, index) => (
      <div className={`${baseCls}-log`} key={logs.length - index}>
        <div className={`${baseCls}-log-level ${baseCls}-log-level-${value.levelText.toLowerCase()}`}>{value.levelText}</div>
        <div className={`${baseCls}-log-content`}>: {value.content}</div>
      </div>
    ))
  }, [logs])

  const renderExtra = useMemo(() => {
    return (
      <div className={`${baseCls}-extra`}>
        <div className={`${baseCls}-extra-btns`}>
          <Button type='text' size='small' onClick={e => handleClickExtraBtn(e, 'clear')}>清空</Button>
        </div>
        <div className={`${baseCls}-extra-count`}>{logs.length ? `(${logs.length})` : ''}</div>
      </div >
    )
  }, [logs])

  const contents: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Console',
      extra: renderExtra,
      children: renderLog,
    }
  ]

  return (<div className={baseCls}>
    <Collapse
      bordered={false}
      className={`${baseCls}-collapse`}
      items={contents}
      size='small'
    />
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content