import { Button, Drawer, Space, message } from 'antd'
import { ClearOutlined, CloseOutlined, ExportOutlined } from '@ant-design/icons'
import { IConfigState } from '@/context/config'
import { ILogItem, ILogger } from '@/types/console'
import { cloneElement, forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { exportJsonFile } from '@/utils/common'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'
import { MultiLangProps } from '@/types/mlang'

export type IRef = {
  toggle: (visible?: boolean) => void
}

export interface IProps extends MultiLangProps {
  config: IConfigState
  console: {
    logs: ILogItem[]
    logger: ILogger
    clear: () => void
  }
}

const baseCls = 'console'
const Content = forwardRef<IRef, IProps>((props, ref) => {
  const { config, console: con } = props
  const { fmlText } = useMultiLang(config, baseCls, props.inheritName)
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    toggle: toggleVisible
  }))

  const toggleVisible = (visible?: boolean) => {
    setVisible(s => visible ?? !s)
  }

  const renderExtra = useMemo(() => ([
    {
      name: fmlText('export'),
      icon: <ExportOutlined />,
      onClick: () => exportJsonFile(con.logs),
    },
    {
      name: fmlText('common:clear'),
      icon: <ClearOutlined />,
      onClick: () => {
        if (con.logs.length > 1) {
          con.clear()
          message.success(fmlText('clear_ok'))
        } else {
          message.warning(fmlText('clear_empty'))
        }
      },
    },
    {
      name: fmlText('common:close'),
      icon: <CloseOutlined />,
      onClick: () => toggleVisible(false),
    },
  ].map((v, k) => (
    <Button
      icon={cloneElement(v.icon, { className: `${baseCls}-icon`, title: v.name })}
      key={k}
      shape='circle'
      title={v.name}
      type='text'
      onClick={v.onClick}
    />
  ))), [fmlText, con.logs])

  const renderLogs = useMemo(() => {
    return <div className={`${baseCls}-log`}>
      {con.logs.map((value, index) => (
        <div className={`${baseCls}-log-item`} key={con.logs.length - index}>
          <div className={`${baseCls}-log-level ${baseCls}-log-level-${value.levelText.toLowerCase()}`}>{value.levelText}</div>
          <div className={`${baseCls}-log-content`}>: {value.content}</div>
        </div>
      ))}
    </div>
  }, [con.logs])

  return (
    <Drawer
      closeIcon={null}
      classNames={{
        body: `${baseCls}-drawer-body`
      }}
      title={fmlText('title')}
      placement="bottom"
      open={visible}
      extra={<Space>{renderExtra}</Space>}
      onClose={() => toggleVisible(false)}
    >
      {renderLogs}
    </Drawer>
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as Console }
export type {
  IProps as ConsoleProps,
  IRef as ConsoleRef
}